import json
import pandas as pd
from functools import lru_cache
from pathlib import Path

# Resolve paths relative to this file's location, regardless of CWD
_HERE = Path(__file__).resolve().parent        # .../backend/
_ROOT = _HERE.parent                           # .../UTS-Gemini/

DATA_PATH    = str(_ROOT / "jabarscope_data_kabkota.xlsx")
GEOJSON_PATH = str(_ROOT / "data" / "jabar_geojson.json")

SHEET_HEADERS = {
    "master_2024":     1,
    "demografi":       2,
    "kesejahteraan":   2,
    "ekonomi":         2,
    "infrastruktur":   2,
    "tren_long_format": 1,
}

@lru_cache(maxsize=1)
def load_all_sheets() -> dict:
    """Load semua sheet Excel dengan lru_cache"""
    return {
        sheet: pd.read_excel(DATA_PATH, sheet_name=sheet, header=hdr)
        for sheet, hdr in SHEET_HEADERS.items()
    }

@lru_cache(maxsize=1)
def load_geojson() -> dict | None:
    try:
        with open(GEOJSON_PATH, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None
