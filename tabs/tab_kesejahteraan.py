"""
tab_kesejahteraan.py — Tab 3: Kesejahteraan
"""
import streamlit as st
import pandas as pd
from components.maps import choropleth_map
from components.charts import bar_ranked, scatter_2var, line_trend, forecast_chart
from components.radar import radar_welfare
from utils.insights import insight_kesejahteraan, render_callout
from utils.preprocessor import get_prov_avg_tren
from utils.forecast import build_forecast_series



MAP_INDICATORS = {
    "IPM 2024":            "IPM 2024",
    "Kemiskinan (%)":      "% Miskin\n2024",
    "Sanitasi Layak (%)":  "Sanitasi\nLayak 2024 (%)",
    "Air Minum Layak (%)": "Air Minum\nLayak 2024 (%)",
}

TREN_INDICATORS = {
    "IPM":                "IPM",
    "Kemiskinan (%)":     "PCT_Miskin",
    "Sanitasi Layak (%)": "Sanitasi_Layak_Pct",
    "Air Minum Layak (%)":"Air_Minum_Layak_Pct",
}


def _section(text):
    st.markdown(
        f'<div style="font-size:0.68rem; font-weight:600; color:#6b7a99; '
        f'text-transform:uppercase; letter-spacing:0.1em; margin:20px 0 8px; '
        f'padding-left:10px; border-left:2px solid #00d46a;">{text}</div>',
        unsafe_allow_html=True
    )


