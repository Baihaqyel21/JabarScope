import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from scipy import stats

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.fastapi_loader import load_all_sheets, load_geojson
from utils.preprocessor import (
    clean_master, clean_tren, clean_demografi,
    clean_kesejahteraan, clean_ekonomi, clean_infrastruktur
)
from analysis.clustering import (
    prepare_data, compute_elbow, run_kmeans_full,
    cluster_profiles, normalize_profiles, policy_recommendations,
    _serialize
)
import config

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _safe(df):
    """Replace NaN/Inf with None for JSON serialization."""
    return df.replace({np.nan: None, np.inf: None, -np.inf: None})


def get_all_data():
    sheets  = load_all_sheets()
    geojson = load_geojson()
    master  = clean_master(sheets["master_2024"])
    tren    = clean_tren(sheets["tren_long_format"])
    demografi    = clean_demografi(sheets["demografi"])
    kesej        = clean_kesejahteraan(sheets["kesejahteraan"])
    ekonomi      = clean_ekonomi(sheets["ekonomi"])
    infra        = clean_infrastruktur(sheets["infrastruktur"])
    return master, tren, demografi, kesej, ekonomi, infra, geojson


# ── Linear Trend Forecast helper ──────────────────────────────────────────────
def linear_forecast(series: pd.Series, years: list[int], horizon: int = 4) -> dict:
    x = np.array(years, dtype=float)
    y = series.values.astype(float)
    mask = ~np.isnan(y)
    x, y = x[mask], y[mask]
    if len(x) < 2:
        return {"points": [], "metadata": {}}
    slope, intercept, r_value, p_value, std_err = stats.linregress(x, y)
    last_year = int(x[-1])
    forecast_years = list(range(last_year + 1, last_year + 1 + horizon))
    forecast_vals  = [float(slope * yr + intercept) for yr in forecast_years]
    n = len(x)
    x_mean = x.mean()
    se_pred = std_err * np.sqrt(1 + 1/n + (np.array(forecast_years, dtype=float) - x_mean)**2 / ((x - x_mean)**2).sum())
    ci95 = (1.96 * se_pred).tolist()
    
    points = [
        {"tahun": int(yr), "nilai": round(v, 4), "nilai_lower": round(v - ci, 4),
         "nilai_upper": round(v + ci, 4), "is_forecast": True}
        for yr, v, ci in zip(forecast_years, forecast_vals, ci95)
    ]
    
    return {
        "points": points,
        "metadata": {
            "r_squared": round(float(r_value**2), 4),
            "slope": round(float(slope), 4),
            "intercept": round(float(intercept), 4),
            "p_value": round(float(p_value), 4),
            "n_samples": int(n),
            "last_value": round(float(y[-1]), 4)
        }
    }


def build_forecast_series(tren: pd.DataFrame, indikator: str, col_name: str, horizon: int = 4) -> dict:
    sub = (
        tren[tren["indikator"] == indikator]
        .groupby("tahun")["nilai"].mean()
        .reset_index()
    )
    if len(sub) < 2:
        return {"data": [], "metadata": {}}
    years  = sub["tahun"].tolist()
    series = sub["nilai"]
    hist = [
        {"tahun": int(yr), "nilai": round(float(v), 4), "is_forecast": False}
        for yr, v in zip(years, series.values)
    ]
    
    forecast_res = linear_forecast(series, years, horizon=horizon)
    return {
        "data": hist + forecast_res["points"],
        "metadata": forecast_res["metadata"]
    }


# ── Overview ──────────────────────────────────────────────────────────────────
@app.get("/api/overview")
def get_overview():
    master, tren, *_ = get_all_data()
    master_clean = _safe(master)
    total_pop   = float(master["Penduduk\n(Ribu)"].sum())
    avg_ipm     = float(master["IPM 2024"].mean())
    avg_miskin  = float(master["% Miskin\n2024"].mean())
    avg_tpt     = float(master["TPT 2024\n(%)"].mean())
    ranking = master[["Nama Pendek", "Skor Komposit", "Tipe"]].sort_values("Skor Komposit", ascending=False)
    return {
        "kpi": {
            "total_pop": total_pop,
            "avg_ipm": avg_ipm,
            "avg_miskin": avg_miskin,
            "avg_tpt": avg_tpt,
            "n_daerah": len(master)
        },
        "data": master_clean.to_dict(orient="records"),
        "ranking": _safe(ranking).to_dict(orient="records"),
    }


