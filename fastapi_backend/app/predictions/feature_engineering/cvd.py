from __future__ import annotations

import math
from typing import Any

from app.utils import calculate_age

# ── Feature Sequence Signature Expected by xgbcvdv1.joblib ───────────────────
EXPECTED_FEATURES = [
    "age",
    "gender",
    "height",
    "weight",
    "ap_hi",
    "ap_lo",
    "cholesterol",
    "gluc",
    "smoke",
    "alco",
    "active",
    "bmi",
    "pulse_pressure",
    "log_bmi",
]


# ── Encoding helpers ──────────────────────────────────────────────────────────


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


def _gender_to_binary(sex: Any) -> float:
    """Gender enum / string → 0 = Female, 1 = Male."""
    s = _enum_val(sex)
    if s is None:
        return float("nan")
    return 1.0 if s in {"male", "m"} else 0.0


def _smoke_to_binary(smoking_status: Any) -> float:
    """
    SmokingStatus enum → binary.
    passive / current_light / current_heavy → 1 (active smoker / exposure)
    never / former                          → 0
    """
    s = _enum_val(smoking_status)
    if s is None:
        return float("nan")
    return 1.0 if s in {"passive", "current_light", "current_heavy"} else 0.0


def _alcohol_to_binary(alcohol_use: Any) -> float:
    """
    AlcoholUse enum → binary.
    moderate / heavy → 1
    none             → 0
    """
    s = _enum_val(alcohol_use)
    if s is None:
        return float("nan")
    return 1.0 if s in {"moderate", "heavy"} else 0.0


def _activity_to_binary(activity_level: Any) -> float:
    """
    PhysicalActivity enum → binary (matches CVD training 'active' feature).
    moderate / high → 1
    none / low      → 0
    """
    s = _enum_val(activity_level)
    if s is None:
        return float("nan")
    return 1.0 if s in {"moderate", "high"} else 0.0


def _glucose_to_category(glucose_mgdl: float) -> float:
    """Continuous mg/dL → ordinal 1/2/3."""
    if math.isnan(glucose_mgdl):
        return float("nan")
    if glucose_mgdl < 100:
        return 1.0
    if glucose_mgdl < 126:
        return 2.0
    return 3.0


def _cholesterol_to_category(chol_mgdl: float) -> float:
    """Continuous mg/dL → ordinal 1/2/3."""
    if math.isnan(chol_mgdl):
        return float("nan")
    if chol_mgdl < 200:
        return 1.0
    if chol_mgdl < 240:
        return 2.0
    return 3.0


def _compute_bmi(weight_kg: float, height_m: float) -> float:
    """height must be in metres (as stored in DB)."""
    if (
        math.isnan(height_m)
        or math.isnan(weight_kg)
        or height_m <= 0.0
        or weight_kg <= 0.0
    ):
        return float("nan")
    return weight_kg / (height_m**2)


def _latest_bp(blood_pressures: Any) -> tuple[float, float]:
    """
    blood_pressures is an eagerly-loaded list of BloodPressure ORM objects.
    Returns (systolic, diastolic) from the most recent reading.

    BloodPressure uses start_date_time (not recorded_at) as the timestamp.
    Falls back to list order if the attribute is missing.
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
    systolic = _safe_float(getattr(latest, "systolic_value", None))
    diastolic = _safe_float(getattr(latest, "diastolic_value", None))
    return systolic, diastolic


# ── Feature engineer ──────────────────────────────────────────────────────────


def engineer_cvd_features(profile, assessment) -> dict[str, float]:
    """
    Build the feature dict consumed by xgbcvdv1.joblib.

    Accepts UserProfile and HealthAssessment ORM objects (or their FlatProfile /
    FlatAssessment equivalents from service.py).  All relationship data must
    already be eagerly loaded before this function is called.
    """

    # ── Demographics ──────────────────────────────────────────────────────────
    age = float(calculate_age(profile.date_of_birth))
    gender = _gender_to_binary(profile.sex)

    # ── Anthropometrics (direct columns on HealthAssessment) ──────────────────
    height_m = _safe_float(assessment.height)  # Keep raw meters for BMI conversion
    weight = _safe_float(assessment.weight)  # kg

    # Preprocess height to centimeters (cm) for the model's feature payload
    height_cm = height_m * 100.0 if not math.isnan(height_m) else float("nan")

    # ── Blood pressure (eagerly-loaded relationship) ───────────────────────────
    # blood_pressures is a list; we want the most recent reading.
    ap_hi, ap_lo = _latest_bp(assessment.blood_pressures)

    # ── Labs (direct columns) ─────────────────────────────────────────────────
    cholesterol = _cholesterol_to_category(_safe_float(assessment.total_cholesterol))
    gluc = _glucose_to_category(_safe_float(assessment.glucose))

    # ── Lifestyle (Enum columns directly on HealthAssessment) ─────────────────
    smoke = _smoke_to_binary(assessment.smoking_status)
    alco = _alcohol_to_binary(assessment.alcohol_use)
    active = _activity_to_binary(assessment.physical_activity_level)

    # ── BMI (stored or derived) ───────────────────────────────────────────────
    bmi = _safe_float(assessment.bmi)
    if math.isnan(bmi) or bmi == 0.0:
        bmi = _compute_bmi(weight, height_m)  # Must use meters here

    # ── Derived features ──────────────────────────────────────────────────────
    pulse_pressure = (
        ap_hi - ap_lo if not (math.isnan(ap_hi) or math.isnan(ap_lo)) else float("nan")
    )
    log_bmi = math.log(bmi) if (not math.isnan(bmi) and bmi > 0.0) else float("nan")

    return {
        "age": age,
        "gender": gender,
        "height": height_cm,
        "weight": weight,
        "ap_hi": ap_hi,
        "ap_lo": ap_lo,
        "cholesterol": cholesterol,
        "gluc": gluc,
        "smoke": smoke,
        "alco": alco,
        "active": active,
        "bmi": bmi,
        "pulse_pressure": pulse_pressure,
        "log_bmi": log_bmi,
    }
