"""
radar.py — Radar chart builder untuk profil daerah/klaster.
"""
import pandas as pd
import plotly.graph_objects as go
from config import CLUSTER_COLORS, COLORS


def radar_chart(
    df: pd.DataFrame,
    dimensions: list[str],
    label_col: str,
    title: str,
    selected: list[str] | None = None,
    height: int = 430,
    dim_labels: list[str] | None = None,
) -> go.Figure:
    """
    Radar chart multi-trace.
    df: tiap baris = satu entitas (klaster atau daerah).
    dimensions: kolom numerik yang jadi sumbu radar.
    dim_labels: label yang ditampilkan (jika berbeda dari nama kolom).
    """
    if selected:
        df = df[df[label_col].isin(selected)].copy()

    cats = dim_labels if dim_labels else [d.replace("\n", " ") for d in dimensions]
    cats_closed = cats + [cats[0]]

    fig = go.Figure()
    for i, (_, row) in enumerate(df.iterrows()):
        values = [row[d] for d in dimensions]
        values_closed = values + [values[0]]
        fig.add_trace(go.Scatterpolar(
            r=values_closed,
            theta=cats_closed,
            fill="toself",
            name=str(row[label_col]),
            line_color=CLUSTER_COLORS[i % len(CLUSTER_COLORS)],
            fillcolor=CLUSTER_COLORS[i % len(CLUSTER_COLORS)],
            opacity=0.45,
        ))

    fig.update_layout(
        polar=dict(
            radialaxis=dict(visible=True, range=[0, 100],
                            tickfont=dict(size=9)),
            angularaxis=dict(tickfont=dict(size=11)),
        ),
        title=dict(text=title, font=dict(size=14, color="#e8eaf0")),
        height=height,
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Space Mono, Inter, monospace", size=11, color="#9aa3b5"),
        showlegend=True,
        legend=dict(orientation="h", y=-0.1, font=dict(color="#9aa3b5")),
        margin=dict(l=30, r=30, t=50, b=60),
    )
    return fig


def radar_welfare(
    df: pd.DataFrame,
    label_col: str,
    selected_regions: list[str],
    height: int = 400,
) -> go.Figure:
    """
    Radar kesejahteraan 4 dimensi: IPM, % Miskin (diinvert), Sanitasi, Air Minum.
    Semua dinormalisasi ke 0–100.
    """
    from sklearn.preprocessing import MinMaxScaler

    dims = {
        "IPM 2024": True,        # True = higher is better
        "% Miskin\n2024": False,  # False = lower is better (di-invert)
        "Sanitasi\nLayak 2024 (%)": True,
        "Air Minum\nLayak 2024 (%)": True,
    }
    labels_display = ["IPM", "Kemiskinan (inv.)", "Sanitasi", "Air Minum"]
    available = {k: v for k, v in dims.items() if k in df.columns}
    if not available:
        fig = go.Figure()
        fig.add_annotation(text="Data tidak tersedia.", xref="paper", yref="paper",
                           x=0.5, y=0.5, showarrow=False)
        return fig

    scaler = MinMaxScaler()
    norm_df = df[[label_col] + list(available.keys())].copy()
    for col, higher_better in available.items():
        vals = norm_df[[col]].fillna(norm_df[col].median())
        norm_df[col] = scaler.fit_transform(vals).flatten() * 100
        if not higher_better:
            norm_df[col] = 100 - norm_df[col]

    selected_df = norm_df[norm_df[label_col].isin(selected_regions)]
    dim_cols = list(available.keys())
    display_lbls = [labels_display[i] for i, k in enumerate(dims.keys()) if k in available]
    return radar_chart(selected_df, dim_cols, label_col,
                       "Profil Kesejahteraan (Nilai Ternormalisasi 0–100)",
                       dim_labels=display_lbls, height=height)
