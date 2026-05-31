# predictions/service.py
from datetime import datetime, timezone
import logging
import traceback
from uuid import UUID
import numpy as np
import pandas as pd
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import RiskAssessmentResult
from .schemas import DiseasePredictionResult

# Import our new internal decoupled modules
from . import registry, metrics, queries
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

logger = logging.getLogger(__name__)

_FEATURE_ENGINEERS = {
    "cvd": engineer_cvd_features,
    "hyp": engineer_hyp_features,
    "chd": engineer_chd_features,
    "stroke": engineer_stroke_features,
}


async def run_predictions(
    user_id: UUID, diseases: list[str] | None, session: AsyncSession
) -> tuple[list[DiseasePredictionResult], list[dict]]:
    target_diseases = diseases or list(registry.MODEL_PATHS.keys())

    # 1. Fetching Input Domain Data Contexts
    profile = await queries.fetch_user_profile(user_id, session)
    assessment = await queries.fetch_latest_assessment(user_id, session)

    if not profile or not assessment:
        raise ValueError(
            "Incomplete background data profiles setup to evaluate predictions."
        )

    results, errors = [], []
    predicted_at = datetime.now(timezone.utc)

    for disease in target_diseases:
        if disease not in registry.MODEL_PATHS:
            errors.append(
                {
                    "disease": disease,
                    "stage": "validation",
                    "error": "Unknown disease key",
                }
            )
            continue

        # 2. Build Structural Engineering Inputs
        try:
            features = _FEATURE_ENGINEERS[disease](profile, assessment)
        except Exception as exc:
            errors.append(
                {"disease": disease, "stage": "feature_engineering", "error": str(exc)}
            )
            continue

        # 3. Running Pipeline Transformations & ML Inference
        try:
            model = registry.load_model(disease)
            scaler = registry.load_scaler(disease)

            # (Input transformation wrapper block isolated here)
            if scaler and disease in ("cvd", "stroke", "chd"):
                orders = {
                    "cvd": CVD_FEATURE_ORDER,
                    "stroke": STROKE_FEATURE_ORDER,
                    "chd": CHD_FEATURE_ORDER,
                }
                df_raw = pd.DataFrame([features], columns=orders[disease])
                feature_input = pd.DataFrame(
                    scaler.transform(df_raw), columns=orders[disease]
                )
            elif disease == "hyp":
                feature_input = pd.DataFrame([features])
            else:
                feature_input = np.array([list(features.values())], dtype=float)

            raw_prob = model.predict_proba(feature_input)[0][1]
            risk_score = float(np.clip(raw_prob, 0.0, 1.0))

        except Exception as exc:
            errors.append({"disease": disease, "stage": "inference", "error": str(exc)})
            continue

        # 4. Math Operations & ORM Record Construction
        try:
            risk_percentage = metrics.calculate_risk_percentage(risk_score)
            label = metrics.determine_risk_label(risk_score, disease)
            _, model_version = registry.MODEL_PATHS[disease]

            results.append(
                DiseasePredictionResult(
                    disease=disease,
                    risk_score=round(risk_score, 4),
                    risk_percentage=risk_percentage,
                    risk_label=label,
                    model_version=model_version,
                    features_used=features,
                )
            )

            session.add(
                RiskAssessmentResult(
                    user_id=user_id,
                    assessment_id=assessment.id,
                    disease=disease,
                    risk_score=risk_score,
                    risk_percentage=risk_percentage,
                    risk_label=label,
                    model_version=model_version,
                    predicted_at=predicted_at,
                )
            )
        except Exception as exc:
            errors.append(
                {"disease": disease, "stage": "persistence", "error": str(exc)}
            )

    if results:
        await session.commit()

    return results, errors
