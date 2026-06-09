"""
predictions/routes.py
API layer routing execution context targets. Decoupled from internal database 
queries and artifact caching steps.
"""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_session, User
from app.users import current_active_user

from .schemas import (
    PredictionRequest,
    PredictionResponse,
    RiskAssessmentResultRead,
    RiskAssessmentExplainabilityRead,  # <-- Added new schema import
)

# Clean explicit sub-module imports matching the new structure
from .service import run_predictions
from .queries import get_latest_results, fetch_explainability_by_result  # <-- Added fetch query
from .diagnostics import run_system_diagnostic

router = APIRouter(prefix="/predictions", tags=["Predictions"])


@router.post(
    "/run",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Run risk predictions for the current user",
)
async def run_risk_predictions(
    body: PredictionRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> PredictionResponse:
    try:
        results, errors = await run_predictions(
            user_id=user.id,
            diseases=body.diseases,
            session=session,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Prediction pipeline error: {exc}",
        ) from exc

    # If every disease failed, surface the errors rather than returning empty results
    if not results and errors:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "message": "All predictions failed. See 'errors' for details.",
                "errors": errors,
            },
        )

    return PredictionResponse(
        user_id=user.id,
        predicted_at=datetime.now(timezone.utc),
        results=results,
        errors=errors,  # partial failures included transparently
    )


@router.get(
    "/history",
    response_model=list[RiskAssessmentResultRead],
    summary="Retrieve past risk assessment results for the current user",
)
async def prediction_history(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[RiskAssessmentResultRead]:
    # Route now calls queries sub-module directly for data extraction
    records = await get_latest_results(user_id=user.id, session=session)
    return [RiskAssessmentResultRead.model_validate(r) for r in records]


@router.get(
    "/explain/{risk_assessment_id}",
    response_model=RiskAssessmentExplainabilityRead,
    status_code=status.HTTP_200_OK,
    summary="Retrieve SHAP values, top risk factors, and clinical explanations for a specific prediction",
)
async def get_prediction_explainability(
    risk_assessment_id: UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> RiskAssessmentExplainabilityRead:
    """
    Fetches the TreeSHAP feature contributions, custom clinic recommendations, 
    and profiling metadata linked directly to a historical inference instance.
    """
    explanation = await fetch_explainability_by_result(
        risk_assessment_id=risk_assessment_id, session=session
    )
    
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Explainability parameters not found for record ID: {risk_assessment_id}",
        )
        
    return RiskAssessmentExplainabilityRead.model_validate(explanation)


@router.get(
    "/diagnose",
    summary="Debug endpoint — checks models, profile, assessment, and feature engineering",
    response_model=dict,
)
async def diagnose_predictions(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """
    Returns a full diagnostic report without running the models:
    - Whether each model file exists on disk
    - Whether the user has a profile and health assessment
    - The exact feature values that would be sent to each model
    - Any errors from the feature engineering step

    Use this endpoint first when /run returns empty results.
    """
    # Route calls specialized diagnostic runner isolated from standard inference routes
    return await run_system_diagnostic(user_id=user.id, session=session)