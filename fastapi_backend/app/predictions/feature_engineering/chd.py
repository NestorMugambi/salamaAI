"""
predictions/feature_engineering/chd.py
"""

from __future__ import annotations

import math
from typing import Any

from app.models import HealthAssessment, UserProfile
from app.utils import calculate_age

# ── Encoding helpers ──────────────────────────────────────────────────────────

def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        v = float(value)
        return v if math.isfinite(v) else default
    except (TypeError, ValueError):
        return default


def _sex_to_binary(sex: Any) -> int:
    """
    Encode gender exactly as training dataset.

    Male   -> 1
    Female -> 0
    """

    if sex is None:
        return 0

    s = str(sex).strip().lower()

    return 1 if s in {"male", "m", "1"} else 0


def _to_binary(
    value: Any,
    truthy_values: set | None = None,
) -> int:
    """
    Convert values to 0/1 binary.
    """

    if value is None:
        return 0

    if isinstance(value, bool):
        return int(value)

    if isinstance(value, (int, float)):
        return int(bool(value))

    truthy = truthy_values or {
        "yes",
        "true",
        "1",
        "y",
    }

    return 1 if str(value).strip().lower() in truthy else 0


# ── Education encoding ────────────────────────────────────────────────────────
# MUST match training preprocessing exactly

_EDUCATION_MAP: dict[str, float] = {
    "primary": 1.0,

    "high_school": 2.0,
    "high school": 2.0,

    "undergraduate": 3.0,
    "undergrad": 3.0,

    "graduate": 4.0,
}


def _encode_education(education: Any) -> float:
    """
    Encode education level to training ordinal values.
    """

    if education is None:
        return 1.0

    s = str(education).strip().lower()

    return _EDUCATION_MAP.get(s, 1.0)


# ── Feature engineering ───────────────────────────────────────────────────────

def engineer_chd_features(
    profile: UserProfile,
    assessment: HealthAssessment,
) -> dict[str, float]:
    """
    Build feature dictionary consumed by chdriskv1.joblib
    """

    # ── Demographics ─────────────────────────────────────────────────────────

    age = float(
      calculate_age(profile.date_of_birth)
    )

    education = float(
        _encode_education(
            getattr(profile, "education", None)
        )
    )

    sex = float(
        _sex_to_binary(profile.sex)
    )

    # ── Lifestyle ────────────────────────────────────────────────────────────

    # Continuous float feature
    cigs_per_day = _safe_float(
        profile.cigs_per_day,
        default=0.0,
    )

    # ── Medical history ──────────────────────────────────────────────────────

    # Dataset expects float values
    bp_meds = _safe_float(
        assessment.on_bp_medication,
        default=0.0,
    )

    prevalent_stroke = float(
        _to_binary(
            profile.prevalent_stroke
        )
    )

    prevalent_hyp = float(
        _to_binary(
            profile.prevalent_hypertension
        )
    )

    diabetes = float(
        _to_binary(
            profile.diabetes
        )
    )

    # ── Clinical measurements ────────────────────────────────────────────────

    tot_chol = _safe_float(
        assessment.total_cholesterol
    )

    latest_bp = (
        assessment.blood_pressures[-1]
        if assessment.blood_pressures
        else None
    )

    sys_bp = _safe_float(
        latest_bp.systolic_value if latest_bp else None
    )

    dia_bp = _safe_float(
        latest_bp.diastolic_value if latest_bp else None
    )

    bmi = _safe_float(
        assessment.bmi
    )

    heart_rate = _safe_float(
        assessment.heart_rates.value
    )

    # Continuous glucose value
    glucose = _safe_float(
        assessment.glucose
    )

    return {
        "age": age,
        "education": education,
        "sex": sex,
        "cigsPerDay": cigs_per_day,
        "BPMeds": bp_meds,
        "prevalentStroke": prevalent_stroke,
        "prevalentHyp": prevalent_hyp,
        "diabetes": diabetes,
        "totChol": tot_chol,
        "sysBP": sys_bp,
        "diaBP": dia_bp,
        "BMI": bmi,
        "heartRate": heart_rate,
        "glucose": glucose,
    }