"""
clinician_dashboard/service/profile.py
Clinician identity updates and profile reading transactions.
"""

from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import ClinicianProfile
from app.clinician_dashboard.schemas import (
    ClinicianProfileCreate,
    ClinicianProfileRead,
    ClinicianProfileUpdate,
)
from .base_db import _get_clinician_profile, _require_clinician
from .utils import _slug


async def create_clinician_profile(
    clinician_user_id: UUID,
    data: ClinicianProfileCreate,
    session: AsyncSession,
) -> ClinicianProfileRead:
    existing = await _get_clinician_profile(clinician_user_id, session)
    if existing:
        raise ValueError("Clinician profile already exists.")

    slug = _slug(data.first_name, data.last_name, data.license_number)

    profile = ClinicianProfile(
        user_id=clinician_user_id,
        slug=slug,
        **data.model_dump(),
    )
    session.add(profile)
    await session.commit()
    await session.refresh(profile)
    return ClinicianProfileRead.model_validate(profile)


async def get_my_profile(
    clinician_user_id: UUID,
    session: AsyncSession,
) -> ClinicianProfileRead:
    profile = await _require_clinician(clinician_user_id, session)
    return ClinicianProfileRead.model_validate(profile)


async def update_clinician_profile(
    clinician_user_id: UUID,
    data: ClinicianProfileUpdate,
    session: AsyncSession,
) -> ClinicianProfileRead:
    profile = await _require_clinician(clinician_user_id, session)
    for field, value in data.model_dump(exclude_none=True).items():
        setattr(profile, field, value)
    await session.commit()
    await session.refresh(profile)
    return ClinicianProfileRead.model_validate(profile)
