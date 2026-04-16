import sys
import os

# ── Path setup ─────────────────────────────────────────────────────────────────
# api/ is the Vercel function root; we add its parent (repo root) so that
# backend/, utils/, analysis/, and config are all importable.
_API_DIR  = os.path.dirname(os.path.abspath(__file__))
_REPO_ROOT = os.path.dirname(_API_DIR)
sys.path.insert(0, _REPO_ROOT)

# Override the data paths BEFORE importing backend modules that read them.
# On Vercel the xlsx + data/ folder are copied into api/ at deploy time.
os.environ.setdefault("JABARSCOPE_DATA_PATH",   os.path.join(_API_DIR, "jabarscope_data_kabkota.xlsx"))
os.environ.setdefault("JABARSCOPE_GEOJSON_PATH", os.path.join(_API_DIR, "data", "jabar_geojson.json"))

# ── Patch the loader so it reads from the api/ copies ─────────────────────────
import backend.fastapi_loader as _loader
_loader.DATA_PATH    = os.environ["JABARSCOPE_DATA_PATH"]
_loader.GEOJSON_PATH = os.environ["JABARSCOPE_GEOJSON_PATH"]
# Clear the lru_cache so re-imports pick up the new path
_loader.load_all_sheets.cache_clear()
_loader.load_geojson.cache_clear()

# ── Import and expose the FastAPI app ──────────────────────────────────────────
from backend.main import app   # noqa: E402  (must come after path patches)
