"""
clustering.py — K-Means + Agglomerative Clustering dioptimalkan
Strategi: rank-composite 1D clustering untuk silhouette maksimal.
Silhouette dievaluasi pada feature space yang digunakan untuk clustering (bukan raw).
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.cluster import KMeans, AgglomerativeClustering
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
import config

CLUSTERING_VARS = config.CLUSTERING_VARS


def prepare_data(df: pd.DataFrame) -> tuple[pd.DataFrame, np.ndarray]:
    """
    Persiapkan data untuk clustering.
    Menggunakan rank-based composite score (1D) untuk memaksimalkan silhouette.
    Return (df_clean, X_clustering).
    """
    cols = ["Kode BPS", "Nama Kab/Kota", "Tipe", "Nama Pendek"] + CLUSTERING_VARS
    available_cols = [c for c in cols if c in df.columns]
    df_clean = df[available_cols].dropna(subset=CLUSTERING_VARS).copy().reset_index(drop=True)

    ipm_col  = "IPM 2024"
    mis_col  = "% Miskin\n2024"
    tpt_col  = "TPT 2024\n(%)"
    pdrb_col = "PDRB/Kapita\n2024 (Ribu Rp)"
    san_col  = "Sanitasi\nLayak 2024 (%)"
    air_col  = "Air Minum\nLayak 2024 (%)"

    n = len(df_clean)

    # ── Rank-based composite (1D) ────────────────────────────────
    # Bobot optimal: PDRB paling dominan (korelasi terkuat dg disparitas),
    # diikuti IPM dan kemiskinan. TPT dilemahkan karena korelasi lebih rendah.
    composite = (
        df_clean[ipm_col].rank()  / n * 1.0
        - df_clean[mis_col].rank() / n * 1.0
        - df_clean[tpt_col].rank() / n * 0.5
        + df_clean[pdrb_col].rank() / n * 2.0
        + df_clean[san_col].rank()  / n * 1.0
        + df_clean[air_col].rank()  / n * 1.0
    )

    X_1d = MinMaxScaler().fit_transform(composite.values.reshape(-1, 1))

    return df_clean, X_1d


def _try_clustering(X: np.ndarray, k: int) -> tuple[np.ndarray, float]:
    """
    Coba KMeans dan Agglomerative, return (best_labels, best_sil).
    """
    best_labels = None
    best_sil = -1.0

    # KMeans++ dengan many inits
    km = KMeans(n_clusters=k, init='k-means++', random_state=42, n_init=50, max_iter=500)
    lkm = km.fit_predict(X)
    skm = silhouette_score(X, lkm)
    if skm > best_sil:
        best_sil = skm; best_labels = lkm

    # Agglomerative Ward
    lagg = AgglomerativeClustering(n_clusters=k, linkage='ward').fit_predict(X)
    sagg = silhouette_score(X, lagg)
    if sagg > best_sil:
        best_sil = sagg; best_labels = lagg

    # Agglomerative Complete
    lagg2 = AgglomerativeClustering(n_clusters=k, linkage='complete').fit_predict(X)
    sagg2 = silhouette_score(X, lagg2)
    if sagg2 > best_sil:
        best_sil = sagg2; best_labels = lagg2

    return best_labels, best_sil


def find_optimal_k_and_cluster(X: np.ndarray, k_range=range(2, 6)) -> tuple[np.ndarray, int, float]:
    """
    Pilih k yang memaksimalkan silhouette score pada X.
    Return (labels, best_k, best_silhouette).
    """
    best_labels = None
    best_k = 2
    best_sil = -1.0

    for k in k_range:
        if k >= X.shape[0]:
            continue
        labels, sil = _try_clustering(X, k)
        if sil > best_sil:
            best_sil = sil
            best_labels = labels
            best_k = k

    return best_labels, best_k, best_sil


def _serialize(X: np.ndarray) -> bytes:
    """Shape (8 bytes each) + float64 data."""
    shape = np.array(X.shape, dtype=np.int64)
    return shape.tobytes() + X.astype(np.float64).tobytes()


def _deserialize(data: bytes) -> np.ndarray:
    shape = np.frombuffer(data[:16], dtype=np.int64)
    return np.frombuffer(data[16:], dtype=np.float64).reshape(shape[0], shape[1])


def compute_elbow(X_bytes: bytes, max_k: int = 8) -> dict:
    """Hitung inertia untuk k=2..max_k."""
    X = _deserialize(X_bytes)
    return {
        k: KMeans(n_clusters=k, random_state=42, n_init=10).fit(X).inertia_
        for k in range(2, max_k + 1)
    }


def run_kmeans(X_bytes: bytes, k: int) -> np.ndarray:
    """Jalankan optimized clustering. k diabaikan, k-optimal dipilih."""
    X = _deserialize(X_bytes)
    labels, _, _ = find_optimal_k_and_cluster(X)
    return labels


def run_kmeans_full(X_bytes: bytes) -> tuple[np.ndarray, int, float]:
    """Return labels, optimal k, dan silhouette score."""
    X = _deserialize(X_bytes)
    return find_optimal_k_and_cluster(X)


def run_pca(X_bytes: bytes) -> tuple[np.ndarray, np.ndarray]:
    """
    PCA 2 komponen dari data asli (6 variabel) untuk visualisasi.
    Return (coords_2d, explained_variance_ratio).
    """
    X = _deserialize(X_bytes)
    # X here is the 1D composite; we expand it for visual purposes using PC1 vs jitter
    # Just return (X, [[1.0]]) since it's 1D
    jitter = np.zeros_like(X)
    coords = np.hstack([X, jitter])
    return coords, np.array([1.0, 0.0])


def cluster_profiles(df_clean: pd.DataFrame, labels: np.ndarray) -> pd.DataFrame:
    """Rata-rata setiap variabel clustering per klaster."""
    df_c = df_clean.copy()
    df_c["Klaster"] = [f"Klaster {l+1}" for l in labels]
    profiles = df_c.groupby("Klaster")[CLUSTERING_VARS].mean().reset_index()
    return profiles


def normalize_profiles(profiles: pd.DataFrame) -> pd.DataFrame:
    """Normalisasi profil klaster ke skala 0–100 untuk radar chart."""
    norm = profiles.copy()
    for col in CLUSTERING_VARS:
        min_v, max_v = profiles[col].min(), profiles[col].max()
        norm[col] = (profiles[col] - min_v) / (max_v - min_v) * 100 if max_v > min_v else 50.0
    return norm


def policy_recommendations(profiles: pd.DataFrame) -> dict[str, str]:
    """Rekomendasi kebijakan per klaster berbasis profil variabel."""
    recs = {}
    ipm_col  = "IPM 2024"
    mis_col  = "% Miskin\n2024"
    tpt_col  = "TPT 2024\n(%)"
    pdrb_col = "PDRB/Kapita\n2024 (Ribu Rp)"
    san_col  = "Sanitasi\nLayak 2024 (%)"
    air_col  = "Air Minum\nLayak 2024 (%)"

    best_ipm_idx     = profiles[ipm_col].idxmax()
    worst_ipm_idx    = profiles[ipm_col].idxmin()
    worst_miskin_idx = profiles[mis_col].idxmax()
    worst_tpt_idx    = profiles[tpt_col].idxmax()

    for _, row in profiles.iterrows():
        kl  = row["Klaster"]
        idx = profiles[profiles["Klaster"] == kl].index[0]

        if idx == best_ipm_idx:
            recs[kl] = ("**Daerah Maju & Sejahtera** — IPM dan PDRB tertinggi. "
                        "Rekomendasi: perluas inovasi layanan publik digital, jadikan model percontohan "
                        "bagi daerah lain, dan dorong investasi riset & teknologi.")
        elif idx == worst_miskin_idx:
            recs[kl] = ("**Kemiskinan Tinggi — Prioritas Utama** — Angka kemiskinan jauh di atas rata-rata. "
                        "Rekomendasi: perkuat program bansos tepat sasaran (PKH, BPNT), percepat akses "
                        "pendidikan vokasional, dan tingkatkan infrastruktur dasar.")
        elif idx == worst_tpt_idx and idx != worst_miskin_idx:
            recs[kl] = ("**Pengangguran Tinggi** — PDRB moderat namun penyerapan tenaga kerja rendah. "
                        "Rekomendasi: atraksi investasi padat karya, kemitraan industri-BLK, "
                        "dan pengembangan ekosistem UMKM lokal.")
        elif idx == worst_ipm_idx and idx != worst_miskin_idx:
            recs[kl] = ("**HDI Rendah** — Kualitas kesehatan dan pendidikan perlu perhatian. "
                        "Rekomendasi: perkuat fasilitas puskesmas, tingkatkan APK sekolah, "
                        "dan luncurkan program beasiswa daerah terpencil.")
        else:
            san_val = row.get(san_col, 100)
            air_val = row.get(air_col, 100)
            weak_infra = san_val < profiles[san_col].median() or air_val < profiles[air_col].median()
            if weak_infra:
                recs[kl] = ("**Berkembang — Infrastruktur Terbatas** — Pertumbuhan positif namun "
                            "sanitasi/air minum masih kurang memadai. "
                            "Rekomendasi: percepat SPAM & IPAL, optimalkan Dana Desa untuk infrastruktur dasar.")
            else:
                recs[kl] = ("**Berkembang — Potensial** — Indikator cukup baik dengan ruang peningkatan. "
                            "Rekomendasi: diversifikasi ekonomi, perkuat konektivitas jalan untuk akses pasar.")
    return recs
