"""
preprocessor.py — Cleaning data, standardisasi kolom, dan derived columns.
"""
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from config import COMPOSITE_WEIGHTS, CLUSTERING_VARS


def _clean_colnames(df: pd.DataFrame) -> pd.DataFrame:
    """Hapus newline dari nama kolom agar lebih mudah dirujuk."""
    df.columns = [str(c).replace("\n", "\n") for c in df.columns]
    return df


def clean_master(df: pd.DataFrame) -> pd.DataFrame:
    """
    Bersihkan sheet master_2024.
    - Filter hanya Kabupaten/Kota (buang baris Provinsi & footer)
    - Standardisasi Kode BPS jadi string 4 digit
    - Tambah Skor Komposit & flag Prioritas Intervensi
    """
    df = df.copy()
    df = df[df["Tipe"].isin(["Kabupaten", "Kota"])].copy()
    df["Kode BPS"] = df["Kode BPS"].astype(str).str.strip().str.zfill(4)
    df["Nama"] = df["Nama Kab/Kota"].str.strip()
    # Singkat nama: "Kab. Bogor" → "Bogor", "Kota Bandung" → "Bandung"
    df["Nama Pendek"] = (
        df["Nama Kab/Kota"]
        .str.replace(r"^Kab\.\s*", "", regex=True)
        .str.replace(r"^Kota\s*", "", regex=True)
        .str.strip()
    )
    df = df.reset_index(drop=True)
    df["Skor Komposit"] = _compute_composite(df)
    q25 = df["Skor Komposit"].quantile(0.25)
    df["Prioritas Intervensi"] = df["Skor Komposit"] <= q25
    return df


def _compute_composite(df: pd.DataFrame) -> pd.Series:
    """Skor komposit 0–100 berbasis weighted MinMax dari 6 variabel."""
    scaler = MinMaxScaler()
    score = pd.Series(0.0, index=df.index)
    for col, weight in COMPOSITE_WEIGHTS.items():
        if col not in df.columns:
            continue
        vals = df[[col]].fillna(df[col].median())
        norm = scaler.fit_transform(vals).flatten()
        if weight < 0:
            norm = 1 - norm
        score += abs(weight) * norm
    return (score * 100).round(2)


def clean_tren(df: pd.DataFrame) -> pd.DataFrame:
    """Bersihkan sheet tren_long_format."""
    df = df.copy()
    df = df[df["tipe"].isin(["Kabupaten", "Kota"])].copy()
    df = df.dropna(subset=["indikator", "nilai"])
    df["kode_bps"] = df["kode_bps"].astype(str).str.strip().str.zfill(4)
    df["tahun"] = df["tahun"].astype(int)
    df["nilai"] = pd.to_numeric(df["nilai"], errors="coerce")
    return df.reset_index(drop=True)


def clean_tren_all(df: pd.DataFrame) -> pd.DataFrame:
    """Bersihkan sheet tren_long_format, termasuk baris provinsi (Jawa Barat)."""
    df = df.copy()
    df = df.dropna(subset=["indikator", "nilai"])
    df["kode_bps"] = df["kode_bps"].astype(str).str.strip()
    df["tahun"] = df["tahun"].astype(int)
    df["nilai"] = pd.to_numeric(df["nilai"], errors="coerce")
    return df.reset_index(drop=True)


def clean_demografi(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df[df["Kode BPS"].astype(str).str.match(r"^\d{4}$")].copy()
    df["Kode BPS"] = df["Kode BPS"].astype(str).str.zfill(4)
    return df.reset_index(drop=True)


def clean_kesejahteraan(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df[df["Kode BPS"].astype(str).str.match(r"^\d{4}$")].copy()
    df["Kode BPS"] = df["Kode BPS"].astype(str).str.zfill(4)
    return df.reset_index(drop=True)


def clean_ekonomi(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df[df["Kode BPS"].astype(str).str.match(r"^\d{4}$")].copy()
    df["Kode BPS"] = df["Kode BPS"].astype(str).str.zfill(4)
    return df.reset_index(drop=True)


def clean_infrastruktur(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df[df["Kode BPS"].astype(str).str.match(r"^\d{4}$")].copy()
    df["Kode BPS"] = df["Kode BPS"].astype(str).str.zfill(4)
    return df.reset_index(drop=True)


def get_prov_avg_tren(tren_df: pd.DataFrame, indicator: str) -> pd.DataFrame:
    """Rata-rata provinsi per tahun untuk suatu indikator."""
    filtered = tren_df[tren_df["indikator"] == indicator]
    return (
        filtered.groupby("tahun")["nilai"]
        .mean()
        .reset_index()
        .rename(columns={"nilai": "Rata-rata Jabar"})
    )
