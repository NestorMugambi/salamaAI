# predictions/queries.py
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models import RiskAssessmentResult, UserProfile, HealthAssessment

async def fetch_user_profile(user_id: UUID, session: AsyncSession) -> UserProfile | None:
    result = await session.execute(
        select(UserProfile).where(UserProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()

async def fetch_latest_assessment(user_id: UUID, session: AsyncSession) -> HealthAssessment | None:
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