"""
tab_infrastruktur.py — Tab 5: Infrastruktur & Layanan Dasar
"""
import streamlit as st
import pandas as pd
from components.charts import stacked_bar_jalan, bar_ranked, scatter_2var
from components.maps import choropleth_map
from utils.insights import insight_infrastruktur, render_callout


def _section(text):
    st.markdown(
        f'<div style="font-size:0.68rem; font-weight:600; color:#6b7a99; '
        f'text-transform:uppercase; letter-spacing:0.1em; margin:20px 0 8px; '
        f'padding-left:10px; border-left:2px solid #00d46a;">{text}</div>',
        unsafe_allow_html=True
    )


def render(master_df: pd.DataFrame, infrastruktur_df: pd.DataFrame, geojson: dict | None):
    st.caption("Kondisi jalan, sanitasi, dan akses air minum layak per kabupaten/kota 2024.")

    pct_col  = "% Jalan\nBaik"
    san_col  = "Sanitasi\nLayak 2024 (%)"
    air_col  = "Air Minum\nLayak 2024 (%)"

    # ── Insight (sebelum chart) ───────────────────────────────────────────────
    insight = insight_infrastruktur(master_df)
    if insight:
        render_callout(insight)

    # ── Stacked bar jalan ──────────────────────────────────────────────────────
    _section("Kondisi Jalan Kabupaten/Kota")
    jln_cols = [c for c in ["Baik (km)", "Sedang (km)", "Rusak (km)", "Rusak Berat (km)"]
                if c in infrastruktur_df.columns]
    if jln_cols:
        fig_stack = stacked_bar_jalan(df=infrastruktur_df, label_col="Nama", height=480)
        st.plotly_chart(fig_stack, use_container_width=True)

    st.markdown("---")

    # ── Ranking jalan + Scatter layanan ───────────────────────────────────────
    col_bar, col_sc = st.columns(2)

    with col_bar:
        _section(f"Peringkat % Jalan Kondisi Baik")
        if pct_col in master_df.columns:
            avg = master_df[pct_col].mean()
            df_b = master_df.copy()
            df_b["Perlu Perhatian"] = df_b[pct_col] < avg
            fig_bar = bar_ranked(
                df=df_b, x_col=pct_col, y_col="Nama Kab/Kota",
                title=f"Rata-rata: {avg:.1f}%",
                highlight_col="Perlu Perhatian",
                height=500, x_label="% Jalan Baik",
            )
            st.plotly_chart(fig_bar, use_container_width=True)

    with col_sc:
        _section("Sanitasi vs Air Minum Layak 2024")
        if san_col in master_df.columns and air_col in master_df.columns:
            fig_sc = scatter_2var(
                df=master_df, x_col=san_col, y_col=air_col,
                label_col="Nama Kab/Kota",
                title="Apakah daerah dengan sanitasi baik juga memiliki akses air baik?",
                color_col="Tipe", trendline=True, height=320,
                x_label="Sanitasi Layak (%)", y_label="Air Minum Layak (%)",
            )
            st.plotly_chart(fig_sc, use_container_width=True)

            # Statistik ringkas
            avail = [c for c in [san_col, air_col, pct_col] if c in master_df.columns]
            if avail:
                stats = master_df[avail].describe().loc[["min","mean","max"]].round(1)
                stats.columns = [c.replace("\n", " ") for c in stats.columns]
                st.dataframe(stats, use_container_width=True)

    # ── Peta (dalam expander) ─────────────────────────────────────────────────
    with st.expander("Peta Akses Layanan Dasar — Sanitasi & Air Minum"):
        col_m1, col_m2 = st.columns(2)
        with col_m1:
            fig_m1 = choropleth_map(
                df=master_df, geojson=geojson,
                value_col=san_col, label_col="Nama Kab/Kota", code_col="Kode BPS",
                title="Sanitasi Layak (%)", colorscale="Greens", height=360,
            )
            st.plotly_chart(fig_m1, use_container_width=True)
        with col_m2:
            fig_m2 = choropleth_map(
                df=master_df, geojson=geojson,
                value_col=air_col, label_col="Nama Kab/Kota", code_col="Kode BPS",
                title="Air Minum Layak (%)", colorscale="Blues", height=360,
            )
            st.plotly_chart(fig_m2, use_container_width=True)