def render(master_df: pd.DataFrame, tren_df: pd.DataFrame,
           kesejahteraan_df: pd.DataFrame, geojson: dict | None):
    st.caption("Analisis IPM, kemiskinan, sanitasi, dan akses air minum per kabupaten/kota.")
    all_names = sorted(master_df["Nama Kab/Kota"].tolist())

    # ── Insight (sebelum chart) ───────────────────────────────────────────────
    insight = insight_kesejahteraan(master_df)
    if insight:
        render_callout(insight)

    # ── Peta + Ranking ────────────────────────────────────────────────────────
    col_map, col_bar = st.columns([3, 2])

    with col_map:
        _section("Peta Persebaran")
        map_label = st.selectbox("Indikator", list(MAP_INDICATORS.keys()), key="kesej_map")
        map_col = MAP_INDICATORS[map_label]
        rev = map_col == "% Miskin\n2024"
        fig_map = choropleth_map(
            df=master_df, geojson=geojson,
            value_col=map_col, label_col="Nama Kab/Kota", code_col="Kode BPS",
            title=f"Distribusi {map_label}",
            colorscale="RdYlGn_r" if rev else "RdYlGn",
            height=400,
        )
        st.plotly_chart(fig_map, use_container_width=True)

    with col_bar:
        _section("Peringkat Daerah")
        bar_label = st.selectbox("Urutkan berdasarkan", list(MAP_INDICATORS.keys()),
                                  key="kesej_bar")
        bar_col = MAP_INDICATORS[bar_label]
        rev_bar = bar_col == "% Miskin\n2024"
        fig_bar = bar_ranked(
            df=master_df, x_col=bar_col, y_col="Nama Kab/Kota",
            title="", color_col=bar_col,
            color_scale="RdYlGn_r" if rev_bar else "RdYlGn",
            height=400, x_label=bar_label,
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    st.markdown("---")

    # ── Scatter + Radar ───────────────────────────────────────────────────────
    col_sc, col_radar = st.columns(2)

    with col_sc:
        _section("Hubungan IPM dan Kemiskinan")
        fig_sc = scatter_2var(
            df=master_df, x_col="IPM 2024", y_col="% Miskin\n2024",
            label_col="Nama Kab/Kota",
            title="Daerah ber-IPM tinggi cenderung memiliki kemiskinan rendah",
            color_col="Tipe", trendline=True, height=360,
            x_label="IPM 2024", y_label="Kemiskinan (%)",
        )
        st.plotly_chart(fig_sc, use_container_width=True)

    with col_radar:
        _section("Profil Radar Kesejahteraan")
        sel_radar = st.multiselect(
            "Pilih daerah (maks. 4)", all_names,
            default=all_names[:2], max_selections=4, key="kesej_radar",
        )
        if sel_radar:
            fig_radar = radar_welfare(
                df=master_df, label_col="Nama Kab/Kota",
                selected_regions=sel_radar, height=360,
            )
            st.plotly_chart(fig_radar, use_container_width=True)
        else:
            st.info("Pilih minimal satu daerah.")

    st.markdown("---")

    # ── Tren + Tabel HDI (dalam expander) ─────────────────────────────────────
    _section("Tren & Detail Komponen")
    col_tren, col_tbl = st.columns([3, 2])

    with col_tren:
        tren_label = st.selectbox("Indikator tren", list(TREN_INDICATORS.keys()),
                                   key="kesej_tren")
        tren_ind = TREN_INDICATORS[tren_label]
        sel_tren = st.multiselect("Pilih daerah", all_names, default=all_names[:3],
                                   max_selections=5, key="kesej_tren_regions")
        if sel_tren:
            prov_avg = get_prov_avg_tren(tren_df, tren_ind)
            fig_tren = line_trend(
                tren_df=tren_df, indicator=tren_ind,
                selected_regions=sel_tren, prov_avg=prov_avg,
                y_label=tren_label,
                title=f"Tren {tren_label} 2021–2024",
                height=340,
            )
            st.plotly_chart(fig_tren, use_container_width=True)

    with col_tbl:
        with st.expander("Komponen IPM 2024 — Detail per Daerah", expanded=True):
            hdi_cols = ["Nama Kab/Kota", "IPM 2024", "UHH\n(Tahun)",
                        "HLS\n(Tahun)", "RLS\n(Tahun)", "Pengeluaran Riil\n(Ribu Rp/Org/Thn)"]
            avail = [c for c in hdi_cols if c in master_df.columns]
            tbl = master_df[avail].sort_values("IPM 2024", ascending=False).copy()
            tbl.columns = [c.replace("\n", " ") for c in tbl.columns]
            st.dataframe(tbl.reset_index(drop=True), use_container_width=True,
                         hide_index=True, height=340)

    st.markdown("---")
    
    # ── Forecasting / Proyeksi Kedepan ────────────────────────────────────────
    _section("Proyeksi Tren Kedepan (Predictive AI)")
    
    f_col1, f_col2 = st.columns([3, 2])
    with f_col2:
        st.info("💡 **Penjelasan Pemodelan**\n\nProyeksi ini menggunakan model **Regresi Linier (Linear Regression)** "
                "berdasarkan data runtut waktu 2020-2024. Area arsiran menunjukkan tingkat kepercayaan "
                "(*Confidence Interval 95%*) dari tren yang terbentuk.")
        
        fore_label = st.selectbox("Pilih Indikator Proyeksi", ["IPM", "Kemiskinan (%)", "Sanitasi Layak (%)", "Air Minum Layak (%)"], key="fore_kesej")
        fore_ind_map = {
            "IPM": "IPM",
            "Kemiskinan (%)": "PCT_Miskin",
            "Sanitasi Layak (%)": "Sanitasi_Layak_Pct",
            "Air Minum Layak (%)": "Air_Minum_Layak_Pct"
        }
        
    with f_col1:
        ind_target = fore_ind_map[fore_label]
        fore_data = build_forecast_series(tren_df, ind_target, horizon=4)
        meta = fore_data.get("metadata", {})
        
        if meta:
             r2 = meta.get("r_squared", 0)
             slope = meta.get("slope", 0)
             if slope > 0:
                 trend_text = "Tren **meningkat**"
             else:
                 trend_text = "Tren **menurun**"
                 
             st.markdown(f"Akurasi Model ($R^2$): **{r2:.4f}** | {trend_text} secara linier.")
             fig_fore = forecast_chart(fore_data, title=f"Proyeksi {fore_label} hingga 2028", y_label=fore_label)
             st.plotly_chart(fig_fore, use_container_width=True)
        else:
             st.warning("Data historis tidak mencukupi untuk pemodelan proyeksi.")

