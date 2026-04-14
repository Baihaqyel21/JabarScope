"""
kpi_cards.py — Komponen KPI metric card.
"""
import streamlit as st


def render_kpi_card(
    label: str,
    value: str,
    delta: str | None = None,
    delta_positive: bool = True,
    icon: str = "",
    help_text: str | None = None,
    help: str | None = None,  # alias
):
    """Render satu KPI metric dengan warna delta."""
    delta_color = "normal" if delta_positive else "inverse"
    help_final = help_text or help
    st.metric(
        label=label,
        value=value,
        delta=delta,
        delta_color=delta_color,
        help=help_final,
    )


def render_kpi_row(kpis: list[dict], max_per_row: int = 4):
    """
    Render daftar KPI card dalam baris.
    kpis: list of dict dengan keys: label, value, delta, delta_positive, icon
    """
    for start in range(0, len(kpis), max_per_row):
        chunk = kpis[start : start + max_per_row]
        cols = st.columns(len(chunk))
        for col, kpi in zip(cols, chunk):
            with col:
                render_kpi_card(
                    label=kpi.get("label", ""),
                    value=kpi.get("value", ""),
                    delta=kpi.get("delta"),
                    delta_positive=kpi.get("delta_positive", True),
                    icon=kpi.get("icon", ""),
                    help_text=kpi.get("help"),
                )
