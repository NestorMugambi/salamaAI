"""
clinician_dashboard/service/base_db.py
Low-level direct CRUD/Select shared execution utilities over basic schemas.
"""

from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ClinicianProfile, RiskAssessmentResult, UserProfile, User


async def _get_clinician_profile(
    clinician_user_id: UUID,
    session: AsyncSession,
) -> ClinicianProfile | None:
    result = await session.execute(
        select(ClinicianProfile).where(
            ClinicianProfile.user_id == clinician_user_id
        )
    )
    return result.scalar_one_or_none()


async def _require_clinician(
    clinician_user_id: UUID,
    session: AsyncSession,
) -> ClinicianProfile:
    profile = await _get_clinician_profile(clinician_user_id, session)
    if not profile:
        raise ValueError("Clinician profile not found. Create your profile first.")
    return profile


async def _patient_risk_results(
    patient_ids: list[UUID],
    session: AsyncSession,
) -> dict[UUID, list[RiskAssessmentResult]]:
    """Bulk-fetch risk results for a list of patient IDs."""
    if not patient_ids:
        return {}
    rows = await session.execute(
        select(RiskAssessmentResult).where(
            RiskAssessmentResult.user_id.in_(patient_ids)
        )
    )
    results: dict[UUID, list[RiskAssessmentResult]] = {}
    for r in rows.scalars().all():
        results.setdefault(r.user_id, []).append(r)
    return results


async def _patient_profiles(
    patient_ids: list[UUID],
    session: AsyncSession,
) -> dict[UUID, UserProfile]:
    if not patient_ids:
        return {}
    rows = await session.execute(
        select(UserProfile).where(UserProfile.user_id.in_(patient_ids))
    )
    return {p.user_id: p for p in rows.scalars().all()}


async def _patient_users(
    patient_ids: list[UUID],
    session: AsyncSession,
) -> dict[UUID, User]:
    if not patient_ids:
        return {}
    rows = await session.execute(
        select(User).where(User.id.in_(patient_ids))
    )
    return {u.id: u for u in rows.scalars().all()}