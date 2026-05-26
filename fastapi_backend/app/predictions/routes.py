"""
predictions/routes.py
"""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_session
from app.users import current_active_user
from app.database import User
from .schemas import (
    PredictionRequest,
    PredictionResponse,
    RiskAssessmentResultRead,
)
from .service import diagnose, get_latest_results, run_predictions

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
    records = await get_latest_results(user_id=user.id, session=session)
    return [RiskAssessmentResultRead.model_validate(r) for r in records]


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
    return await diagnose(user_id=user.id, session=session)