# ── Demografi ─────────────────────────────────────────────────────────────────
@app.get("/api/demografi")
def get_demografi():
    master, tren, demografi, *_ = get_all_data()
    tpt_trend = (
        tren[tren["indikator"] == "TPT_Agustus"]
        .groupby("tahun")["nilai"].mean().reset_index()
        .rename(columns={"nilai": "TPT"})
    )
    tpak_trend = (
        tren[tren["indikator"] == "TPAK_Agustus"]
        .groupby("tahun")["nilai"].mean().reset_index()
        .rename(columns={"nilai": "TPAK"})
    )
    umk_trend = (
        tren[tren["indikator"] == "UMK_Rp"]
        .groupby("tahun")["nilai"].mean().reset_index()
        .rename(columns={"nilai": "UMK"})
    )
    master_cols = master[["Kode BPS", "Nama Pendek", "Tipe",
                           "TPT 2024\n(%)", "TPAK 2024\n(%)",
                           "UMK 2024\n(Rp)", "Penduduk\n(Ribu)",
                           "Skor Komposit"]].copy()
    master_cols.columns = ["Kode BPS", "nama", "tipe", "tpt", "tpak", "umk", "penduduk", "skor_komposit"]
    return {
        "tpt_trend":  _safe(tpt_trend).to_dict(orient="records"),
        "tpak_trend": _safe(tpak_trend).to_dict(orient="records"),
        "umk_trend":  _safe(umk_trend).to_dict(orient="records"),
        "kabkota":    _safe(master_cols).to_dict(orient="records"),
        "forecast": {
            "tpt":  build_forecast_series(tren, "TPT_Agustus", "TPT"),
            "tpak": build_forecast_series(tren, "TPAK_Agustus", "TPAK"),
            "umk":  build_forecast_series(tren, "UMK_Rp", "UMK"),
        },
    }


# ── Kesejahteraan ─────────────────────────────────────────────────────────────
@app.get("/api/kesejahteraan")
def get_kesejahteraan():
    master, tren, _, kesej, *_ = get_all_data()
    ipm_trend = (
        tren[tren["indikator"] == "IPM"]
        .groupby("tahun")["nilai"].mean().reset_index()
        .rename(columns={"nilai": "IPM"})
    )
    miskin_trend = (
        tren[tren["indikator"] == "PCT_Miskin"]
        .groupby("tahun")["nilai"].mean().reset_index()
        .rename(columns={"nilai": "Kemiskinan"})
    )
    kabkota = master[[
        "Kode BPS", "Nama Pendek", "Tipe",
        "IPM 2024", "% Miskin\n2024",
        "Sanitasi\nLayak 2024 (%)", "Air Minum\nLayak 2024 (%)",
        "Skor Komposit"
    ]].copy()
    kabkota.columns = ["Kode BPS", "nama", "tipe", "ipm", "pct_miskin", "sanitasi", "air_minum", "skor_komposit"]
    return {
        "ipm_trend":    _safe(ipm_trend).to_dict(orient="records"),
        "miskin_trend": _safe(miskin_trend).to_dict(orient="records"),
        "kabkota":      _safe(kabkota).to_dict(orient="records"),
        "forecast": {
            "ipm":    build_forecast_series(tren, "IPM", "IPM"),
            "miskin": build_forecast_series(tren, "PCT_Miskin", "Kemiskinan"),
        },
    }


# ── Ekonomi ───────────────────────────────────────────────────────────────────
@app.get("/api/ekonomi")
def get_ekonomi():
    master, tren, *_ = get_all_data()
    pdrb_trend = (
        tren[tren["indikator"] == "PDRB_PerKapita_ADHB_RibuRp"]
        .groupby("tahun")["nilai"].mean().reset_index()
        .rename(columns={"nilai": "PDRB_Kapita"})
    )
    growth_trend = (
        tren[tren["indikator"] == "Laju_Pertumbuhan_PDRB_ADHK"]
        .groupby("tahun")["nilai"].mean().reset_index()
        .rename(columns={"nilai": "Pertumbuhan"})
    )
    kabkota = master[[
        "Kode BPS", "Nama Pendek", "Tipe",
        "PDRB/Kapita\n2024 (Ribu Rp)",
        "Pertumbuhan\nPDRB 2024 (%)",
        "Skor Komposit"
    ]].copy()
    kabkota.columns = ["Kode BPS", "nama", "tipe", "pdrb_kapita", "pertumbuhan_pdrb", "skor_komposit"]
    return {
        "pdrb_trend":   _safe(pdrb_trend).to_dict(orient="records"),
        "growth_trend": _safe(growth_trend).to_dict(orient="records"),
        "kabkota":      _safe(kabkota).to_dict(orient="records"),
        "forecast": {
            "pdrb":   build_forecast_series(tren, "PDRB_PerKapita_ADHB_RibuRp", "PDRB_Kapita"),
            "growth": build_forecast_series(tren, "Laju_Pertumbuhan_PDRB_ADHK", "Pertumbuhan"),
        },
    }


