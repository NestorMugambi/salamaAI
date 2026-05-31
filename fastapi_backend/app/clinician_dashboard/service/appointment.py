"""
clinician_dashboard/service/appointment.py
Appointments booking orchestration, listing pipelines, and details synchronization modifiers.
"""

import math
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy import select, and_, func, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Appointment, User, UserProfile
from app.enums import AppointmentStatus
from app.clinician_dashboard.schemas import (
    AppointmentCreate,
    AppointmentRead,
    AppointmentListResponse,
    AppointmentUpdate,
)
from .base_db import _require_clinician, _patient_users, _patient_profiles
from .utils import _patient_full_name


# ── Helpers ───────────────────────────────────────────────────────────────────

def _coerce_status(value: str | AppointmentStatus) -> AppointmentStatus:
    """Safely coerce a string or enum to AppointmentStatus."""
    if isinstance(value, AppointmentStatus):
        return value
    try:
        return AppointmentStatus(value.lower())
    except ValueError:
        raise ValueError(
            f"Invalid status '{value}'. "
            f"Valid values: {[s.value for s in AppointmentStatus]}"
        )


def _appointment_to_read(
    appt: Appointment,
    patient_name: str | None = None,
    patient_email: str | None = None,
) -> AppointmentRead:
    return AppointmentRead(
        id=appt.id,
        patient_id=appt.patient_id,
        clinician_profile_id=appt.clinician_profile_id,
        appointment_date=appt.appointment_date,
        reason=appt.reason,
        clinician_notes=appt.clinician_notes,
        status=appt.status.value if hasattr(appt.status, "value") else str(appt.status),
        is_virtual=appt.is_virtual,
        meeting_link=appt.meeting_link,
        created_at=appt.created_at,
        updated_at=appt.updated_at,
        patient_name=patient_name,
        patient_email=patient_email,
    )


# ══════════════════════════════════════════════════════════════════════════════
# Missed appointment auto-marking
# ══════════════════════════════════════════════════════════════════════════════

async def mark_missed_appointments(session: AsyncSession) -> int:
    """
    Mark any PENDING or ACCEPTED appointments whose date has passed as MISSED.
    Called automatically on listing endpoints and by the hourly scheduler.
    Returns the number of rows updated.
    """
    now = datetime.now(timezone.utc)
    result = await session.execute(
        update(Appointment)
        .where(
            and_(
                Appointment.appointment_date < now,
                Appointment.status.in_([
                    AppointmentStatus.PENDING,
                    AppointmentStatus.ACCEPTED,
                ]),
            )
        )
        .values(status=AppointmentStatus.MISSED)
        .execution_options(synchronize_session="fetch")
    )
    await session.commit()
    return result.rowcount


# ══════════════════════════════════════════════════════════════════════════════
# Create
# ══════════════════════════════════════════════════════════════════════════════

async def create_appointment(
    clinician_user_id: UUID,
    data: AppointmentCreate,
    session: AsyncSession,
) -> AppointmentRead:
    cp = await _require_clinician(clinician_user_id, session)

    appt = Appointment(
        patient_id=data.patient_id,
        clinician_profile_id=cp.id,
        appointment_date=data.appointment_date,
        reason=data.reason,
        is_virtual=data.is_virtual,
        meeting_link=data.meeting_link,
        status=AppointmentStatus.PENDING,
    )
    session.add(appt)
    await session.commit()
    await session.refresh(appt)

    user_row = await session.execute(select(User).where(User.id == data.patient_id))
    user = user_row.scalar_one_or_none()
    profile_row = await session.execute(
        select(UserProfile).where(UserProfile.user_id == data.patient_id)
    )
    profile = profile_row.scalar_one_or_none()

    return _appointment_to_read(
        appt,
        patient_name=_patient_full_name(profile, user) if user else None,
        patient_email=str(user.email) if user else None,
    )


# ══════════════════════════════════════════════════════════════════════════════
# List
# ══════════════════════════════════════════════════════════════════════════════

async def get_appointments(
    clinician_user_id: UUID,
    session: AsyncSession,
    status_filter: str | None = None,
    upcoming_only: bool = False,
    page: int = 1,
    page_size: int = 20,
) -> AppointmentListResponse:
    # Auto-mark missed before returning
    await mark_missed_appointments(session)

    cp = await _require_clinician(clinician_user_id, session)

    q = select(Appointment).where(Appointment.clinician_profile_id == cp.id)

    if status_filter:
        q = q.where(Appointment.status == _coerce_status(status_filter))

    if upcoming_only:
        q = q.where(Appointment.appointment_date >= datetime.now(timezone.utc))

    q = q.order_by(Appointment.appointment_date.asc())

    count_result = await session.execute(
        select(func.count()).select_from(q.subquery())
    )
    total: int = count_result.scalar_one()
    total_pages = math.ceil(total / page_size) if total else 1

    q = q.offset((page - 1) * page_size).limit(page_size)
    appt_rows = await session.execute(q)
    appointments = appt_rows.scalars().all()

    patient_ids = list({a.patient_id for a in appointments})
    users    = await _patient_users(patient_ids, session)
    profiles = await _patient_profiles(patient_ids, session)

    reads = [
        _appointment_to_read(
            a,
            patient_name=_patient_full_name(
                profiles.get(a.patient_id), users.get(a.patient_id)
            ) if users.get(a.patient_id) else None,
            patient_email=str(users[a.patient_id].email) if a.patient_id in users else None,
        )
        for a in appointments
    ]

    return AppointmentListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        appointments=reads,
    )


# ══════════════════════════════════════════════════════════════════════════════
# Update
# ══════════════════════════════════════════════════════════════════════════════

async def update_appointment(
    clinician_user_id: UUID,
    appointment_id: UUID,
    data: AppointmentUpdate,
    session: AsyncSession,
) -> AppointmentRead:
    cp = await _require_clinician(clinician_user_id, session)

    appt_row = await session.execute(
        select(Appointment).where(
            and_(
                Appointment.id == appointment_id,
                Appointment.clinician_profile_id == cp.id,
            )
        )
    )
    appt: Appointment | None = appt_row.scalar_one_or_none()
    if not appt:
        raise ValueError("Appointment not found.")

    for field, value in data.model_dump(exclude_none=True).items():
        # Coerce status string to enum before setting
        if field == "status" and value is not None:
            value = _coerce_status(value)
        setattr(appt, field, value)

    await session.commit()
    await session.refresh(appt)

    user_row = await session.execute(select(User).where(User.id == appt.patient_id))
    user = user_row.scalar_one_or_none()
    profile_row = await session.execute(
        select(UserProfile).where(UserProfile.user_id == appt.patient_id)
    )
    profile = profile_row.scalar_one_or_none()

    return _appointment_to_read(
        appt,
        patient_name=_patient_full_name(profile, user) if user else None,
        patient_email=str(user.email) if user else None,
    )