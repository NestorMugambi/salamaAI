"""
predictions/feature_engineering/hyp.py

Features expected by xgbhypertension.joblib
──────────────────────────────────────────────────────────────────────────────
Age | Salt_Intake | Stress_Score | BP_History | Sleep_Duration | BMI
Medication | Family_History | Exercise_Level | Smoking_Status
──────────────────────────────────────────────────────────────────────────────
Notes
- Medication       → binary: 0 = None/No, 1 = any medication present
- Exercise_Level   → binary: 0 = inactive/low, 1 = active  (matches 'active'
                     in CVD dataset so models share the same semantics)
- Smoking_Status   → binary: 0 = non-smoker, 1 = smoker
- BP_History       → binary: 0 = No, 1 = Yes
- Family_History   → binary: 0 = No, 1 = Yes
"""

from __future__ import annotations

import math
from typing import Any

from app.models import HealthAssessment, UserProfile


# ── Encoding helpers ──────────────────────────────────────────────────────────

def _safe_float(value: Any, default: float = 0.0) -> float:
    try:
        v = float(value)
        return v if math.isfinite(v) else default
    except (TypeError, ValueError):
        return default


def _medication_to_binary(medication: Any) -> int:
    """
    'None', None, '', 'no', 'false' → 0
    Any actual medication name / 'yes' / '1'  → 1
    """
    if medication is None:
        return 0
    s = str(medication).strip().lower()
    if s in {"none", "no", "false", "0", ""}:
        return 0
    return 1


def _exercise_to_binary(exercise_level: Any) -> int:
    """
    Maps free-text exercise levels to the same binary used by CVD's 'active'.
      Active / High / Moderate  → 1
      Low / Sedentary / None    → 0
    """
    if exercise_level is None:
        return 0
    s = str(exercise_level).strip().lower()
    active_values = {"active", "high", "moderate", "yes", "1", "true", "medium"}
    return 1 if s in active_values else 0


def _smoking_to_binary(smoking_status: Any) -> int:
    """
    'current', 'smoker', 'yes', '1' → 1
    'never', 'former', 'no', '0'    → 0
    """
    if smoking_status is None:
        return 0
    s = str(smoking_status).strip().lower()
    smoker_values = {"current", "smoker", "yes", "1", "true", "current smoker"}
    return 1 if s in smoker_values else 0


def _to_binary(value: Any) -> int:
    if value is None:
        return 0
    if isinstance(value, bool):
        return int(value)
    if isinstance(value, (int, float)):
        return int(bool(value))
    return 1 if str(value).strip().lower() in {"yes", "true", "1", "y"} else 0


# ── Feature engineer ──────────────────────────────────────────────────────────

def engineer_hyp_features(
    profile: UserProfile,
    assessment: HealthAssessment,
) -> dict[str, float]:
    """
    Build the feature dict consumed by xgbhypertension.joblib.

    Parameters
    ----------
    profile    : UserProfile ORM object
    assessment : HealthAssessment ORM object (latest reading)

    Returns
    -------
    Ordered dict matching model training column order.
    """

    age            = _safe_float(profile.age)
    salt_intake    = _safe_float(assessment.salt_intake)
    stress_score   = _safe_float(assessment.stress_score)
    bp_history     = float(_to_binary(assessment.bp_history))
    sleep_duration = _safe_float(assessment.sleep_duration)
    bmi            = _safe_float(assessment.bmi)

    # Binary-encoded fields
    medication      = float(_medication_to_binary(assessment.medication))
    family_history  = float(_to_binary(profile.family_history_hypertension))
    exercise_level  = float(_exercise_to_binary(assessment.exercise_level))
    smoking_status  = float(_smoking_to_binary(assessment.smoking_status))

    return {
        "Age":            age,
        "Salt_Intake":    salt_intake,
        "Stress_Score":   stress_score,
        "BP_History":     bp_history,
        "Sleep_Duration": sleep_duration,
        "BMI":            bmi,
        "Medication":     medication,
        "Family_History": family_history,
        "Exercise_Level": exercise_level,
        "Smoking_Status": smoking_status,
    }