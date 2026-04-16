import sys
import os
# Ensure backend path is on PYTHONPATH
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from backend.main import app as fastapi_app

# Vercel expects the handler to be named `app`
app = fastapi_app
