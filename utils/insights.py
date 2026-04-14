"""
insights.py — Auto-insight text generator per tab.
"""
import streamlit as st
import pandas as pd
from config import C


def render_callout(text: str, color: str = "#00d46a", icon: str = "▸") -> None:
    """Render a styled insight callout card above charts."""
    st.markdown(
        f"""<div style="border-left:3px solid {color};
            background:rgba(30,35,48,0.7);
            padding:12px 16px; border-radius:0 6px 6px 0; margin:0 0 16px;">
            <span style="color:{color}; font-weight:600; font-size:0.78rem;">
                {icon} Temuan Utama
            </span>
            <div style="color:#9aa3b5; font-size:0.82rem; margin-top:4px;
                 line-height:1.6;">{text}</div>
        </div>""",
        unsafe_allow_html=True,
    )


def _fmt(v, decimals=2):
    """Format angka untuk display."""
    if v != v:  # NaN check
        return "N/A"
    if abs(v) >= 1_000_000:
        return f"{v/1_000_000:.1f}Jt"
    if abs(v) >= 1_000:
        return f"{v:,.0f}"
    return f"{v:.{decimals}f}"


def insight_overview(df: pd.DataFrame) -> str:
    ipm = "IPM 2024"
    tpt = "TPT 2024\n(%)"
    miskin = "% Miskin\n2024"
    if ipm not in df.columns:
        return ""
    best_ipm   = df.loc[df[ipm].idxmax(), "Nama Kab/Kota"]
    worst_ipm  = df.loc[df[ipm].idxmin(), "Nama Kab/Kota"]
    gap_ipm    = df[ipm].max() - df[ipm].min()
    high_tpt   = df.loc[df[tpt].idxmax(), "Nama Kab/Kota"]
    high_miskin = df.loc[df[miskin].idxmax(), "Nama Kab/Kota"]
    return (
        f"IPM tertinggi: **{best_ipm}** ({df[ipm].max():.2f}) — "
        f"terendah: **{worst_ipm}** ({df[ipm].min():.2f}). "
        f"Kesenjangan IPM antar daerah: **{gap_ipm:.2f} poin**. "
        f"Daerah dengan TPT tertinggi: **{high_tpt}** ({df[tpt].max():.2f}%). "
        f"Kemiskinan tertinggi: **{high_miskin}** ({df[miskin].max():.2f}%)."
    )


def insight_demografi(df: pd.DataFrame) -> str:
    kep = "Kepadatan\n(jiwa/km²)"
    tpt = "TPT 2024\n(%)"
    # Cari kolom kepadatan yang mungkin menggunakan karakter special
    kep_cols = [c for c in df.columns if "Kepadatan" in c or "kepadatan" in c.lower()]
    if not kep_cols:
        return ""
    kep_col = kep_cols[0]
    densest  = df.loc[df[kep_col].idxmax(), "Nama Kab/Kota"]
    sparsest = df.loc[df[kep_col].idxmin(), "Nama Kab/Kota"]
    high_tpt = df.loc[df[tpt].idxmax(), "Nama Kab/Kota"]
    low_tpt  = df.loc[df[tpt].idxmin(), "Nama Kab/Kota"]
    avg_tpt  = df[tpt].mean()
    return (
        f"Kepadatan tertinggi: **{densest}** ({df[kep_col].max():,.0f} jiwa/km²), "
        f"terendah: **{sparsest}** ({df[kep_col].min():,.0f} jiwa/km²). "
        f"TPT tertinggi: **{high_tpt}** ({df[tpt].max():.2f}%), "
        f"terendah: **{low_tpt}** ({df[tpt].min():.2f}%). "
        f"Rata-rata TPT Jawa Barat: **{avg_tpt:.2f}%**."
    )


def insight_kesejahteraan(df: pd.DataFrame) -> str:
    ipm   = "IPM 2024"
    miskin = "% Miskin\n2024"
    if ipm not in df.columns:
        return ""
    best_ipm   = df.loc[df[ipm].idxmax(), "Nama Kab/Kota"]
    worst_ipm  = df.loc[df[ipm].idxmin(), "Nama Kab/Kota"]
    poorest    = df.loc[df[miskin].idxmax(), "Nama Kab/Kota"]
    richest    = df.loc[df[miskin].idxmin(), "Nama Kab/Kota"]
    gap_miskin = df[miskin].max() - df[miskin].min()
    return (
        f"IPM tertinggi: **{best_ipm}** ({df[ipm].max():.2f}), "
        f"terendah: **{worst_ipm}** ({df[ipm].min():.2f}). "
        f"Kemiskinan tertinggi: **{poorest}** ({df[miskin].max():.2f}%), "
        f"terendah: **{richest}** ({df[miskin].min():.2f}%). "
        f"Disparitas kemiskinan: **{gap_miskin:.2f} poin persentase**."
    )


def insight_ekonomi(df: pd.DataFrame) -> str:
    pdrb = "PDRB/Kapita\n2024 (Ribu Rp)"
    if pdrb not in df.columns:
        return ""
    richest = df.loc[df[pdrb].idxmax(), "Nama Kab/Kota"]
    poorest = df.loc[df[pdrb].idxmin(), "Nama Kab/Kota"]
    ratio   = df[pdrb].max() / df[pdrb].min()
    avg     = df[pdrb].mean()
    return (
        f"PDRB/Kapita tertinggi: **{richest}** (Rp {df[pdrb].max():,.0f} Ribu), "
        f"terendah: **{poorest}** (Rp {df[pdrb].min():,.0f} Ribu). "
        f"Rasio disparitas ekonomi: **{ratio:.1f}x** dari rata-rata Rp {avg:,.0f} Ribu."
    )


def insight_infrastruktur(df: pd.DataFrame) -> str:
    pct_jln  = "% Jalan\nBaik"
    sanitasi = "Sanitasi\nLayak 2024 (%)"
    if pct_jln not in df.columns:
        return ""
    best  = df.loc[df[pct_jln].idxmax(), "Nama Kab/Kota"]
    worst = df.loc[df[pct_jln].idxmin(), "Nama Kab/Kota"]
    avg_san = df[sanitasi].mean() if sanitasi in df.columns else None
    san_txt = f"Rata-rata sanitasi layak: **{avg_san:.1f}%**." if avg_san else ""
    return (
        f"Kondisi jalan terbaik: **{best}** ({df[pct_jln].max():.1f}% jalan baik), "
        f"terburuk: **{worst}** ({df[pct_jln].min():.1f}%). {san_txt}"
    )


def insight_klaster(profiles_df: pd.DataFrame, labels_map: dict) -> str:
    """
    profiles_df: hasil cluster_profiles() dengan kolom cluster + CLUSTERING_VARS.
    labels_map: {cluster_id: 'Klaster X'}.
    """
    n = len(profiles_df)
    ipm_col = "IPM 2024"
    miskin_col = "% Miskin\n2024"
    best  = profiles_df.loc[profiles_df[ipm_col].idxmax(), "Klaster"]
    worst = profiles_df.loc[profiles_df[miskin_col].idxmax(), "Klaster"]
    return (
        f"Analisis menghasilkan **{n} klaster** daerah. "
        f"**{best}** memiliki IPM rata-rata tertinggi (daerah paling maju). "
        f"**{worst}** memiliki tingkat kemiskinan tertinggi dan memerlukan intervensi prioritas."
    )
