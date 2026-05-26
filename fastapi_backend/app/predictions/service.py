"""
predictions/service.py
Orchestrates feature engineering → scaling orchestration → model inference → result persistence.

Lazy-load fix
─────────────
HealthAssessment has two relationships that need eager loading:
  - blood_pressures  (BloodPressure objects with systolic_value / diastolic_value)
  - heart_rates      (HeartRate objects)

Everything else (smoking_status, alcohol_use, physical_activity_level,
glucose, total_cholesterol, bmi, height, weight, on_bp_medication) are
direct Enum / Float / Boolean columns — no lazy load risk.

The feature engineers now receive the live ORM object with relationships
already loaded, so no lazy load can fire.
"""

from __future__ import annotations

import traceback
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from uuid import UUID

import joblib
import numpy as np
import pandas as pd
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import RiskAssessmentResult, UserProfile, HealthAssessment
from .feature_engineering.cvd import (
    engineer_cvd_features,
    EXPECTED_FEATURES as CVD_FEATURE_ORDER,
)
from .feature_engineering.hypertension import engineer_hyp_features
from .feature_engineering.chd import engineer_chd_features, CHD_FEATURE_ORDER
from .feature_engineering.stroke import (
    engineer_stroke_features,
    EXPECTED_FEATURES as STROKE_FEATURE_ORDER,
)
from .schemas import DiseasePredictionResult

logger = logging.getLogger(__name__)


# ─── Model Registry ───────────────────────────────────────────────────────────

MODEL_DIR = Path(__file__).resolve().parent.parent / "models"

_MODEL_PATHS: dict[str, tuple[str, str]] = {
    "cvd": ("xgbcvdv3.joblib", "xgbcvd_v3"),
    "hyp": (
        "xgbhypertensionv1.joblib",
        "xgbhyp_v1",
    ),  # UPDATED: Pointing to new comprehensive pipeline artifact
    "chd": ("xgbchdv2.joblib", "xgbchd_v2"),
    "stroke": (
        "xgbstrokev5.joblib",
        "xgbstroke_v5",
    ),  # UPDATED: Utilizing new XGBoost v4 model
}

# Scalers mapped contextually per disease model file configuration
_SCALER_PATHS: dict[str, str | None] = {
    "cvd": "scaler.joblib",
    "hyp": None,  # Preprocessing is managed internally within the joblib pipeline object
    "chd": "chdscalerv2.joblib",
    "stroke": "strokescalerv1.joblib",  # UPDATED: Utilizing new stroke normalization array scaler
}

_FEATURE_ENGINEERS = {
    "cvd": engineer_cvd_features,
    "hyp": engineer_hyp_features,
    "chd": engineer_chd_features,
    "stroke": engineer_stroke_features,
}

_loaded_models: dict[str, Any] = {}
_loaded_scalers: dict[str, Any] = {}


def _load_model(disease: str) -> Any:
    if disease not in _loaded_models:
        filename, _ = _MODEL_PATHS[disease]
        path = MODEL_DIR / filename
        logger.info("Loading model for %s from %s", disease, path)
        if not path.exists():
            raise FileNotFoundError(
                f"Model file not found: {path}. "
                f"Files present: {list(MODEL_DIR.iterdir()) if MODEL_DIR.exists() else 'directory missing'}"
            )
        _loaded_models[disease] = joblib.load(path)
    return _loaded_models[disease]


def _load_scaler(disease: str) -> Any | None:
    scaler_filename = _SCALER_PATHS.get(disease)
    if not scaler_filename:
        return None

    if disease not in _loaded_scalers:
        path = MODEL_DIR / scaler_filename
        logger.info(
            "Loading scaler execution configuration for %s from %s", disease, path
        )
        if not path.exists():
            raise FileNotFoundError(
                f"Production scaler file missing for disease path '{disease}': {path}."
            )
        _loaded_scalers[disease] = joblib.load(path)
    return _loaded_scalers[disease]


# ─── Risk Label Helpers ───────────────────────────────────────────────────────

_RISK_THRESHOLDS: dict[str, tuple[float, float]] = {
    "stroke": (0.03, 0.07),
    "chd": (
        0.10,
        0.20,
    ),  # Low < 10%, Intermediate 10-20%, High >= 20% (AHA/Framingham Standard)
    "hyp": (0.30, 0.60),
    "cvd": (
        0.10,
        0.20,
    ),  # Low < 10%, Intermediate 10-20%, High >= 20% (ASCVD Guidelines)
}


