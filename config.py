"""
config.py — Konstanta, mapping kolom, dan palette warna untuk JabarScope Dashboard
"""

# ─── Paths ────────────────────────────────────────────────────────────────────
DATA_PATH = "jabarscope_data_kabkota.xlsx"
GEOJSON_PATH = "data/jabar_geojson.json"
GEOJSON_KEY = "CC_2"  # property di GeoJSON yang match dengan Kode BPS

# ─── Palette Warna ────────────────────────────────────────────────────────────
COLORS = {
    "primary":    "#003366",   # biru tua — identitas Jawa Barat
    "accent":     "#FFD700",   # emas
    "good":       "#2ECC71",   # hijau positif
    "warning":    "#E67E22",   # oranye
    "danger":     "#E74C3C",   # merah
    "neutral":    "#7F8C8D",   # abu
    "light_bg":   "#F0F4F8",
    "card_bg":    "#FFFFFF",
    "sidebar_text": "#ECF0F1",
}

CLUSTER_COLORS = [
    "#003366",  # biru tua
    "#E74C3C",  # merah
    "#2ECC71",  # hijau
    "#F39C12",  # oranye
    "#9B59B6",  # ungu
    "#1ABC9C",  # cyan
]

MAP_COLORSCALE_SEQ   = "Blues"
MAP_COLORSCALE_DIV   = "RdBu"

# ─── Nama kolom aktual dari Excel (setelah audit) ────────────────────────────
# Sheet: master_2024 (header=1)
C = {
    "kode":        "Kode BPS",
    "nama":        "Nama Kab/Kota",
    "tipe":        "Tipe",
    "penduduk":    "Penduduk\n(Ribu)",
    "kepadatan":   "Kepadatan\n(jiwa/km²)",   # note: actual may use special char
    "laju_tumbuh": "Laju Tumbuh\nPenduduk (%)",
    "tpt":         "TPT 2024\n(%)",
    "tpak":        "TPAK 2024\n(%)",
    "umk":         "UMK 2024\n(Rp)",
    "ipm":         "IPM 2024",
    "uhh":         "UHH\n(Tahun)",
    "hls":         "HLS\n(Tahun)",
    "rls":         "RLS\n(Tahun)",
    "pengeluaran": "Pengeluaran Riil\n(Ribu Rp/Org/Thn)",
    "pct_miskin":  "% Miskin\n2024",
    "jml_miskin":  "Jml Miskin\n(Ribu)",
    "garis_kemsk": "Garis Kemiskinan\n(Rp/Kap/Bln)",
    "pdrb_kap":    "PDRB/Kapita\n2024 (Ribu Rp)",
    "pertumb_pdrb":"Pertumbuhan\nPDRB 2024 (%)",
    "sanitasi":    "Sanitasi\nLayak 2024 (%)",
    "air_minum":   "Air Minum\nLayak 2024 (%)",
    "jln_baik":    "Jalan Baik\n(km)",
    "jln_sedang":  "Jalan Sedang\n(km)",
    "jln_rusak":   "Jalan Rusak\n(km)",
    "jln_rusak_berat": "Jalan Rusak\nBerat (km)",
    "pct_jln_baik":"% Jalan\nBaik",
}

# ─── Variabel Clustering (K-Means) ───────────────────────────────────────────
CLUSTERING_VARS = [
    "IPM 2024",
    "% Miskin\n2024",
    "TPT 2024\n(%)",
    "PDRB/Kapita\n2024 (Ribu Rp)",
    "Sanitasi\nLayak 2024 (%)",
    "Air Minum\nLayak 2024 (%)",
]

CLUSTERING_LABELS = {
    "IPM 2024":                     "IPM 2024",
    "% Miskin\n2024":               "Kemiskinan (%)",
    "TPT 2024\n(%)":                "TPT (%)",
    "PDRB/Kapita\n2024 (Ribu Rp)":  "PDRB/Kapita (Rb Rp)",
    "Sanitasi\nLayak 2024 (%)":     "Sanitasi Layak (%)",
    "Air Minum\nLayak 2024 (%)":    "Air Minum Layak (%)",
}

# Bobot untuk Skor Komposit (tanda positif = lebih tinggi lebih baik)
COMPOSITE_WEIGHTS = {
    "IPM 2024":                    +0.25,
    "% Miskin\n2024":              -0.20,
    "TPT 2024\n(%)":               -0.15,
    "PDRB/Kapita\n2024 (Ribu Rp)": +0.20,
    "Sanitasi\nLayak 2024 (%)":    +0.10,
    "Air Minum\nLayak 2024 (%)":   +0.10,
}

# ─── Indikator di tren_long_format ───────────────────────────────────────────
TREN_LABELS = {
    "IPM":                         "IPM",
    "TPT_Agustus":                 "TPT (%)",
    "TPAK_Agustus":                "TPAK (%)",
    "PCT_Miskin":                  "Kemiskinan (%)",
    "PDRB_PerKapita_ADHB_RibuRp":  "PDRB/Kapita (Rb Rp)",
    "Laju_Pertumbuhan_PDRB_ADHK":  "Pertumbuhan PDRB (%)",
    "Sanitasi_Layak_Pct":          "Sanitasi Layak (%)",
    "Air_Minum_Layak_Pct":         "Air Minum Layak (%)",
    "UMK_Rp":                      "UMK (Rp)",
}

# Indikator yang bisa dipilih untuk Tab Demografi (dari tren_long_format)
DEMOGRAFI_INDICATORS = ["TPT_Agustus", "TPAK_Agustus", "UMK_Rp"]
EKONOMI_INDICATORS   = ["PDRB_PerKapita_ADHB_RibuRp", "Laju_Pertumbuhan_PDRB_ADHK"]
