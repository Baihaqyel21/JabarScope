"""
loader.py — Load data Excel dan GeoJSON dengan caching Streamlit.
"""
import json
import streamlit as st
import pandas as pd
from config import DATA_PATH, GEOJSON_PATH

SHEET_HEADERS = {
    "master_2024":     1,
    "demografi":       2,
    "kesejahteraan":   2,
    "ekonomi":         2,
    "infrastruktur":   2,
    "tren_long_format": 1,
}


@st.cache_data
def load_all_sheets() -> dict:
    """Load semua sheet Excel. Di-cache per session."""
    return {
        sheet: pd.read_excel(DATA_PATH, sheet_name=sheet, header=hdr)
        for sheet, hdr in SHEET_HEADERS.items()
    }


@st.cache_data
def load_geojson() -> dict | None:
    """Load GeoJSON Jawa Barat. Return None jika file tidak ada."""
    try:
        with open(GEOJSON_PATH, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