def _risk_label(score: float, disease: str) -> str:
    low_ceil, high_floor = _RISK_THRESHOLDS.get(disease, (0.30, 0.60))
    if score <= low_ceil:
        return "Low"
    if score <= high_floor:
        return "Moderate"
    return "High"


# ─── Async DB fetchers ────────────────────────────────────────────────────────


async def _fetch_profile(user_id: UUID, session: AsyncSession) -> UserProfile | None:
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def _fetch_assessment(
    user_id: UUID, session: AsyncSession
) -> HealthAssessment | None:
    result = await session.execute(
        select(HealthAssessment)
        .where(HealthAssessment.user_id == user_id)
        .order_by(HealthAssessment.created_at.desc())
        .limit(1)
        .options(
            selectinload(HealthAssessment.blood_pressures),
            selectinload(HealthAssessment.heart_rates),
        )
    )
    return result.scalar_one_or_none()


# ─── Core Service ─────────────────────────────────────────────────────────────


async def run_predictions(
    user_id: UUID,
    diseases: list[str] | None,
    session: AsyncSession,
) -> tuple[list[DiseasePredictionResult], list[dict]]:
    """
    Returns (results, errors).
    Raises ValueError if profile or assessment are missing.
    """
    target_diseases = diseases or list(_MODEL_PATHS.keys())

    profile = await _fetch_profile(user_id, session)
    if profile is None:
        raise ValueError(
            f"No UserProfile found for user {user_id}. Complete your profile first."
        )

    assessment = await _fetch_assessment(user_id, session)
    if assessment is None:
        raise ValueError(
            f"No HealthAssessment found for user {user_id}. Submit a health assessment first."
        )

    results: list[DiseasePredictionResult] = []
    errors: list[dict] = []
    predicted_at = datetime.now(timezone.utc)

    for disease in target_diseases:
        if disease not in _MODEL_PATHS:
            errors.append(
                {
                    "disease": disease,
                    "stage": "validation",
                    "error": "Unknown disease key",
                }
            )
            continue

        # Stage 1: Feature engineering — all data already in memory, no DB I/O
        try:
            engineer_fn = _FEATURE_ENGINEERS[disease]
            features: dict[str, Any] = engineer_fn(profile, assessment)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error(
                "Feature engineering failed for '%s': %s\n%s", disease, exc, tb
            )
            errors.append(
                {
                    "disease": disease,
                    "stage": "feature_engineering",
                    "error": str(exc),
                    "traceback": tb,
                }
            )
            continue

        # Stage 2: Model and Scaler loading
        try:
            model = _load_model(disease)
            scaler = _load_scaler(disease)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error(
                "Artifact payload context load failed for '%s': %s\n%s",
                disease,
                exc,
                tb,
            )
            errors.append(
                {
                    "disease": disease,
                    "stage": "model_load",
                    "error": str(exc),
                    "traceback": tb,
                }
            )
            continue

        # Stage 3: Inference Setup with Scaler Isolation
        try:
            if scaler is not None and disease in ("cvd", "stroke", "chd"):
                # Clean lookup mapping for feature signatures across supported legacy models
                FEATURE_ORDERS = {
                    "cvd": CVD_FEATURE_ORDER,
                    "stroke": STROKE_FEATURE_ORDER,
                    "chd": CHD_FEATURE_ORDER,
                }

                feature_order = FEATURE_ORDERS[disease]

                # Convert features dict to a single row DataFrame matching training sequence columns
                df_raw = pd.DataFrame([features], columns=feature_order)

                # Transform through production StandardScaler bounds
                scaled_array = scaler.transform(df_raw)

                # Turn back into DataFrame to preserve name signatures for XGBoost verification
                feature_input = pd.DataFrame(scaled_array, columns=feature_order)

            elif disease == "hyp":
                # UPDATED: Convert the payload dictionary to a structural dataframe row.
                # Scikit-learn pipelines require the feature names to process the ColumnTransformer targets.
                feature_input = pd.DataFrame([features])

            else:
                # Fallback path for alternative standard models requiring raw float arrays
                feature_input = np.array([list(features.values())], dtype=float)

            raw_prob = model.predict_proba(feature_input)[0][1]
            risk_score = float(np.clip(raw_prob, 0.0, 1.0))
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error(
                "Inference failed for '%s': %s\nFeatures: %s\n%s",
                disease,
                exc,
                features,
                tb,
            )
            errors.append(
                {
                    "disease": disease,
                    "stage": "inference",
                    "error": str(exc),
                    "features_used": features,
                    "traceback": tb,
                }
            )
            continue

        # Stage 4: Build result + persist
        try:
            _, model_version = _MODEL_PATHS[disease]
            label = _risk_label(risk_score, disease)

            results.append(
                DiseasePredictionResult(
                    disease=disease,
                    risk_score=round(risk_score, 4),
                    risk_label=label,
                    model_version=model_version,
                    features_used=features,
                )
            )

            session.add(
                RiskAssessmentResult(
                    user_id=user_id,
                    disease=disease,
                    risk_score=risk_score,
                    risk_label=label,
                    model_version=model_version,
                    predicted_at=predicted_at,
                )
            )

        except Exception as exc:
            tb = traceback.format_exc()
            logger.error("Persistence failed for '%s': %s\n%s", disease, exc, tb)
            errors.append(
                {
                    "disease": disease,
                    "stage": "persistence",
                    "error": str(exc),
                    "traceback": tb,
                }
            )
            continue

    if results:
        await session.commit()

    return results, errors


