"""
tab_ekonomi.py — Tab 4: Ekonomi Daerah
"""
import streamlit as st
import pandas as pd
from components.charts import bar_ranked, line_trend, scatter_2var, forecast_chart
from utils.insights import insight_ekonomi, render_callout
from utils.preprocessor import get_prov_avg_tren
from utils.forecast import build_forecast_series


TREN_INDICATORS = {
    "PDRB/Kapita (Ribu Rp)":   "PDRB_PerKapita_ADHB_RibuRp",
    "Pertumbuhan PDRB (%)":    "Laju_Pertumbuhan_PDRB_ADHK",
    "UMK (Rp)":                "UMK_Rp",
}


def _section(text):
    st.markdown(
        f'<div style="font-size:0.68rem; font-weight:600; color:#6b7a99; '
        f'text-transform:uppercase; letter-spacing:0.1em; margin:20px 0 8px; '
        f'padding-left:10px; border-left:2px solid #00d46a;">{text}</div>',
        unsafe_allow_html=True
    )


def render(master_df: pd.DataFrame, tren_df: pd.DataFrame, ekonomi_df: pd.DataFrame):
    st.caption("Analisis PDRB, pertumbuhan ekonomi, dan pendapatan per kabupaten/kota 2020–2024.")
    all_names = sorted(master_df["Nama Kab/Kota"].tolist())

    # ── Insight (sebelum chart) ───────────────────────────────────────────────
    insight = insight_ekonomi(master_df)
    if insight:
        render_callout(insight)

    # ── Tren ──────────────────────────────────────────────────────────────────
    _section("Tren Indikator Ekonomi 2020–2024")
    col_f1, col_f2 = st.columns([2, 3])
    with col_f1:
        tren_label = st.selectbox("Indikator", list(TREN_INDICATORS.keys()), key="ekon_ind")
        tren_ind   = TREN_INDICATORS[tren_label]
        sel_reg    = st.multiselect("Pilih daerah (maks. 5)", all_names,
                                     default=all_names[:4], max_selections=5, key="ekon_reg")
    with col_f2:
        if sel_reg:
            prov_avg = get_prov_avg_tren(tren_df, tren_ind)
            fig_tren = line_trend(
                tren_df=tren_df, indicator=tren_ind,
                selected_regions=sel_reg, prov_avg=prov_avg,
                y_label=tren_label,
                title=f"{tren_label} · Perbandingan Daerah vs Rata-rata Jabar",
                height=360,
            )
            st.plotly_chart(fig_tren, use_container_width=True)
        else:
            st.info("Pilih minimal satu daerah.")

    st.markdown("---")

    # ── Forecasting / Proyeksi Kedepan ────────────────────────────────────────
    _section("Proyeksi Tren Kedepan (Predictive AI)")
    
    col_fc1, col_fc2 = st.columns([3, 2])
    with col_fc2:
        st.info("💡 **Penjelasan Pemodelan**\n\nProyeksi Demografi menggunakan model **Regresi Linier** berdasarkan tren "
                "PDRB dan Pertumbuhan historis 2020-2024. Area arsiran menunjukkan tingkat kepercayaan "
                "(*Confidence Interval 95%*) dari tren yang diproyeksikan.\n\n"
                "Semakin tinggi R-Squared ($R^2$), semakin akurat prediksi tren tersebut.")
        
        fore_label_ekon = st.selectbox("Pilih Indikator Proyeksi", ["PDRB/Kapita", "Pertumbuhan PDRB (%)"], key="fore_ekon")
        fore_ind_map_ekon = {
            "PDRB/Kapita": "PDRB_PerKapita_ADHB_RibuRp",
            "Pertumbuhan PDRB (%)": "Laju_Pertumbuhan_PDRB_ADHK"
        }
        
    with col_fc1:
        ind_target_ekon = fore_ind_map_ekon[fore_label_ekon]
        fore_data_ekon = build_forecast_series(tren_df, ind_target_ekon, horizon=4)
        meta_ekon = fore_data_ekon.get("metadata", {})
        
        if meta_ekon:
             r2_ekon = meta_ekon.get("r_squared", 0)
             slope_ekon = meta_ekon.get("slope", 0)
             if slope_ekon > 0:
                 trend_text_ekon = "Tren **membaik/meningkat**"
             else:
                 trend_text_ekon = "Tren **menurun/melambat**"
                 
             st.markdown(f"Akurasi Model ($R^2$): **{r2_ekon:.4f}** | {trend_text_ekon} secara linier.")
             fig_fore_ekon = forecast_chart(fore_data_ekon, title=f"Proyeksi Rata-rata {fore_label_ekon} hingga 2028", y_label=fore_label_ekon)
             st.plotly_chart(fig_fore_ekon, use_container_width=True)
        else:
             st.warning("Data historis tidak mencukupi untuk pemodelan proyeksi.")

    st.markdown("---")

    # ── Ranking + Scatter ─────────────────────────────────────────────────────
    col_bar, col_sc = st.columns(2)
    pdrb_col   = "PDRB/Kapita\n2024 (Ribu Rp)"
    pertumb_col = "Pertumbuhan\nPDRB 2024 (%)"
    tpt_col     = "TPT 2024\n(%)"

    with col_bar:
        _section("Peringkat PDRB/Kapita 2024")
        fig_bar = bar_ranked(
            df=master_df, x_col=pdrb_col, y_col="Nama Kab/Kota",
            title="", color_col=pdrb_col, color_scale="Blues",
            height=540, x_label="PDRB/Kapita (Ribu Rp)",
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_sc:
        _section("PDRB/Kapita vs Pertumbuhan Ekonomi")
        if pdrb_col in master_df.columns and pertumb_col in master_df.columns:
            fig_sc = scatter_2var(
                df=master_df, x_col=pdrb_col, y_col=pertumb_col,
                label_col="Nama Kab/Kota",
                title="Ukuran bubble menunjukkan tingkat pengangguran (TPT)",
                color_col="Tipe",
                size_col=tpt_col if tpt_col in master_df.columns else None,
                trendline=False, height=300,
                x_label="PDRB/Kapita (Rb Rp)", y_label="Pertumbuhan PDRB (%)",
            )
            st.plotly_chart(fig_sc, use_container_width=True)

        _section("PDRB/Kapita vs Kemiskinan")
        miskin_col = "% Miskin\n2024"
        if pdrb_col in master_df.columns and miskin_col in master_df.columns:
            fig_sc2 = scatter_2var(
                df=master_df, x_col=pdrb_col, y_col=miskin_col,
                label_col="Nama Kab/Kota",
                title="Daerah berpendapatan tinggi cenderung memiliki kemiskinan lebih rendah",
                color_col="Tipe", trendline=True, height=275,
                x_label="PDRB/Kapita (Rb Rp)", y_label="Kemiskinan (%)",
            )
            st.plotly_chart(fig_sc2, use_container_width=True)

    # ── Tabel historis (expander) ─────────────────────────────────────────────
    with st.expander("Data PDRB/Kapita Historis 2020–2024 (Ribu Rp)"):
        ekon_cols = [c for c in ekonomi_df.columns
                     if any(k in c for k in ["PDRB", "Pertumb", "Nama", "Kode"])]
        ekon_disp = ekonomi_df[[c for c in ekon_cols if c in ekonomi_df.columns]].copy()
        ekon_disp.columns = [c.replace("\n", " ") for c in ekon_disp.columns]
        sort_col = next((c for c in ekon_disp.columns if "2024" in c and "PDRB" in c), None)
        if sort_col:
            ekon_disp = ekon_disp.sort_values(sort_col, ascending=False)
        st.dataframe(ekon_disp.reset_index(drop=True), use_container_width=True,
                     hide_index=True, height=280)