# ── Infrastruktur ─────────────────────────────────────────────────────────────
@app.get("/api/infrastruktur")
def get_infrastruktur():
    master, tren, *_ = get_all_data()
    kabkota = master[[
        "Kode BPS", "Nama Pendek", "Tipe",
        "Sanitasi\nLayak 2024 (%)",
        "Air Minum\nLayak 2024 (%)",
        "Jalan Baik\n(km)",
        "Jalan Sedang\n(km)",
        "Jalan Rusak\n(km)",
        "Jalan Rusak\nBerat (km)",
        "% Jalan\nBaik",
        "Skor Komposit",
    ]].copy()
    kabkota.columns = [
        "Kode BPS", "nama", "tipe",
        "sanitasi", "air_minum",
        "jln_baik", "jln_sedang", "jln_rusak", "jln_rusak_berat",
        "pct_jln_baik", "skor_komposit"
    ]
    return {
        "kabkota": _safe(kabkota).to_dict(orient="records"),
        "forecast": {
            "sanitasi": build_forecast_series(tren, "Sanitasi_Layak_Pct", "Sanitasi"),
            "air":      build_forecast_series(tren, "Air_Minum_Layak_Pct", "Air"),
        },
    }


# ── Clustering (Rank-Composite 1D, Silhouette Optimized) ──────────────────────
@app.get("/api/clustering")
def get_clustering():
    import warnings
    warnings.filterwarnings("ignore")
    from sklearn.preprocessing import MinMaxScaler
    from sklearn.decomposition import PCA

    master, *_ = get_all_data()

    # 1. Clustering in 1D rank-composite space (silhouette-optimized)
    df_clean, X_1d = prepare_data(master)
    X_bytes = _serialize(X_1d)
    labels, best_k, silhouette = run_kmeans_full(X_bytes)

    # 2. PCA-2D on original 6 features for visualization scatter
    df_raw = df_clean[config.CLUSTERING_VARS].values
    X_raw  = MinMaxScaler().fit_transform(df_raw)
    pca2   = PCA(n_components=2, random_state=42)
    coords = pca2.fit_transform(X_raw)
    var_ratio = pca2.explained_variance_ratio_

    df_clean = df_clean.copy()
    df_clean["Klaster"]     = [f"Klaster {l+1}" for l in labels]
    df_clean["Klaster_num"] = [int(l+1) for l in labels]
    df_clean["PC1"] = coords[:, 0].tolist()
    df_clean["PC2"] = coords[:, 1].tolist()

    profiles = cluster_profiles(df_clean, labels)
    recs     = policy_recommendations(profiles)

    summary = (
        df_clean.groupby("Klaster")["Nama Kab/Kota"]
        .apply(list)
        .reset_index()
        .rename(columns={"Nama Kab/Kota": "anggota"})
    )

    return {
        "data":       _safe(df_clean[["Nama Kab/Kota", "Klaster", "Klaster_num", "PC1", "PC2"]]).to_dict(orient="records"),
        "profiles":   _safe(profiles).to_dict(orient="records"),
        "recs":       recs,
        "summary":    summary.to_dict(orient="records"),
        "var_ratio":  [float(v) for v in var_ratio],
        "silhouette": round(float(silhouette), 4),
        "best_k":     int(best_k),
    }


# ── Forecasting (standalone) ───────────────────────────────────────────────────
@app.get("/api/forecasting")
def get_forecasting():
    _, tren, *_ = get_all_data()
    INDICATORS = {
        "IPM":        "IPM",
        "Kemiskinan": "PCT_Miskin",
        "PDRB":       "PDRB_PerKapita_ADHB_RibuRp",
        "TPT":        "TPT_Agustus",
        "TPAK":       "TPAK_Agustus",
        "UMK":        "UMK_Rp",
    }
    return {label: build_forecast_series(tren, ind, label) for label, ind in INDICATORS.items()}


# ── GeoJSON ───────────────────────────────────────────────────────────────────
@app.get("/api/geojson")
def get_geojson():
    *_, geojson = get_all_data()
    return geojson
