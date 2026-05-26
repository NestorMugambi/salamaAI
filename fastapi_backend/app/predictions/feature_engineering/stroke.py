"""
predictions/feature_engineering/stroke.py
"""

from __future__ import annotations

import math
from typing import Any

from app.models import HealthAssessment, UserProfile
from app.utils import calculate_age

# ── Feature Sequence Signature Expected by xgbstrokev2.joblib ────────────────
EXPECTED_FEATURES = [
    "gender",
    "age",
    "hypertension",
    "heart_disease",
    "work_type",
    "avg_glucose_level",
    "bmi",
]

# ── Helpers ───────────────────────────────────────────────────────────────────


def _safe_float(value: Any, default: float = float("nan")) -> float:
    try:
        v = float(value)
        return v if math.isfinite(v) else default
    except (TypeError, ValueError):
        return default


def _enum_val(field: Any) -> str | None:
    """
    Safely extract a string value from either:
      - a SQLAlchemy Enum instance  → field.value
      - a plain string              → field.strip().lower()
      - None                        → None
    """
    if field is None:
        return None
    if hasattr(field, "value"):  # Enum member
        return str(field.value).strip().lower()
    return str(field).strip().lower()


def _gender_encode(sex: Any) -> float:
    """
    Match training preprocessing exactly:
    Female -> 1.0
    Male   -> 0.0
    Other  -> -1.0
    """
    s = _enum_val(sex)
    if s is None:
        return -1.0
    if s in {"female", "f"}:
        return 1.0
    if s in {"male", "m"}:
        return 0.0
    return -1.0


def _to_binary(value: Any) -> float:
    if value is None:
        return 0.0

    if isinstance(value, bool):
        return float(value)

    if isinstance(value, (int, float)):
        return float(bool(value))

    return (
        1.0
        if str(value).strip().lower()
        in {
            "yes",
            "true",
            "1",
            "y",
        }
        else 0.0
    )


# ── Work-type encoding ────────────────────────────────────────────────────────
_WORK_TYPE_MAP: dict[str, float] = {
    "private": 0.0,
    "self-employed": 1.0,
    "self employed": 1.0,
    "selfemployed": 1.0,
    "govt_job": 2.0,
    "government": 2.0,
    "govt": 2.0,
    "children": -1.0,
    "child": -1.0,
    "never_worked": -2.0,
    "never worked": -2.0,
}


def _encode_work_type(work_type: Any) -> float:
    """Encode work type exactly as training preprocessing. Default -> Private (0.0)"""
    if work_type is None:
        return 0.0
    s = _enum_val(work_type)
    if s is None:
        return 0.0
    return _WORK_TYPE_MAP.get(s, 0.0)


def _compute_bmi(weight_kg: float, height_cm: float) -> float:
    if (
        math.isnan(height_cm)
        or math.isnan(weight_kg)
        or height_cm <= 0
        or weight_kg <= 0
    ):
        return float("nan")

    height_m = height_cm / 100.0
    return weight_kg / (height_m**2)


# ── Feature engineering ───────────────────────────────────────────────────────


def engineer_stroke_features(
    profile: UserProfile,
    assessment: HealthAssessment,
) -> dict[str, float]:
    """
    Build feature dictionary for xgbstrokev2.joblib
    """
    gender = _gender_encode(profile.sex)
    age = float(calculate_age(profile.date_of_birth))
    hypertension = _to_binary(getattr(profile, "prevalent_hypertension", None))
    heart_disease = _to_binary(getattr(profile, "heart_disease", None))

    work_type = _encode_work_type(getattr(profile, "work_type", None))

    # Continuous glucose level (uses nan as fallback over dangerous 0.0)
    avg_glucose_level = _safe_float(getattr(assessment, "avg_glucose_level", None))

    # BMI Isolation and Safety Checks
    bmi = _safe_float(getattr(assessment, "bmi", None))

    if math.isnan(bmi) or bmi == 0.0:
        height_val = _safe_float(
            getattr(profile, "height", None)
            or getattr(assessment, "height", float("nan"))
        )
        weight_val = _safe_float(
            getattr(profile, "weight", None)
            or getattr(assessment, "weight", float("nan"))
        )

        # Guard Check: Convert raw DB meters (e.g. 1.75) to explicit cm if required by _compute_bmi
        if not math.isnan(height_val) and height_val < 3.0:
            height_val = height_val * 100.0

        bmi = _compute_bmi(weight_val, height_val)

    return {
        "gender": gender,
        "age": age,
        "hypertension": hypertension,
        "heart_disease": heart_disease,
        "work_type": work_type,
        "avg_glucose_level": avg_glucose_level,
        "bmi": bmi,
    }
