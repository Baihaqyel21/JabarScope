"""
charts.py — Reusable Plotly chart builders untuk JabarScope.
"""
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from config import COLORS, CLUSTER_COLORS


def _base_layout(**kwargs) -> dict:
    return dict(
        plot_bgcolor="rgba(0,0,0,0)",
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Space Mono, Inter, monospace", size=11, color="#9aa3b5"),
        margin=dict(l=10, r=10, t=45, b=10),
        **kwargs,
    )


def bar_ranked(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    title: str,
    color_col: str | None = None,
    highlight_col: str | None = None,
    height: int = 520,
    x_label: str | None = None,
    color_scale: str = "Blues",
) -> go.Figure:
    """Bar chart horizontal, diurutkan berdasarkan x_col."""
    df_s = df.sort_values(x_col, ascending=True).copy()

    if highlight_col and highlight_col in df_s.columns:
        colors = df_s[highlight_col].map(
            {True: COLORS["danger"], False: COLORS["primary"]}
        ).tolist()
        fig = px.bar(df_s, x=x_col, y=y_col, orientation="h",
                     title=title, height=height)
        fig.update_traces(marker_color=colors)
    elif color_col and color_col in df_s.columns:
        fig = px.bar(df_s, x=x_col, y=y_col, orientation="h",
                     color=x_col, color_continuous_scale=color_scale,
                     title=title, height=height)
    else:
        fig = px.bar(df_s, x=x_col, y=y_col, orientation="h",
                     title=title, height=height,
                     color_discrete_sequence=[COLORS["primary"]])

    fig.update_layout(**_base_layout())
    if x_label:
        fig.update_xaxes(title_text=x_label)
    fig.update_yaxes(tickfont=dict(size=11))
    return fig


def bar_grouped(
    df: pd.DataFrame,
    x_col: str,
    y_cols: list[str],
    title: str,
    colors: list[str] | None = None,
    height: int = 450,
) -> go.Figure:
    """Bar chart grouped/stacked untuk beberapa seri."""
    fig = go.Figure()
    palette = colors or [COLORS["primary"], COLORS["accent"],
                         COLORS["good"], COLORS["danger"]]
    for i, col in enumerate(y_cols):
        fig.add_bar(name=col, x=df[x_col], y=df[col],
                    marker_color=palette[i % len(palette)])
    fig.update_layout(barmode="group", title=title, height=height,
                      **_base_layout())
    return fig


def line_trend(
    tren_df: pd.DataFrame,
    indicator: str,
    selected_regions: list[str],
    prov_avg: pd.DataFrame | None = None,
    y_label: str | None = None,
    title: str | None = None,
    height: int = 420,
) -> go.Figure:
    """
    Line chart tren multi-daerah + opsional rata-rata provinsi (garis putus).
    tren_df harus memiliki kolom: nama, indikator, tahun, nilai.
    """
    filtered = tren_df[
        (tren_df["indikator"] == indicator) &
        (tren_df["nama"].isin(selected_regions))
    ].copy()

    display_title = title or f"Tren {indicator}"
    fig = px.line(
        filtered, x="tahun", y="nilai", color="nama",
        markers=True, title=display_title, height=height,
    )

    if prov_avg is not None and not prov_avg.empty:
        fig.add_scatter(
            x=prov_avg["tahun"],
            y=prov_avg["Rata-rata Jabar"],
            mode="lines+markers",
            name="— Rata-rata Jabar",
            line=dict(dash="dash", color=COLORS["accent"], width=2.5),
            marker=dict(symbol="diamond", size=8),
        )

    fig.update_layout(**_base_layout())
    fig.update_xaxes(title_text="Tahun", dtick=1)
    if y_label:
        fig.update_yaxes(title_text=y_label)
    return fig


def scatter_2var(
    df: pd.DataFrame,
    x_col: str,
    y_col: str,
    label_col: str,
    title: str,
    color_col: str | None = None,
    size_col: str | None = None,
    trendline: bool = True,
    height: int = 430,
    x_label: str | None = None,
    y_label: str | None = None,
) -> go.Figure:
    """Scatter plot dua variabel dengan hover nama daerah."""
    kwargs = dict(
        data_frame=df, x=x_col, y=y_col,
        hover_name=label_col,
        title=title, height=height,
    )
    if color_col and color_col in df.columns:
        kwargs["color"] = color_col
    if size_col and size_col in df.columns:
        kwargs["size"] = size_col
        kwargs["size_max"] = 30
    if trendline:
        kwargs["trendline"] = "ols"

    fig = px.scatter(**kwargs)
    fig.update_traces(marker=dict(size=9 if not size_col else None,
                                  opacity=0.85))
    fig.update_layout(**_base_layout())
    if x_label:
        fig.update_xaxes(title_text=x_label)
    if y_label:
        fig.update_yaxes(title_text=y_label)
    return fig


def stacked_bar_jalan(
    df: pd.DataFrame,
    label_col: str,
    height: int = 540,
) -> go.Figure:
    """Stacked bar kondisi jalan per kab/kota."""
    cols_colors = [
        ("Baik (km)",       COLORS["good"]),
        ("Sedang (km)",     "#F1C40F"),
        ("Rusak (km)",      COLORS["warning"]),
        ("Rusak Berat (km)", COLORS["danger"]),
    ]
    sort_col = "% Jalan\nBaik"
    df_s = df.sort_values(sort_col, ascending=False).copy() if sort_col in df.columns else df.copy()
    fig = go.Figure()
    for col, color in cols_colors:
        if col in df_s.columns:
            fig.add_bar(
                name=col.replace(" (km)", ""),
                x=df_s[label_col], y=df_s[col],
                marker_color=color,
                hovertemplate=f"%{{y:.1f}} km<extra>{col}</extra>",
            )
    fig.update_layout(
        barmode="stack", title="Kondisi Jalan per Kabupaten/Kota (km)",
        height=height, **_base_layout(),
    )
    fig.update_xaxes(tickangle=-45, tickfont=dict(size=10))
    return fig


