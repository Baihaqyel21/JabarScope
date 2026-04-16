import sys
import os

# Add the repo root to the Python path so all internal modules resolve
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, ROOT)

from backend.main import app
