"""
tab_overview.py — Tab 1: Overview Jawa Barat
"""
import streamlit as st
import pandas as pd
from components.kpi_cards import render_kpi_row
from components.maps import choropleth_map
from components.charts import bar_ranked
from utils.insights import insight_overview, render_callout


MAP_INDICATORS = {
    "IPM 2024":              "IPM 2024",
    "Kemiskinan (%)":        "% Miskin\n2024",
    "Pengangguran / TPT (%)":"TPT 2024\n(%)",
    "PDRB/Kapita (Rb Rp)":   "PDRB/Kapita\n2024 (Ribu Rp)",
    "Sanitasi Layak (%)":    "Sanitasi\nLayak 2024 (%)",
    "Air Minum Layak (%)":   "Air Minum\nLayak 2024 (%)",
    "Skor Komposit":         "Skor Komposit",
}


def _section(text):
    st.markdown(
        f'<div style="font-size:0.68rem; font-weight:600; color:#6b7a99; '
        f'text-transform:uppercase; letter-spacing:0.1em; margin:20px 0 8px; '
        f'padding-left:10px; border-left:2px solid #00d46a; color:#6b7a99;">{text}</div>',
        unsafe_allow_html=True
    )


def render(master_df: pd.DataFrame, geojson: dict | None):
    st.caption(
        "Gambaran umum kondisi pembangunan 27 kabupaten/kota Jawa Barat · "
        "BPS Provinsi Jawa Barat Dalam Angka 2025"
    )

    # ── KPI Cards ─────────────────────────────────────────────────────────────
    pend      = master_df["Penduduk\n(Ribu)"].sum()
    avg_tpt   = master_df["TPT 2024\n(%)"].mean()
    avg_miskin= master_df["% Miskin\n2024"].mean()
    avg_ipm   = master_df["IPM 2024"].mean()
    avg_pdrb  = master_df["PDRB/Kapita\n2024 (Ribu Rp)"].mean()
    avg_san   = master_df["Sanitasi\nLayak 2024 (%)"].mean()
    avg_air   = master_df["Air Minum\nLayak 2024 (%)"].mean()

    kpis = [
        {"label": "Jumlah Penduduk",      "value": f"{pend/1000:.2f} Juta",
         "delta_positive": True},
        {"label": "Rerata TPT",           "value": f"{avg_tpt:.2f}%",
         "delta_positive": False, "help": "Tingkat Pengangguran Terbuka"},
        {"label": "Rerata Kemiskinan",    "value": f"{avg_miskin:.2f}%",
         "delta_positive": False},
        {"label": "Rerata IPM",           "value": f"{avg_ipm:.2f}",
         "delta_positive": True},
        {"label": "Rerata PDRB/Kapita",   "value": f"Rp {avg_pdrb:,.0f} Rb",
         "delta_positive": True},
        {"label": "Sanitasi Layak",       "value": f"{avg_san:.1f}%",
         "delta_positive": True},
        {"label": "Air Minum Layak",      "value": f"{avg_air:.1f}%",
         "delta_positive": True},
    ]
    render_kpi_row(kpis, max_per_row=4)
    st.markdown("")

    # ── Insight (sebelum chart) ───────────────────────────────────────────────
    insight = insight_overview(master_df)
    if insight:
        render_callout(insight)

    # ── Peta ─────────────────────────────────────────────────────────────────
    _section("Peta Distribusi Indikator")
    col_map, col_ctrl = st.columns([4, 1])
    with col_ctrl:
        sel_label = st.selectbox("Indikator peta", list(MAP_INDICATORS.keys()),
                                  key="overview_map_indicator")
        sel_col = MAP_INDICATORS[sel_label]
        rev = sel_col in ["% Miskin\n2024", "TPT 2024\n(%)"]
        st.markdown("---")
        st.caption("Kab. Pangandaran tidak tampil pada peta (tidak tersedia di data GeoJSON).")

    with col_map:
        fig_map = choropleth_map(
            df=master_df, geojson=geojson,
            value_col=sel_col, label_col="Nama Kab/Kota", code_col="Kode BPS",
            title=f"{sel_label} per Kabupaten/Kota",
            colorscale="RdYlGn_r" if rev else "RdYlGn",
            height=450,
            hover_cols=["IPM 2024", "% Miskin\n2024", "TPT 2024\n(%)"],
        )
        st.plotly_chart(fig_map, use_container_width=True)

    st.markdown("---")

    # ── Ranking ───────────────────────────────────────────────────────────────
    _section("Ranking Skor Komposit Pembangunan")
    st.caption(
        "Skor 0–100 berdasarkan bobot: IPM +25%, PDRB/Kapita +20%, "
        "Kemiskinan −20%, TPT −15%, Sanitasi +10%, Air Minum +10%"
    )
    fig_bar = bar_ranked(
        df=master_df, x_col="Skor Komposit", y_col="Nama Kab/Kota",
        title="", color_col="Skor Komposit", color_scale="RdYlGn",
        height=560, x_label="Skor Komposit (0–100)",
    )
    st.plotly_chart(fig_bar, use_container_width=True)

    # ── Prioritas (expander) ──────────────────────────────────────────────────
    priority_df = master_df[master_df["Prioritas Intervensi"]].copy()
    with st.expander(f"Daerah Prioritas Intervensi — {len(priority_df)} daerah di kuartil bawah"):
        st.caption("Kuartil bawah skor komposit — memerlukan perhatian kebijakan")
        cols_show = ["Nama Kab/Kota", "Tipe", "Skor Komposit",
                     "IPM 2024", "% Miskin\n2024", "TPT 2024\n(%)"]
        show_df = priority_df[[c for c in cols_show if c in priority_df.columns]]\
            .sort_values("Skor Komposit")
        show_df.columns = [c.replace("\n", " ") for c in show_df.columns]
        st.dataframe(show_df.reset_index(drop=True), use_container_width=True,
                     hide_index=True)
        st.warning(f"{len(priority_df)} daerah berada di kuartil bawah skor komposit.")
