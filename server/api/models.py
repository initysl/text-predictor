from pathlib import Path
import os
import sys

PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from core.predict import TextPredictor


def get_model_dir():
    """Model directory, overridable with MODEL_DIR (used by tests)"""
    return Path(os.getenv('MODEL_DIR', PROJECT_ROOT / 'models'))


def load_predictor():
    """Load all models into a single predictor instance"""
    return TextPredictor(model_dir=get_model_dir())
