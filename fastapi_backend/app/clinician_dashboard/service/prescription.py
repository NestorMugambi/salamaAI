"""
clinician_dashboard/service/prescription.py
Prescription assignments engine, medication tracking list builders.
"""

from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Prescription, User, UserProfile
from app.clinician_dashboard.schemas import PrescriptionCreate, PrescriptionRead, PrescriptionListResponse
from .base_db import _require_clinician, _patient_users, _patient_profiles
from .utils import _patient_full_name


async def assign_prescription(
    clinician_user_id: UUID,
    data: PrescriptionCreate,
    session: AsyncSession,
) -> PrescriptionRead:
    cp = await _require_clinician(clinician_user_id, session)

    rx = Prescription(
        patient_id=data.patient_id,
        clinician_profile_id=cp.id,
        medication_name=data.medication_name,
        dosage=data.dosage,
        frequency=data.frequency,
        duration=data.duration,
        instructions=data.instructions,
        refills=data.refills,
        issued_at=datetime.now(timezone.utc),
    )
    session.add(rx)
    await session.commit()
    await session.refresh(rx)

    user_row = await session.execute(select(User).where(User.id == data.patient_id))
    user = user_row.scalar_one_or_none()
    profile_row = await session.execute(
        select(UserProfile).where(UserProfile.user_id == data.patient_id)
    )
    profile = profile_row.scalar_one_or_none()

    return PrescriptionRead(
        id=rx.id,
        patient_id=rx.patient_id,
        clinician_profile_id=rx.clinician_profile_id,
        medication_name=rx.medication_name,
        dosage=rx.dosage,
        frequency=rx.frequency,
        duration=rx.duration,
        instructions=rx.instructions,
        refills=rx.refills,
        issued_at=rx.issued_at,
        patient_name=_patient_full_name(profile, user) if user else None,
    )


async def get_prescriptions(
    clinician_user_id: UUID,
    session: AsyncSession,
    patient_id: UUID | None = None,
) -> PrescriptionListResponse:
    cp = await _require_clinician(clinician_user_id, session)

    q = select(Prescription).where(Prescription.clinician_profile_id == cp.id)
    if patient_id:
        q = q.where(Prescription.patient_id == patient_id)
    q = q.order_by(Prescription.issued_at.desc())

    rows = await session.execute(q)
    prescriptions = rows.scalars().all()

    patient_ids = list({rx.patient_id for rx in prescriptions})
    users    = await _patient_users(patient_ids, session)
    profiles = await _patient_profiles(patient_ids, session)

    reads = [
        PrescriptionRead(
            id=rx.id,
            patient_id=rx.patient_id,
            clinician_profile_id=rx.clinician_profile_id,
            medication_name=rx.medication_name,
            dosage=rx.dosage,
            frequency=rx.frequency,
            duration=rx.duration,
            instructions=rx.instructions,
            refills=rx.refills,
            issued_at=rx.issued_at,
            patient_name=_patient_full_name(
                profiles.get(rx.patient_id),
                users.get(rx.patient_id),
            ) if rx.patient_id in users else None,
        )
        for rx in prescriptions
    ]

    return PrescriptionListResponse(total=len(reads), prescriptions=reads)