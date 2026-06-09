# predictions/queries.py
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload, joinedload
from app.models import RiskAssessmentExplainability, RiskAssessmentResult, UserProfile, HealthAssessment


async def fetch_user_profile(
    user_id: UUID, session: AsyncSession
) -> UserProfile | None:
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


async def fetch_latest_assessment(
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


async def get_latest_results(user_id: UUID, session: AsyncSession) -> list[RiskAssessmentResult]:
    """
    Fetches the history of risk assessments for a specific user,
    eagerly loading the linked explainability records in a single query execution.
    """
    stmt = (
        select(RiskAssessmentResult)
        .where(RiskAssessmentResult.user_id == user_id)
        .options(joinedload(RiskAssessmentResult.explainability)) # <-- Eager load the relationship
        .order_by(RiskAssessmentResult.predicted_at.desc())
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())

async def fetch_explainability_by_result(
    risk_assessment_id: UUID, session: AsyncSession
) -> RiskAssessmentExplainability | None:
    """
    Retrieves the SHAP explainability record tied to a specific prediction result ID.
    """
    stmt = select(RiskAssessmentExplainability).where(
        RiskAssessmentExplainability.risk_assessment_id == risk_assessment_id
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()