"""
predictions/feature_engineering/hyp.py

Features expected by xgbhypertensionv1.joblib
──────────────────────────────────────────────────────────────────────────────
Age | Salt_Intake | Stress_Score | BP_History | Sleep_Duration | BMI
Medication | Family_History | Exercise_Level | Smoking_Status
──────────────────────────────────────────────────────────────────────────────
Notes
- Outputs structured types (floats or un-encoded raw uppercase strings) 
  to align with dynamic scikit-learn ColumnTransformer configurations.
"""

from __future__ import annotations

import math
from typing import Any

from app.utils import calculate_age

# ── Feature Sequence Signature Expected by xgbhypertensionv1.joblib ─────────
EXPECTED_FEATURES = [
    "Age",
    "Salt_Intake",
    "Stress_Score",
    "BP_History",
    "Sleep_Duration",
    "BMI",
    "Medication",
    "Family_History",
    "Exercise_Level",
    "Smoking_Status",
]


# ── Encoding helpers ──────────────────────────────────────────────────────────


def _safe_float(value: Any, default: float = float("nan")) -> float:
    try:
        v = float(value)
        return v if math.isfinite(v) else default
    except (TypeError, ValueError):
        return default


def _enum_val_raw(field: Any) -> str:
    """
    Safely extract uppercase string values from:
      - SQLAlchemy Enum instances → field.value
      - Plain strings
    Defaults cleanly to "NONE" to maintain strict OneHotEncoder alignment.
    """
    if field is None:
        return "NONE"

    if hasattr(field, "value"):  # Enum member
        s = str(field.value).strip().upper()
    else:
        s = str(field).strip().upper()

    return s if s not in {"", "NAN", "NAT", "FALSE"} else "NONE"


def _clean_bp_history(bp_history: Any) -> str:
    """Standardizes incoming blood pressure categories into explicit Enum strings."""
    s = _enum_val_raw(bp_history)
    if s in {"NO", "0"}:
        return "NORMAL"
    if s in {"YES", "1", "TRUE"}:
        return "HYPERTENSION"
    return s


def _clean_exercise(exercise_level: Any) -> str:
    """Maps custom physical tracking inputs to expected string categories."""
    s = _enum_val_raw(exercise_level)
    if s in {"1", "TRUE", "Y", "YES", "ACTIVE"}:
        return "MODERATE"
    if s in {"0", "FALSE", "N", "NO", "SEDENTARY"}:
        return "NONE"
    return s


def _clean_binary_string(value: Any) -> str:
    """Converts general truthy/falsy flags into explicit YES/NO string keys."""
    if value is None:
        return "NO"
    if isinstance(value, bool):
        return "YES" if value else "NO"

    s = str(value).strip().upper()
    if s in {"YES", "TRUE", "1", "Y", "HYPERTENSION"}:
        return "YES"
    return "NO"


# ── Feature engineer ──────────────────────────────────────────────────────────


def engineer_hyp_features(profile: Any, assessment: Any) -> dict[str, float | str]:
    """
    Build the feature dict consumed by xgbhypertensionv1.joblib.

    Accepts UserProfile and HealthAssessment ORM objects (or their flat service
    equivalents). Numerical values are prepared as floats, and nominal variables
    are structured as uppercase string keys for the pipeline's OneHotEncoder.
    """

    # ── Numerical Features (StandardScaler Layer) ───────────────────────────
    age = float(calculate_age(profile.date_of_birth))
    salt_intake = _safe_float(profile.salt_intake)
    stress_score = _safe_float(profile.stress_score)
    sleep_duration = _safe_float(profile.sleep_duration)
    bmi = _safe_float(assessment.bmi)

    # ── Categorical Features (OneHotEncoder Layer) ──────────────────────────
    medication = _enum_val_raw(assessment.bp_medication_type)
    smoking_status = _enum_val_raw(assessment.smoking_status)

    bp_history = _clean_bp_history(profile.bp_history)
    exercise_level = _clean_exercise(profile.physical_activity_level)
    family_history = _clean_binary_string(profile.family_history_htn)

    return {
        "Age": age,
        "Salt_Intake": salt_intake,
        "Stress_Score": stress_score,
        "BP_History": bp_history,
        "Sleep_Duration": sleep_duration,
        "BMI": bmi,
        "Medication": medication,
        "Family_History": family_history,
        "Exercise_Level": exercise_level,
        "Smoking_Status": smoking_status,
    }
