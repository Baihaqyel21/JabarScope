"""
tab_demografi.py — Tab 2: Demografi & Ketenagakerjaan
"""
import streamlit as st
import pandas as pd
from components.charts import bar_ranked, line_trend, scatter_2var, forecast_chart
from utils.insights import insight_demografi, render_callout
from utils.preprocessor import get_prov_avg_tren
from utils.forecast import build_forecast_series


INDICATOR_OPTIONS = {
    "TPT — Tingkat Pengangguran Terbuka (%)": "TPT_Agustus",
    "TPAK — Tingkat Partisipasi Angkatan Kerja (%)":  "TPAK_Agustus",
    "UMK — Upah Minimum Kabupaten/Kota (Rp)": "UMK_Rp",
}


def _section(text):
    st.markdown(
        f'<div style="font-size:0.68rem; font-weight:600; color:#6b7a99; '
        f'text-transform:uppercase; letter-spacing:0.1em; margin:20px 0 8px; '
        f'padding-left:10px; border-left:2px solid #00d46a;">{text}</div>',
        unsafe_allow_html=True
    )


def render(master_df: pd.DataFrame, tren_df: pd.DataFrame, demografi_df: pd.DataFrame):
    st.caption("Analisis kependudukan, ketenagakerjaan, dan upah minimum per kabupaten/kota 2020–2024.")

    all_names = sorted(master_df["Nama Kab/Kota"].tolist())

    # ── Insight (di atas filter & chart) ─────────────────────────────────────
    insight = insight_demografi(master_df)
    if insight:
        render_callout(insight)

    # ── Filter bar ────────────────────────────────────────────────────────────
    col_f1, col_f2 = st.columns([2, 3])
    with col_f1:
        sel_ind_label = st.selectbox("Indikator tren", list(INDICATOR_OPTIONS.keys()),
                                      key="demo_indicator")
        sel_indicator = INDICATOR_OPTIONS[sel_ind_label]
    with col_f2:
        sel_regions = st.multiselect(
            "Pilih kabupaten/kota (maks. 5)", all_names,
            default=all_names[:3], max_selections=5, key="demo_regions",
        )

    # ── Tren ──────────────────────────────────────────────────────────────────
    _section("Tren 2020–2024")
    if sel_regions:
        ind_short = sel_ind_label.split("—")[0].strip()
        prov_avg = get_prov_avg_tren(tren_df, sel_indicator)
        fig_trend = line_trend(
            tren_df=tren_df, indicator=sel_indicator,
            selected_regions=sel_regions, prov_avg=prov_avg,
            y_label=ind_short,
            title=f"{ind_short} · Perbandingan Daerah vs Rata-rata Jawa Barat",
        )
        st.plotly_chart(fig_trend, use_container_width=True)
    else:
        st.info("Pilih minimal satu kabupaten/kota untuk menampilkan grafik tren.")

    st.markdown("---")

    # ── Forecasting / Proyeksi Kedepan ────────────────────────────────────────
    _section("Proyeksi Tren Kedepan (Predictive AI)")
    
    col_fc1, col_fc2 = st.columns([3, 2])
    with col_fc2:
        st.info("💡 **Penjelasan Pemodelan**\n\nProyeksi Demografi menggunakan model **Regresi Linier** terhadap data historis 2020-2024. "
                "Area arsiran abu-abu merupakan *Confidence Interval 95%*.\n\n"
                "Untuk indikator UMK, tren diproyeksikan dari Rata-rata Jawa Barat.")
        
        fore_label_demo = st.selectbox("Pilih Indikator Proyeksi", ["TPT", "TPAK", "UMK"], key="fore_demo")
        fore_ind_map_demo = {
            "TPT": "TPT_Agustus",
            "TPAK": "TPAK_Agustus",
            "UMK": "UMK_Rp"
        }
        
    with col_fc1:
        ind_target_demo = fore_ind_map_demo[fore_label_demo]
        fore_data_demo = build_forecast_series(tren_df, ind_target_demo, horizon=4)
        meta_demo = fore_data_demo.get("metadata", {})
        
        if meta_demo:
             r2_demo = meta_demo.get("r_squared", 0)
             slope_demo = meta_demo.get("slope", 0)
             if slope_demo > 0:
                 trend_text_demo = "Tren **meningkat**"
             else:
                 trend_text_demo = "Tren **menurun**"
                 
             st.markdown(f"Akurasi Model ($R^2$): **{r2_demo:.4f}** | {trend_text_demo} secara linier.")
             
             # Format Y-label if UMK to show in thousands/millions to save space
             fore_title = f"Proyeksi {fore_label_demo} hingga 2028"
             
             fig_fore_demo = forecast_chart(fore_data_demo, title=fore_title, y_label=fore_label_demo)
             st.plotly_chart(fig_fore_demo, use_container_width=True)
        else:
             st.warning("Data historis tidak mencukupi untuk pemodelan proyeksi.")

    st.markdown("---")

    # ── Ranking + Scatter ─────────────────────────────────────────────────────
    col_bar, col_sc = st.columns(2)

    with col_bar:
        _section("Ranking TPT 2024")
        avg_tpt = master_df["TPT 2024\n(%)"].mean()
        df_bar  = master_df.copy()
        df_bar["Di atas Rata-rata"] = df_bar["TPT 2024\n(%)"] > avg_tpt
        fig_bar = bar_ranked(
            df=df_bar, x_col="TPT 2024\n(%)", y_col="Nama Kab/Kota",
            title=f"Rata-rata Jabar: {avg_tpt:.2f}%",
            highlight_col="Di atas Rata-rata",
            height=560, x_label="TPT (%)",
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_sc:
        _section("Kepadatan vs TPT 2024")
        kep_col = next((c for c in master_df.columns if "Kepadatan" in c), None)
        if kep_col:
            fig_sc = scatter_2var(
                df=master_df, x_col=kep_col, y_col="TPT 2024\n(%)",
                label_col="Nama Kab/Kota",
                title="Apakah daerah padat cenderung memiliki pengangguran tinggi?",
                color_col="Tipe", trendline=True, height=340,
                x_label="Kepadatan (jiwa/km²)", y_label="TPT (%)",
            )
            st.plotly_chart(fig_sc, use_container_width=True)

        # UMK dalam expander
        with st.expander("Detail Upah Minimum (UMK) 2024"):
            umk_col = "UMK 2024\n(Rp)"
            if umk_col in master_df.columns:
                umk_df = master_df[["Nama Kab/Kota", "Tipe", umk_col]].copy()
                umk_df = umk_df.sort_values(umk_col, ascending=False)
                umk_df[umk_col] = umk_df[umk_col].apply(
                    lambda x: f"Rp {x:,.0f}" if pd.notna(x) else "—"
                )
                umk_df.columns = ["Kab/Kota", "Tipe", "UMK 2024"]
                st.dataframe(umk_df.reset_index(drop=True), use_container_width=True,
                             hide_index=True, height=270)

    # ── Perbandingan Dua Daerah ───────────────────────────────────────────────
    if st.session_state.get("comparison_mode"):
        st.markdown("---")
        _section("Perbandingan Dua Daerah")
        c1, c2 = st.columns(2)
        with c1:
            r1 = st.selectbox("Daerah A", all_names, index=0, key="demo_comp_a")
        with c2:
            r2 = st.selectbox("Daerah B", all_names, index=1, key="demo_comp_b")

        cols_show = ["TPT 2024\n(%)", "TPAK 2024\n(%)", "UMK 2024\n(Rp)",
                     "Penduduk\n(Ribu)", "IPM 2024", "% Miskin\n2024"]
        r1_row = master_df[master_df["Nama Kab/Kota"] == r1].iloc[0] if r1 else None
        r2_row = master_df[master_df["Nama Kab/Kota"] == r2].iloc[0] if r2 else None
        if r1_row is not None and r2_row is not None:
            avail = [c for c in cols_show if c in master_df.columns]
            comp_df = pd.DataFrame({
                "Indikator": [c.replace("\n", " ") for c in avail],
                r1: [r1_row[c] for c in avail],
                r2: [r2_row[c] for c in avail],
            })
            st.dataframe(comp_df, use_container_width=True, hide_index=True)
