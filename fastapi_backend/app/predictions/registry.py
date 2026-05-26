# predictions/registry.py
import joblib
import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)
MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

MODEL_PATHS = {
    "cvd": ("xgbcvdv3.joblib", "xgbcvd_v3"),
    "hyp": ("xgbhypertensionv1.joblib", "xgbhyp_v1"),
    "chd": ("xgbchdv2.joblib", "xgbchd_v2"),
    "stroke": ("xgbstrokev5.joblib", "xgbstroke_v5"),
}

SCALER_PATHS = {
    "cvd": "scaler.joblib",
    "hyp": None,
    "chd": "chdscalerv2.joblib",
    "stroke": "strokescalerv1.joblib",
}

_models: dict[str, Any] = {}
_scalers: dict[str, Any] = {}

def load_model(disease: str) -> Any:
    if disease not in _models:
        filename, _ = MODEL_PATHS[disease]
        path = MODEL_DIR / filename
        if not path.exists():
            raise FileNotFoundError(f"Model file missing: {path}")
        _models[disease] = joblib.load(path)
    return _models[disease]

def load_scaler(disease: str) -> Any | None:
    scaler_filename = SCALER_PATHS.get(disease)
    if not scaler_filename or disease not in _scalers:
        if not scaler_filename: return None
        path = MODEL_DIR / scaler_filename
        if not path.exists():
            raise FileNotFoundError(f"Scaler missing: {path}")
        _scalers[disease] = joblib.load(path)
    return _scalers[disease]