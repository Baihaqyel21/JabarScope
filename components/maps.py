"""
maps.py — Plotly choropleth map builder untuk Jawa Barat.
"""
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from config import GEOJSON_KEY, MAP_COLORSCALE_SEQ, CLUSTER_COLORS


def choropleth_map(
    df: pd.DataFrame,
    geojson: dict,
    value_col: str,
    label_col: str,
    code_col: str,
    title: str,
    colorscale: str = MAP_COLORSCALE_SEQ,
    height: int = 480,
    hover_cols: list[str] | None = None,
    reverse_scale: bool = False,
) -> go.Figure:
    """
    Choropleth map Jawa Barat.
    geojson_key di config.py harus match dengan code_col di df.
    Kab. Pangandaran (3218) tidak ada di GeoJSON → akan kosong di peta.
    """
    if geojson is None:
        fig = go.Figure()
        fig.add_annotation(
            text="GeoJSON tidak tersedia. Peta tidak dapat ditampilkan.",
            xref="paper", yref="paper", x=0.5, y=0.5,
            showarrow=False, font=dict(size=14),
        )
        fig.update_layout(height=height, paper_bgcolor="rgba(0,0,0,0)")
        return fig

    hover_data = {value_col: True, code_col: False}
    if hover_cols:
        for hc in hover_cols:
            if hc in df.columns and hc != value_col:
                hover_data[hc] = True

    fig = px.choropleth(
        df,
        geojson=geojson,
        locations=code_col,
        featureidkey=f"properties.{GEOJSON_KEY}",
        color=value_col,
        hover_name=label_col,
        hover_data=hover_data,
        color_continuous_scale=colorscale,
        title=title,
        height=height,
        color_continuous_midpoint=None,
    )
    if reverse_scale:
        fig.update_coloraxes(reversescale=True)

    fig.update_geos(fitbounds="locations", visible=False)
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Space Mono, Inter, monospace", size=11, color="#9aa3b5"),
        margin=dict(l=0, r=0, t=45, b=0),
        coloraxis_colorbar=dict(
            title=dict(text=value_col.replace("\n", " "), side="right"),
            thickness=14,
            tickfont=dict(color="#9aa3b5"),
        ),
    )
    return fig


def choropleth_cluster(
    df: pd.DataFrame,
    geojson: dict,
    label_col: str,
    code_col: str,
    cluster_col: str,
    num_col: str,
    title: str,
    height: int = 480,
) -> go.Figure:
    """
    Choropleth khusus clustering — warna kategoris per klaster.
    num_col: kolom integer untuk color (1, 2, 3, ...)
    """
    if geojson is None:
        fig = go.Figure()
        fig.add_annotation(
            text="GeoJSON tidak tersedia.",
            xref="paper", yref="paper", x=0.5, y=0.5,
            showarrow=False, font=dict(size=14),
        )
        fig.update_layout(height=height, paper_bgcolor="rgba(0,0,0,0)")
        return fig

    fig = px.choropleth(
        df,
        geojson=geojson,
        locations=code_col,
        featureidkey=f"properties.{GEOJSON_KEY}",
        color=cluster_col,
        hover_name=label_col,
        hover_data={cluster_col: True, num_col: False, code_col: False},
        color_discrete_sequence=CLUSTER_COLORS,
        title=title,
        height=height,
    )
    fig.update_geos(fitbounds="locations", visible=False)
    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        font=dict(family="Space Mono, Inter, monospace", size=11, color="#9aa3b5"),
        margin=dict(l=0, r=0, t=45, b=0),
    )
    return fig