def scatter_klaster(
    df: pd.DataFrame,
    title: str,
    var_ratio: tuple | None = None,
    height: int = 450,
) -> go.Figure:
    """
    PCA 2D scatter untuk clustering.
    df harus punya: PC1, PC2, Klaster, Nama Kab/Kota (atau Nama Pendek).
    """
    label_col = "Nama Pendek" if "Nama Pendek" in df.columns else "Nama Kab/Kota"
    fig = px.scatter(
        df, x="PC1", y="PC2", color="Klaster",
        hover_name=label_col,
        color_discrete_sequence=CLUSTER_COLORS,
        title=title, height=height,
        symbol="Tipe" if "Tipe" in df.columns else None,
    )
    fig.update_traces(marker=dict(size=11, opacity=0.88))
    x_lbl = f"PC1 ({var_ratio[0]*100:.1f}%)" if var_ratio is not None else "PC1"
    y_lbl = f"PC2 ({var_ratio[1]*100:.1f}%)" if var_ratio is not None else "PC2"
    fig.update_layout(**_base_layout())
    fig.update_xaxes(title_text=x_lbl)
    fig.update_yaxes(title_text=y_lbl)
    return fig


def elbow_chart(inertias: dict, optimal_k: int | None = None) -> go.Figure:
    """Elbow method chart."""
    ks = list(inertias.keys())
    vals = list(inertias.values())
    fig = go.Figure()
    fig.add_scatter(x=ks, y=vals, mode="lines+markers",
                    marker=dict(size=9, color=COLORS["primary"]),
                    line=dict(color=COLORS["primary"], width=2),
                    name="Inertia")
    if optimal_k and optimal_k in inertias:
        fig.add_scatter(
            x=[optimal_k], y=[inertias[optimal_k]],
            mode="markers",
            marker=dict(size=15, color=COLORS["accent"],
                        symbol="star", line=dict(color="black", width=1)),
            name=f"k optimal ({optimal_k})",
        )
    fig.update_layout(
        title="Metode Elbow — Menentukan Jumlah Klaster Optimal",
        xaxis_title="Jumlah Klaster (k)",
        yaxis_title="Inertia (Within-cluster Sum of Squares)",
        **_base_layout(height=380),
    )
    fig.update_xaxes(dtick=1)
    return fig


def forecast_chart(
    forecast_data: dict,
    title: str,
    color: str = COLORS["primary"],
    height: int = 400,
    y_label: str | None = None
) -> go.Figure:
    """Line chart untuk data historis dan proyeksi masa depan beserta Confidence Interval."""
    points = forecast_data.get("data", [])
    if not points:
        return go.Figure()

    df = pd.DataFrame(points)
    hist_df = df[~df["is_forecast"]]
    fore_df = df[df["is_forecast"]]

    fig = go.Figure()
    
    # Historis
    if not hist_df.empty:
        fig.add_scatter(
            x=hist_df["tahun"], y=hist_df["nilai"],
            mode="lines+markers",
            name="Historis",
            line=dict(color=color, width=2.5),
            marker=dict(size=8)
        )
        # Menghubungkan titik akhir historis dengan titik awal proyeksi
        if not fore_df.empty:
            connect_df = pd.concat([hist_df.iloc[[-1]], fore_df.iloc[[0]]])
            fig.add_scatter(
                x=connect_df["tahun"], y=connect_df["nilai"],
                mode="lines",
                showlegend=False,
                line=dict(color=COLORS["warning"], width=2.5, dash="dash")
            )

    # Proyeksi
    if not fore_df.empty:
        # Pengecekan ada bounds atau tidak
        if "nilai_upper" in fore_df.columns and "nilai_lower" in fore_df.columns:
            fig.add_scatter(
                x=pd.concat([fore_df["tahun"], fore_df["tahun"][::-1]]),
                y=pd.concat([fore_df["nilai_upper"], fore_df["nilai_lower"][::-1]]),
                fill="toself",
                fillcolor=f"rgba({int(COLORS['warning'][1:3], 16)}, {int(COLORS['warning'][3:5], 16)}, {int(COLORS['warning'][5:], 16)}, 0.15)",
                line=dict(color="rgba(255,255,255,0)"),
                hoverinfo="skip",
                showlegend=True,
                name="Confidence Interval 95%"
            )
            
        fig.add_scatter(
            x=fore_df["tahun"], y=fore_df["nilai"],
            mode="lines+markers+text",
            name="Proyeksi (Linear Reg.)",
            line=dict(color=COLORS["warning"], width=2.5, dash="dash"),
            marker=dict(size=8, symbol="star-diamond"),
            text=[f"{v:.1f}" for v in fore_df["nilai"]],
            textposition="top center",
            textfont=dict(color=COLORS["warning"], size=10)
        )

    fig.update_layout(
        title=title,
        height=height,
        hovermode="x unified",
        **_base_layout()
    )
    if y_label:
        fig.update_yaxes(title_text=y_label)
    fig.update_xaxes(title_text="Tahun", dtick=1)
    
    return fig