async def get_latest_results(
    user_id: UUID,
    session: AsyncSession,
) -> list[RiskAssessmentResult]:
    rows = await session.execute(
        select(RiskAssessmentResult)
        .where(RiskAssessmentResult.user_id == user_id)
        .order_by(RiskAssessmentResult.predicted_at.desc())
    )
    return list(rows.scalars().all())


async def diagnose(
    user_id: UUID,
    session: AsyncSession,
) -> dict:
    """Full diagnostic — checks models, data, and feature engineering without inference."""
    report: dict[str, Any] = {
        "model_dir": str(MODEL_DIR),
        "model_dir_exists": MODEL_DIR.exists(),
        "model_files": {},
        "scaler_files": {},
        "profile": None,
        "latest_assessment": None,
        "blood_pressures": [],
        "feature_samples": {},
        "errors": [],
    }

    for disease, (filename, _) in _MODEL_PATHS.items():
        path = MODEL_DIR / filename
        report["model_files"][disease] = {
            "path": str(path),
            "exists": path.exists(),
            "size_kb": round(path.stat().st_size / 1024, 1) if path.exists() else None,
        }

        scaler_file = _SCALER_PATHS.get(disease)
        if scaler_file:
            s_path = MODEL_DIR / scaler_file
            report["scaler_files"][disease] = {
                "path": str(s_path),
                "exists": s_path.exists(),
                "size_kb": round(s_path.stat().st_size / 1024, 1)
                if s_path.exists()
                else None,
            }

    profile = None
    assessment = None

    try:
        profile = await _fetch_profile(user_id, session)
        if profile:
            report["profile"] = {
                col.key: str(getattr(profile, col.key))
                for col in profile.__table__.columns
            }
        else:
            report["errors"].append("No UserProfile row found for this user.")
    except Exception as exc:
        report["errors"].append(f"Profile query error: {exc}")

    try:
        assessment = await _fetch_assessment(user_id, session)
        if assessment:
            report["latest_assessment"] = {
                col.key: str(getattr(assessment, col.key))
                for col in assessment.__table__.columns
            }
            report["blood_pressures"] = [
                {
                    "systolic_value": bp.systolic_value,
                    "diastolic_value": bp.diastolic_value,
                    "start_date_time": str(getattr(bp, "start_date_time", None)),
                }
                for bp in (assessment.blood_pressures or [])
            ]
        else:
            report["errors"].append("No HealthAssessment row found for this user.")
    except Exception as exc:
        report["errors"].append(
            f"Assessment query error: {exc}\n{traceback.format_exc()}"
        )

    if profile and assessment:
        for disease, engineer_fn in _FEATURE_ENGINEERS.items():
            try:
                features = engineer_fn(profile, assessment)
                report["feature_samples"][disease] = {
                    "ok": True,
                    "features": features,
                    "n_features": len(features),
                }
            except Exception as exc:
                report["feature_samples"][disease] = {
                    "ok": False,
                    "error": str(exc),
                    "traceback": traceback.format_exc(),
                }

    return report
