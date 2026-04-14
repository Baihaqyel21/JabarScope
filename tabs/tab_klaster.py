"""
tab_klaster.py — Tab 6: Analisis Klaster (K-Means + PCA)
"""
import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
from analysis.clustering import (
    prepare_data, compute_elbow, run_kmeans, run_pca,
    cluster_profiles, normalize_profiles, policy_recommendations,
)
from components.charts import elbow_chart, scatter_klaster
from components.maps import choropleth_cluster
from components.radar import radar_chart
from utils.insights import insight_klaster, render_callout
from config import CLUSTERING_VARS, CLUSTERING_LABELS, CLUSTER_COLORS


def _section(text):
    st.markdown(
        f'<div style="font-size:0.68rem; font-weight:600; color:#6b7a99; '
        f'text-transform:uppercase; letter-spacing:0.1em; margin:20px 0 8px; '
        f'padding-left:10px; border-left:2px solid #00d46a;">{text}</div>',
        unsafe_allow_html=True
    )


def render(master_df: pd.DataFrame, geojson: dict | None):
    st.caption(
        "K-Means clustering menggunakan 6 variabel: IPM, Kemiskinan, TPT, "
        "PDRB/Kapita, Sanitasi Layak, Air Minum Layak — data 2024."
    )

    # ── Penjelasan variabel ───────────────────────────────────────────────────
    with st.expander("Variabel & Metodologi Clustering", expanded=False):
        st.markdown(
            "Clustering menggunakan **StandardScaler** lalu **K-Means** pada 6 variabel:\n"
        )
        for var, lbl in CLUSTERING_LABELS.items():
            st.caption(f"· **{lbl}**")
        st.caption("Reduksi dimensi: **PCA 2 komponen** untuk visualisasi scatter.")

    # ── Persiapan Data ────────────────────────────────────────────────────────
    df_clean, X_scaled = prepare_data(master_df)
    X_bytes = X_scaled.tobytes()

    # ── Elbow + Slider ────────────────────────────────────────────────────────
    _section("Metode Elbow — Menentukan Jumlah Klaster Optimal")
    col_elbow, col_ctrl = st.columns([3, 1])
    with col_ctrl:
        st.markdown("<div style='margin-top:8px'></div>", unsafe_allow_html=True)
        k = st.slider("Jumlah klaster (k)", min_value=2, max_value=6, value=4,
                      key="klaster_k",
                      help="Pilih k berdasarkan titik 'siku' pada grafik elbow.")
        st.caption(f"n = {len(df_clean)} daerah")

    with col_elbow:
        with st.spinner("Menghitung..."):
            inertias = compute_elbow(X_bytes, max_k=8)
        fig_elbow = elbow_chart(inertias, optimal_k=k)
        st.plotly_chart(fig_elbow, use_container_width=True)

    st.markdown("---")

    # ── Clustering ────────────────────────────────────────────────────────────
    with st.spinner("Menjalankan K-Means..."):
        labels = run_kmeans(X_bytes, k)
        coords, var_ratio = run_pca(X_bytes)

    df_clean = df_clean.copy()
    df_clean["Klaster"]     = [f"Klaster {l+1}" for l in labels]
    df_clean["Klaster_num"] = labels + 1
    df_clean["PC1"] = coords[:, 0]
    df_clean["PC2"] = coords[:, 1]

    # ── PCA Scatter + Peta ────────────────────────────────────────────────────
    col_pca, col_map = st.columns(2)

    with col_pca:
        _section("Visualisasi PCA 2 Dimensi")
        fig_pca = scatter_klaster(
            df_clean, title="Distribusi Klaster pada Ruang PCA",
            var_ratio=var_ratio, height=400,
        )
        st.plotly_chart(fig_pca, use_container_width=True)

    with col_map:
        _section("Distribusi Klaster di Peta Jawa Barat")
        map_df = master_df[["Kode BPS", "Nama Kab/Kota"]].merge(
            df_clean[["Kode BPS", "Klaster", "Klaster_num"]],
            on="Kode BPS", how="left",
        )
        fig_map = choropleth_cluster(
            df=map_df, geojson=geojson,
            label_col="Nama Kab/Kota", code_col="Kode BPS",
            cluster_col="Klaster", num_col="Klaster_num",
            title=f"{k} Klaster Pembangunan Jawa Barat", height=400,
        )
        st.plotly_chart(fig_map, use_container_width=True)

    st.markdown("---")

    # ── Profil Klaster ────────────────────────────────────────────────────────
    profiles    = cluster_profiles(df_clean, labels)
    norm_prof   = normalize_profiles(profiles)
    dim_labels  = [CLUSTERING_LABELS.get(v, v.replace("\n", " ")) for v in CLUSTERING_VARS]

    # Insight sebelum profil
    insight = insight_klaster(profiles, {})
    if insight:
        render_callout(insight, color="#9b7ff4")

    col_radar, col_prof = st.columns(2)

    with col_radar:
        _section("Profil Rata-rata per Klaster (Radar)")
        fig_radar = radar_chart(
            df=norm_prof, dimensions=CLUSTERING_VARS, label_col="Klaster",
            title="Nilai ternormalisasi 0–100",
            dim_labels=dim_labels, height=400,
        )
        st.plotly_chart(fig_radar, use_container_width=True)

    with col_prof:
        _section("Nilai Rata-rata per Klaster")
        disp = profiles.copy()
        disp.columns = [c.replace("\n", " ") for c in disp.columns]
        st.dataframe(disp.round(2).set_index("Klaster"), use_container_width=True)

        bar_ind = st.selectbox(
            "Tampilkan indikator:",
            CLUSTERING_VARS,
            format_func=lambda x: CLUSTERING_LABELS.get(x, x.replace("\n", " ")),
            key="klaster_bar_ind",
        )
        fig_pb = px.bar(
            profiles.sort_values(bar_ind, ascending=False),
            x="Klaster", y=bar_ind, color="Klaster",
            color_discrete_sequence=CLUSTER_COLORS,
            title=f"Rata-rata {CLUSTERING_LABELS.get(bar_ind, bar_ind.replace(chr(10),' '))}",
            height=250,
        )
        fig_pb.update_layout(
            plot_bgcolor="rgba(0,0,0,0)", paper_bgcolor="rgba(0,0,0,0)",
            font=dict(family="Space Mono, Inter, monospace", size=11, color="#9aa3b5"),
            showlegend=False, margin=dict(l=8, r=8, t=36, b=8),
        )
        st.plotly_chart(fig_pb, use_container_width=True)

    st.markdown("---")

    # ── Anggota Klaster (expander) ────────────────────────────────────────────
    with st.expander("Keanggotaan Klaster — Daftar Lengkap Daerah per Klaster"):
        disp_cols = ["Nama Kab/Kota", "Tipe", "Klaster"] + CLUSTERING_VARS
        if "Skor Komposit" in df_clean.columns:
            disp_cols.append("Skor Komposit")
        avail_dc = [c for c in disp_cols if c in df_clean.columns]
        members  = df_clean[avail_dc].sort_values(["Klaster", "Nama Kab/Kota"]).copy()
        members.columns = [c.replace("\n", " ") for c in members.columns]
        st.dataframe(members.reset_index(drop=True), use_container_width=True,
                     hide_index=True, height=320)

    st.markdown("---")

    # ── Rekomendasi Kebijakan ─────────────────────────────────────────────────
    _section("Rekomendasi Kebijakan per Klaster")
    recs = policy_recommendations(profiles)
    cols = st.columns(min(k, 3))
    for i, (klaster, rec) in enumerate(recs.items()):
        anggota = df_clean[df_clean["Klaster"] == klaster]["Nama Kab/Kota"].tolist()
        color   = CLUSTER_COLORS[i % len(CLUSTER_COLORS)]
        with cols[i % len(cols)]:
            st.markdown(
                f"""<div style="border-left:3px solid {color};
                    padding:10px 14px; border-radius:0 6px 6px 0;
                    margin-bottom:10px; background:rgba(148,163,184,0.06);">
                    <div style="font-size:0.8rem; font-weight:700;
                         color:{color}; margin-bottom:4px;">{klaster}</div>
                    <div style="font-size:0.82rem; line-height:1.5; color:#9aa3b5;">{rec}</div>
                    <div style="font-size:0.75rem; color:#6b7a99; margin-top:6px;">
                    <b style="color:#8892a4;">{len(anggota)} daerah:</b> {', '.join(anggota)}
                    </div></div>""",
                unsafe_allow_html=True,
            )
