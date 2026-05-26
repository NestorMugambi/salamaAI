"""
predictions/feature_engineering/chd.py
"""

from __future__ import annotations

import math
from typing import Any

from app.models import HealthAssessment, UserProfile
from app.utils import calculate_age

# ── Feature Layout Signature ──────────────────────────────────────────────────
# This list preserves the exact column sequence expected by chdscalerv1.joblib
# and chdriskv1.joblib. Do not alter this order!
CHD_FEATURE_ORDER: list[str] = [
    "age",
    "education",
    "sex",
    "cigsPerDay",
    "BPMeds",
    "prevalentStroke",
    "prevalentHyp",
    "diabetes",
    "totChol",
    "sysBP",
    "diaBP",
    "BMI",
    "heartRate",
    "glucose",
]

# ── Encoding helpers ──────────────────────────────────────────────────────────


def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        v = float(value)
        return v if math.isfinite(v) else default
    except (TypeError, ValueError):
        return default


def _enum_val(field: Any) -> str | None:
    """
    Safely extract string value from:
      - Enum member -> field.value
      - plain string
      - None
    """
    if field is None:
        return None

    if hasattr(field, "value"):
        return str(field.value).strip().lower()

    return str(field).strip().lower()


def _sex_to_binary(sex: Any) -> int:
    """
    Encode gender exactly as training dataset.

    Male   -> 1
    Female -> 0
    """

    s = _enum_val(sex)

    if s is None:
        return 0

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


def _smoke_to_binary(smoking_status: Any) -> float:
    """
    SmokingStatus enum → binary.

    passive / current_light / current_heavy → 1
    never / former                          → 0
    """

    s = _enum_val(smoking_status)

    if s is None:
        return 0.0

    return (
        1.0
        if s
        in {
            "passive",
            "current_light",
            "current_heavy",
        }
        else 0.0
    )


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

    s = _enum_val(education)

    if s is None:
        return 1.0

    return _EDUCATION_MAP.get(s, 1.0)


# ── Relationship helpers ──────────────────────────────────────────────────────


def _latest_bp(blood_pressures: Any) -> tuple[float, float]:
    """
    Returns latest systolic and diastolic values.
    """

    if not blood_pressures:
        return float("nan"), float("nan")

    try:
        ordered = sorted(
            blood_pressures,
            key=lambda bp: bp.start_date_time,
            reverse=True,
        )
    except (AttributeError, TypeError):
        ordered = list(blood_pressures)

    if not ordered:
        return float("nan"), float("nan")

    latest = ordered[0]

    systolic = _safe_float(
        getattr(latest, "systolic_value", None),
        default=float("nan"),
    )

    diastolic = _safe_float(
        getattr(latest, "diastolic_value", None),
        default=float("nan"),
    )

    return systolic, diastolic


def _latest_heart_rate(heart_rates: Any) -> float:
    """
    Returns latest heart rate value.
    """

    if not heart_rates:
        return float("nan")

    try:
        ordered = sorted(
            heart_rates,
            key=lambda hr: hr.start_date_time,
            reverse=True,
        )
    except (AttributeError, TypeError):
        ordered = list(heart_rates)

    if not ordered:
        return float("nan")

    latest = ordered[0]

    return _safe_float(
        getattr(latest, "value", None),
        default=float("nan"),
    )


# ── Feature engineering ───────────────────────────────────────────────────────


def engineer_chd_features(
    profile: UserProfile,
    assessment: HealthAssessment,
) -> dict[str, float]:
    """
    Build feature dictionary consumed by chdriskv1.joblib
    """

    # ── Demographics ─────────────────────────────────────────────────────────

    age = float(calculate_age(profile.date_of_birth))

    education = _safe_float(_encode_education(getattr(profile, "education", None)))

    sex = float(_sex_to_binary(profile.sex))

    # ── Lifestyle ────────────────────────────────────────────────────────────

    smoking_binary = _smoke_to_binary(assessment.smoking_status)

    # Dataset expects float
    cigs_per_day = _safe_float(
        getattr(profile, "cigs_per_day", 0),
        default=0.0,
    )

    # If non-smoker, enforce 0 cigarettes/day
    if smoking_binary == 0.0:
        cigs_per_day = 0.0

    # ── Medical history ──────────────────────────────────────────────────────

    bp_meds = _safe_float(
        assessment.on_bp_medication,
        default=0.0,
    )

    prevalent_stroke = float(_to_binary(profile.prevalent_stroke))

    prevalent_hyp = float(_to_binary(profile.prevalent_hypertension))

    diabetes = float(_to_binary(profile.diabetes))

    # ── Clinical measurements ────────────────────────────────────────────────

    tot_chol = _safe_float(
        assessment.total_cholesterol,
        default=float("nan"),
    )

    sys_bp, dia_bp = _latest_bp(assessment.blood_pressures)

    bmi = _safe_float(
        assessment.bmi,
        default=float("nan"),
    )

    heart_rate = _latest_heart_rate(assessment.heart_rates)

    glucose = _safe_float(
        assessment.glucose,
        default=float("nan"),
    )

    # Generated using the exact sequence configuration defined in CHD_FEATURE_ORDER
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
