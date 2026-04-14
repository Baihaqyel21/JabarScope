"""
app.py — JabarScope Dashboard
Sumber Data: BPS, Provinsi Jawa Barat Dalam Angka 2025
"""
import streamlit as st

st.set_page_config(
    page_title="JabarScope",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── THEME CSS ─────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@300;400;500;600;700;800&display=swap');

/* ─── Reset & Base ─── */
html, body, [class*="css"], .stApp {
    font-family: 'Inter', sans-serif;
    background-color: #0e1015 !important;
    color: #e8eaf0;
}

/* ─── Hide default streamlit chrome ─── */
#MainMenu, footer, header { visibility: hidden; }
[data-testid="stDecoration"] { display: none; }
.block-container { padding: 24px 28px 40px !important; max-width: 100% !important; }

/* ─── Sidebar ─── */
[data-testid="stSidebar"] {
    background: #0a0d13 !important;
    border-right: 1px solid #1e2330;
    padding: 0 !important;
}
[data-testid="stSidebar"] > div:first-child { padding: 0 !important; }

/* ─── KPI Cards ─── */
[data-testid="stMetric"] {
    background: #171b24 !important;
    border: 1px solid #252b38;
    border-radius: 6px;
    padding: 16px 18px !important;
    transition: border-color 0.2s, transform 0.15s;
}
[data-testid="stMetric"]:hover {
    border-color: rgba(0,212,106,0.4) !important;
    transform: translateY(-1px);
}
[data-testid="stMetricLabel"] {
    font-size: 0.72rem !important; font-weight: 500 !important;
    color: #6b7a99 !important; text-transform: uppercase;
    letter-spacing: 0.06em !important;
}
[data-testid="stMetricValue"] {
    font-family: 'Space Mono', monospace !important;
    font-size: 1.4rem !important; font-weight: 700 !important;
    color: #e8eaf0 !important;
}
[data-testid="stMetricDelta"] svg { display: none; }
[data-testid="stMetricDelta"] > div { font-size: 0.75rem !important; }

/* ─── Section label ─── */
.sec-label {
    font-size: 0.68rem; font-weight: 600; color: #6b7a99;
    text-transform: uppercase; letter-spacing: 0.1em;
    margin: 20px 0 8px; padding-left: 2px;
}

/* ─── Card container ─── */
.card {
    background: #171b24;
    border: 1px solid #252b38;
    border-radius: 6px;
    padding: 20px 22px;
    margin-bottom: 16px;
}
.card-title {
    font-size: 0.85rem; font-weight: 600; color: #e8eaf0;
    margin-bottom: 4px;
}
.card-sub {
    font-size: 0.73rem; color: #6b7a99; margin-bottom: 14px;
}

/* ─── Info / Warning / Error boxes ─── */
.stInfo    { background: rgba(0,212,106,0.06) !important; border-color: #00d46a !important; border-radius: 6px !important; }
.stWarning { background: rgba(245,197,66,0.06) !important; border-color: #f5c542 !important; border-radius: 6px !important; }
.stError   { background: rgba(240,97,106,0.06) !important; border-color: #f0616a !important; border-radius: 6px !important; }
.stInfo p, .stWarning p, .stError p { font-size: 0.83rem !important; color: #9aa3b5 !important; }

/* ─── Selectbox / Multiselect ─── */
[data-testid="stSelectbox"] > div > div,
[data-testid="stMultiSelect"] > div > div {
    background: #1e2330 !important;
    border: 1px solid #252b38 !important;
    border-radius: 6px !important;
    color: #e8eaf0 !important;
}
[data-testid="stSelectbox"] label,
[data-testid="stMultiSelect"] label { color: #6b7a99 !important; font-size: 0.76rem !important; }

/* ─── Slider ─── */
[data-testid="stSlider"] label { color: #6b7a99 !important; font-size: 0.76rem !important; }
[data-testid="stSlider"] [data-baseweb="slider"] [role="slider"] {
    background: #00d46a !important;
}

/* ─── Dataframe ─── */
[data-testid="stDataFrame"] {
    background: #171b24 !important;
    border: 1px solid #252b38 !important;
    border-radius: 6px !important;
    overflow: hidden;
}
[data-testid="stDataFrame"] th {
    background: #1e2330 !important;
    color: #9aa3b5 !important;
    font-size: 0.74rem !important;
    font-family: 'Space Mono', monospace !important;
    text-transform: uppercase; letter-spacing: 0.04em;
}
[data-testid="stDataFrame"] td {
    color: #e8eaf0 !important;
    font-size: 0.82rem !important;
    font-family: 'Space Mono', monospace !important;
}
[data-testid="stDataFrame"] tr:hover td { background: rgba(255,255,255,0.03) !important; }

/* ─── Caption / text ─── */
.stCaption, [data-testid="stCaptionContainer"] p {
    color: #6b7a99 !important; font-size: 0.78rem !important;
}

/* ─── Divider ─── */
hr { border: none; border-top: 1px solid #1e2330; margin: 18px 0; }

/* ─── Scrollbar ─── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #252b38; border-radius: 3px; }

/* ─── Toggle ─── */
[data-testid="stToggle"] label { color: #9aa3b5 !important; font-size: 0.8rem !important; }

/* ─── Expander ─── */
[data-testid="stExpander"] {
    background: #171b24 !important;
    border: 1px solid #252b38 !important;
    border-radius: 6px !important;
}
[data-testid="stExpander"] summary { color: #9aa3b5 !important; font-size: 0.83rem !important; }

/* ─── Spinner ─── */
[data-testid="stSpinner"] p { color: #6b7a99 !important; }
</style>
""", unsafe_allow_html=True)

# ── Imports ───────────────────────────────────────────────────────────────────
from utils.loader import load_all_sheets, load_geojson
from utils.preprocessor import (
    clean_master, clean_tren, clean_demografi,
    clean_kesejahteraan, clean_ekonomi, clean_infrastruktur,
)
import tabs.tab_overview      as t_overview
import tabs.tab_demografi     as t_demografi
import tabs.tab_kesejahteraan as t_kesejahteraan
import tabs.tab_ekonomi       as t_ekonomi
import tabs.tab_infrastruktur as t_infrastruktur
import tabs.tab_klaster       as t_klaster

# ── Data ─────────────────────────────────────────────────────────────────────
@st.cache_data(show_spinner=False)
def get_data():
    sheets  = load_all_sheets()
    geojson = load_geojson()
    master  = clean_master(sheets["master_2024"])
    tren    = clean_tren(sheets["tren_long_format"])
    demografi  = clean_demografi(sheets["demografi"])
    kesej      = clean_kesejahteraan(sheets["kesejahteraan"])
    ekonomi    = clean_ekonomi(sheets["ekonomi"])
    infra      = clean_infrastruktur(sheets["infrastruktur"])
    return master, tren, demografi, kesej, ekonomi, infra, geojson

with st.spinner(""):
    master_df, tren_df, demografi_df, kesej_df, ekonomi_df, infra_df, geojson = get_data()

# ── Session state ─────────────────────────────────────────────────────────────
if "page" not in st.session_state:
    st.session_state["page"] = "landing"

# ── SIDEBAR NAV ───────────────────────────────────────────────────────────────
NAV_ITEMS = [
    ("landing",        "Beranda",                    "⊞"),
    ("overview",       "Overview",                   "◈"),
    ("demografi",      "Demografi & Ketenagakerjaan", "◉"),
    ("kesejahteraan",  "Kesejahteraan",               "◉"),
    ("ekonomi",        "Ekonomi Daerah",              "◉"),
    ("infrastruktur",  "Infrastruktur",               "◉"),
    ("klaster",        "Analisis Klaster",            "◈"),
]

with st.sidebar:
    # Brand
    st.markdown("""
    <div style="padding: 20px 20px 16px;">
        <div style="font-size:1.35rem; font-weight:800; color:#f1f5f9;
             letter-spacing:-0.02em; line-height:1.1;">
            Jabar<span style="color:#00d46a;">Scope</span>
        </div>
        <div style="font-size:0.68rem; color:#6b7a99; margin-top:3px;
             text-transform:uppercase; letter-spacing:0.1em;">
            Dashboard Pembangunan Daerah
        </div>
    </div>
    <div style="border-top:1px solid #1e2330; margin: 0 16px 8px;"></div>
    """, unsafe_allow_html=True)

    # Nav label
    st.markdown('<div style="padding:0 20px; font-size:0.65rem; font-weight:600; color:#6b7a99; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:4px;">NAVIGASI</div>', unsafe_allow_html=True)

    # Nav — radio distyled jadi nav menu
    st.markdown("""
    <style>
    /* Sembunyikan radio widget default, gunakan label sebagai nav item */
    [data-testid="stSidebar"] [data-testid="stRadio"] > label { display: none !important; }
    [data-testid="stSidebar"] [data-testid="stRadio"] [data-testid="stMarkdownContainer"] { display:none; }
    [data-testid="stSidebar"] [data-testid="stRadio"] div[role="radiogroup"] {
        gap: 2px !important;
        display: flex !important;
        flex-direction: column !important;
        padding: 0 10px !important;
    }
    [data-testid="stSidebar"] [data-testid="stRadio"] label[data-baseweb="radio"] {
        background: transparent !important;
        border: 1px solid transparent !important;
        border-radius: 8px !important;
        padding: 9px 14px !important;
        cursor: pointer !important;
        width: 100% !important;
        transition: all 0.15s !important;
        margin: 0 !important;
    }
    [data-testid="stSidebar"] [data-testid="stRadio"] label[data-baseweb="radio"]:hover {
        background: rgba(255,255,255,0.04) !important;
    }
    [data-testid="stSidebar"] [data-testid="stRadio"] label[data-baseweb="radio"] p {
        font-size: 0.84rem !important;
        color: #8892a4 !important;
        font-weight: 400 !important;
        margin: 0 !important;
    }
    /* Hide radio circle */
    [data-testid="stSidebar"] [data-testid="stRadio"] [data-testid="stWidgetLabel"] { display:none; }
    [data-testid="stSidebar"] [data-testid="stRadio"] div[data-baseweb="radio"] { display:none !important; }
    /* Active item */
    [data-testid="stSidebar"] [data-testid="stRadio"] label[aria-checked="true"] {
        background: rgba(0,212,106,0.1) !important;
        border: 1px solid rgba(0,212,106,0.2) !important;
    }
    [data-testid="stSidebar"] [data-testid="stRadio"] label[aria-checked="true"] p {
        color: #00d46a !important;
        font-weight: 600 !important;
    }
    </style>
    """, unsafe_allow_html=True)

    nav_labels = [label for _, label, _ in NAV_ITEMS]
    nav_keys   = [key for key, _, _ in NAV_ITEMS]
    current_label = next(
        (lbl for key, lbl, _ in NAV_ITEMS if key == st.session_state["page"]),
        nav_labels[0]
    )
    selected_label = st.radio(
        "nav", nav_labels,
        index=nav_labels.index(current_label),
        key="sidebar_nav",
        label_visibility="collapsed",
    )
    selected_key = nav_keys[nav_labels.index(selected_label)]
    if selected_key != st.session_state["page"]:
        st.session_state["page"] = selected_key
        st.rerun()

    st.markdown("""
    <div style="border-top:1px solid #1e2330; margin: 12px 16px 12px;"></div>
    <div style="padding:0 20px; font-size:0.65rem; font-weight:600; color:#6b7a99;
         text-transform:uppercase; letter-spacing:0.1em; margin-bottom:8px;">PENGATURAN</div>
    """, unsafe_allow_html=True)

    comparison_mode = st.toggle("Perbandingan Dua Daerah", value=False,
                                 key="comparison_mode")

    st.markdown("""
    <div style="border-top:1px solid #1e2330; margin: 12px 16px 0;"></div>
    <div style="padding: 16px 20px; font-size:0.72rem;">
        <div style="color:#6b7a99;">Sumber Data</div>
        <div style="color:#9aa3b5; margin-top:2px;">BPS — Jabar Dalam Angka 2025</div>
        <div style="color:#9aa3b5; margin-top:1px;">Referensi: 2024 | Tren: 2020–2024</div>
    </div>
    """, unsafe_allow_html=True)

# ── PAGES ─────────────────────────────────────────────────────────────────────
page = st.session_state["page"]

# ── LANDING PAGE ──────────────────────────────────────────────────────────────
if page == "landing":
    # Hero
    total_pop = master_df["Penduduk\n(Ribu)"].sum()
    avg_ipm   = master_df["IPM 2024"].mean()
    avg_miskin= master_df["% Miskin\n2024"].mean()
    avg_tpt   = master_df["TPT 2024\n(%)"].mean()
    n_daerah  = len(master_df)

    st.markdown(f"""
    <div style="background: linear-gradient(135deg, #0d1a2d 0%, #0a1628 50%, #0d1117 100%);
         border: 1px solid rgba(0,212,106,0.12);
         border-radius: 16px; padding: 48px 52px; margin-bottom: 28px;
         position: relative; overflow: hidden;">
        <div style="position:absolute; top:-40px; right:-40px; width:300px; height:300px;
             background: radial-gradient(circle, rgba(0,212,106,0.08) 0%, transparent 70%);
             border-radius:50%;"></div>
        <div style="font-size:0.72rem; font-weight:600; color:#00d46a;
             text-transform:uppercase; letter-spacing:0.15em; margin-bottom:12px;">
            STATISTIKA RESMI · JAWA BARAT 2024
        </div>
        <h1 style="font-size:2.4rem; font-weight:800; color:#f1f5f9;
            margin:0 0 12px; letter-spacing:-0.03em; line-height:1.2;">
            Dashboard Disparitas<br>Pembangunan Jawa Barat
        </h1>
        <p style="font-size:1.0rem; color:#8892a4; max-width:580px; line-height:1.6; margin:0 0 32px;">
            Visualisasi interaktif kondisi pembangunan {n_daerah} kabupaten/kota
            berbasis data resmi BPS — mencakup demografi, kesejahteraan,
            ekonomi, infrastruktur, dan analisis clustering K-Means.
        </p>
        <div style="display:flex; gap:12px; flex-wrap:wrap;">
            <div style="background:rgba(0,212,106,0.12); border:1px solid rgba(0,212,106,0.25);
                 border-radius:8px; padding:6px 14px; font-size:0.8rem;
                 font-weight:600; color:#00d46a;">
                27 Kabupaten/Kota
            </div>
            <div style="background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2);
                 border-radius:8px; padding:6px 14px; font-size:0.8rem;
                 font-weight:600; color:#60a5fa;">
                BPS 2025
            </div>
            <div style="background:rgba(251,191,36,0.1); border:1px solid rgba(251,191,36,0.2);
                 border-radius:8px; padding:6px 14px; font-size:0.8rem;
                 font-weight:600; color:#fbbf24;">
                K-Means Clustering
            </div>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Stats row
    col1, col2, col3, col4, col5 = st.columns(5)
    stats = [
        (col1, f"{total_pop/1000:.1f} Juta", "Total Penduduk", "#00d46a"),
        (col2, f"{avg_ipm:.2f}",             "Rata-rata IPM",  "#60a5fa"),
        (col3, f"{avg_miskin:.2f}%",          "Rata-rata Kemiskinan", "#f87171"),
        (col4, f"{avg_tpt:.2f}%",             "Rata-rata TPT",  "#fbbf24"),
        (col5, f"{n_daerah}",                 "Kab/Kota",       "#a78bfa"),
    ]
    for col, val, lbl, color in stats:
        with col:
            st.markdown(f"""
            <div style="background:#171b24; border:1px solid #252b38;
                 border-radius:6px; padding:18px 16px; text-align:center;">
                <div style="font-family:'Space Mono',monospace; font-size:1.5rem; font-weight:700; color:{color};
                     letter-spacing:-0.02em;">{val}</div>
                <div style="font-size:0.72rem; color:#6b7a99; margin-top:4px;
                     text-transform:uppercase; letter-spacing:0.06em;">{lbl}</div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("<div style='margin-top:28px;'></div>", unsafe_allow_html=True)

    # Feature cards
    st.markdown('<div style="font-size:0.68rem; font-weight:600; color:#6b7a99; text-transform:uppercase; letter-spacing:0.1em; margin-bottom:14px;">FITUR DASHBOARD</div>', unsafe_allow_html=True)

    features = [
        ("overview",      "Overview",                   "Peta choropleth interaktif dan ranking skor komposit pembangunan 27 daerah.",          "#00d46a"),
        ("demografi",     "Demografi & Ketenagakerjaan", "Tren TPT, TPAK, dan UMK 2020–2024 dengan perbandingan antar daerah.",                 "#60a5fa"),
        ("kesejahteraan", "Kesejahteraan",               "Analisis IPM, kemiskinan, sanitasi, dan akses air minum layak.",                       "#a78bfa"),
        ("ekonomi",       "Ekonomi Daerah",              "PDRB per kapita, pertumbuhan ekonomi, dan disparitas pendapatan.",                     "#fbbf24"),
        ("infrastruktur", "Infrastruktur",               "Kondisi jalan, akses sanitasi, dan peta layanan dasar.",                              "#f87171"),
        ("klaster",       "Analisis Klaster",            "K-Means clustering, elbow method, PCA 2D, radar profil, dan rekomendasi kebijakan.",   "#34d399"),
    ]

    cols = st.columns(3)
    for i, (key, title, desc, color) in enumerate(features):
        with cols[i % 3]:
            st.markdown(f"""
            <div style="background:#171b24; border:1px solid #252b38;
                 border-left:3px solid {color}; border-radius:6px;
                 padding:18px 18px 14px; margin-bottom:4px; cursor:pointer;
                 transition:border-color 0.2s;">
                <div style="font-size:0.87rem; font-weight:600; color:#e8eaf0;
                     margin-bottom:6px;">{title}</div>
                <div style="font-size:0.78rem; color:#8892a4; line-height:1.55;">{desc}</div>
            </div>
            """, unsafe_allow_html=True)
            if st.button(f"Buka {title}", key=f"feat_{key}", use_container_width=True):
                st.session_state["page"] = key
                st.rerun()

    st.markdown("<div style='margin-top:32px;'></div>", unsafe_allow_html=True)

    # About section
    col_about, col_method = st.columns([3, 2])
    with col_about:
        st.markdown("""
        <div style="background:#171b24; border:1px solid #252b38;
             border-radius:6px; padding:22px 24px;">
            <div style="font-size:0.68rem; font-weight:600; color:#6b7a99;
                 text-transform:uppercase; letter-spacing:0.1em; margin-bottom:12px;">
                TENTANG JABARSCOPE
            </div>
            <p style="color:#9aa3b5; font-size:0.85rem; line-height:1.7; margin:0 0 12px;">
                JabarScope adalah dashboard statistika resmi yang menyajikan data
                pembangunan kabupaten/kota di Provinsi Jawa Barat secara interaktif dan
                komprehensif. Dashboard ini dirancang untuk mendukung pengambilan
                keputusan berbasis data bagi akademisi, pemerintah daerah, dan masyarakat umum.
            </p>
            <p style="color:#6b7a99; font-size:0.82rem; line-height:1.6; margin:0;">
                Data bersumber dari publikasi resmi BPS — <em>Provinsi Jawa Barat Dalam
                Angka 2025</em> — mencakup 28 indikator pembangunan dari 27 kabupaten/kota
                dengan rentang waktu 2020–2024.
            </p>
        </div>
        """, unsafe_allow_html=True)

    with col_method:
        st.markdown("""
        <div style="background:#171b24; border:1px solid #252b38;
             border-radius:6px; padding:22px 24px; height:100%; box-sizing:border-box;">
            <div style="font-size:0.68rem; font-weight:600; color:#6b7a99;
                 text-transform:uppercase; letter-spacing:0.1em; margin-bottom:14px;">
                METODOLOGI
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <div style="width:6px; height:6px; border-radius:50%; background:#00d46a;
                         margin-top:6px; flex-shrink:0;"></div>
                    <div style="font-size:0.82rem; color:#9aa3b5; line-height:1.5;">
                        <b style="color:#e8eaf0;">Skor Komposit</b> — weighted MinMax
                        normalization dari 6 indikator pembangunan
                    </div>
                </div>
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <div style="width:6px; height:6px; border-radius:50%; background:#4e9eff;
                         margin-top:6px; flex-shrink:0;"></div>
                    <div style="font-size:0.82rem; color:#9aa3b5; line-height:1.5;">
                        <b style="color:#e8eaf0;">K-Means Clustering</b> — segmentasi
                        daerah berdasarkan kemiripan profil pembangunan
                    </div>
                </div>
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <div style="width:6px; height:6px; border-radius:50%; background:#9b7ff4;
                         margin-top:6px; flex-shrink:0;"></div>
                    <div style="font-size:0.82rem; color:#9aa3b5; line-height:1.5;">
                        <b style="color:#e8eaf0;">PCA 2D</b> — reduksi dimensi untuk
                        visualisasi klaster
                    </div>
                </div>
                <div style="display:flex; align-items:flex-start; gap:10px;">
                    <div style="width:6px; height:6px; border-radius:50%; background:#f5c542;
                         margin-top:6px; flex-shrink:0;"></div>
                    <div style="font-size:0.82rem; color:#9aa3b5; line-height:1.5;">
                        <b style="color:#e8eaf0;">Choropleth Map</b> — visualisasi
                        spasial berbasis GeoJSON GADM Level 2
                    </div>
                </div>
            </div>
        </div>
        """, unsafe_allow_html=True)

# ── DASHBOARD PAGES ───────────────────────────────────────────────────────────
else:
    # Page header
    PAGE_HEADERS = {
        "overview":      ("Overview Jawa Barat 2024",           "Gambaran umum 27 kabupaten/kota berdasarkan data BPS 2025"),
        "demografi":     ("Demografi & Ketenagakerjaan",         "Tren kependudukan, pengangguran, dan upah minimum 2020–2024"),
        "kesejahteraan": ("Kesejahteraan Masyarakat",            "IPM, kemiskinan, sanitasi, dan akses air minum layak"),
        "ekonomi":       ("Ekonomi Daerah",                      "PDRB per kapita, pertumbuhan ekonomi, dan disparitas pendapatan"),
        "infrastruktur": ("Infrastruktur & Layanan Dasar",       "Kondisi jalan, sanitasi, dan akses layanan dasar 2024"),
        "klaster":       ("Analisis Klaster Pembangunan",        "K-Means clustering · Elbow Method · PCA · Rekomendasi Kebijakan"),
    }
    title, subtitle = PAGE_HEADERS.get(page, ("", ""))

    st.markdown(f"""
    <div style="display:flex; align-items:center; justify-content:space-between;
         margin-bottom:20px; padding-bottom:16px;
         border-bottom:1px solid rgba(255,255,255,0.05);">
        <div>
            <h2 style="font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px;">
                {title}
            </h2>
            <p style="font-size:0.78rem; color:#6b7a99; margin:0;">{subtitle}</p>
        </div>
        <div style="background:rgba(0,212,106,0.08); border:1px solid rgba(0,212,106,0.15);
             border-radius:6px; padding:4px 10px; font-size:0.7rem;
             font-weight:600; color:#00d46a; white-space:nowrap;">
            BPS · 2024
        </div>
    </div>
    """, unsafe_allow_html=True)

    if page == "overview":
        t_overview.render(master_df, geojson)
    elif page == "demografi":
        t_demografi.render(master_df, tren_df, demografi_df)
    elif page == "kesejahteraan":
        t_kesejahteraan.render(master_df, tren_df, kesej_df, geojson)
    elif page == "ekonomi":
        t_ekonomi.render(master_df, tren_df, ekonomi_df)
    elif page == "infrastruktur":
        t_infrastruktur.render(master_df, tren_df, infra_df, geojson)
    elif page == "klaster":
        t_klaster.render(master_df, geojson)
