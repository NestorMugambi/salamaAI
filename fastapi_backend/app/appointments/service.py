"""
patient_appointments/service.py
"""
from __future__ import annotations

import math
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import and_, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Appointment, ClinicianPatient, ClinicianProfile
from app.enums import AppointmentStatus
from app.appointments.schemas import (
    AppointmentBookRequest,
    AppointmentListResponse,
    AppointmentRead,
    ClinicianListResponse,
    ClinicianPublicRead,
)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _appt_to_read(
    appt: Appointment,
    clinician: ClinicianProfile | None = None,
) -> AppointmentRead:
    return AppointmentRead(
        id=appt.id,
        patient_id=appt.patient_id,
        clinician_profile_id=appt.clinician_profile_id,
        clinician_name=clinician.full_name if clinician else None,
        clinician_specialization=clinician.specialization if clinician else None,
        hospital_name=clinician.hospital_name if clinician else None,
        appointment_date=appt.appointment_date,
        reason=appt.reason,
        clinician_notes=appt.clinician_notes,
        status=appt.status.value if hasattr(appt.status, "value") else str(appt.status),
        is_virtual=appt.is_virtual,
        meeting_link=appt.meeting_link,
        created_at=appt.created_at,
        updated_at=appt.updated_at,
    )


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


async def _get_clinician(
    clinician_profile_id: UUID,
    session: AsyncSession,
) -> ClinicianProfile | None:
    result = await session.execute(
        select(ClinicianProfile).where(ClinicianProfile.id == clinician_profile_id)
    )
    return result.scalar_one_or_none()


async def _get_appointment_for_patient(
    appointment_id: UUID,
    patient_id: UUID,
    session: AsyncSession,
) -> Appointment:
    result = await session.execute(
        select(Appointment).where(
            and_(
                Appointment.id == appointment_id,
                Appointment.patient_id == patient_id,
            )
        )
    )
    appt = result.scalar_one_or_none()
    if not appt:
        raise ValueError("Appointment not found.")
    return appt


# ══════════════════════════════════════════════════════════════════════════════
# Missed appointment auto-marking
# ══════════════════════════════════════════════════════════════════════════════

async def mark_missed_appointments(session: AsyncSession) -> int:
    """
    Mark any PENDING or ACCEPTED appointments whose date has passed as MISSED.
    Call this on a schedule (e.g. every hour via APScheduler or a startup task).
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
# Clinician discovery
# ══════════════════════════════════════════════════════════════════════════════

async def list_clinicians(
    session: AsyncSession,
    search: str | None = None,
    specialization: str | None = None,
    verified_only: bool = True,
) -> ClinicianListResponse:
    q = select(ClinicianProfile).where(ClinicianProfile.is_active == True)

    if verified_only:
        q = q.where(ClinicianProfile.is_verified == True)

    if specialization:
        q = q.where(ClinicianProfile.specialization.ilike(f"%{specialization}%"))

    if search:
        term = f"%{search}%"
        q = q.where(
            or_(
                ClinicianProfile.first_name.ilike(term),
                ClinicianProfile.last_name.ilike(term),
                ClinicianProfile.hospital_name.ilike(term),
            )
        )

    q = q.order_by(ClinicianProfile.years_of_experience.desc().nullslast())
    rows = await session.execute(q)
    clinicians = rows.scalars().all()

    results = [
        ClinicianPublicRead(
            id=c.id,
            slug=c.slug,
            full_name=c.full_name,
            specialization=c.specialization,
            hospital_name=c.hospital_name,
            years_of_experience=c.years_of_experience,
            bio=c.bio,
            is_verified=c.is_verified,
        )
        for c in clinicians
    ]
    return ClinicianListResponse(total=len(results), results=results)


# ══════════════════════════════════════════════════════════════════════════════
# Booking
# ══════════════════════════════════════════════════════════════════════════════

async def book_appointment(
    patient_id: UUID,
    data: AppointmentBookRequest,
    session: AsyncSession,
) -> AppointmentRead:
    clinician = await _get_clinician(data.clinician_profile_id, session)
    if not clinician:
        raise ValueError("Clinician not found.")
    if not clinician.is_active:
        raise ValueError("This clinician is not currently accepting appointments.")
    if not clinician.is_verified:
        raise ValueError("This clinician has not been verified yet.")

    # Conflict check — same clinician, within 30 minutes
    conflict = await session.execute(
        select(Appointment).where(
            and_(
                Appointment.clinician_profile_id == data.clinician_profile_id,
                Appointment.status.not_in([AppointmentStatus.CANCELLED, AppointmentStatus.MISSED]),
                func.abs(
                    func.extract(
                        "epoch",
                        Appointment.appointment_date - data.appointment_date,
                    )
                ) < 1800,
            )
        )
    )
    if conflict.scalar_one_or_none():
        raise ValueError(
            "This time slot is not available. "
            "Please choose a time at least 30 minutes away from another appointment."
        )

    appt = Appointment(
        patient_id=patient_id,
        clinician_profile_id=data.clinician_profile_id,
        appointment_date=data.appointment_date,
        reason=data.reason,
        is_virtual=data.is_virtual,
        status=AppointmentStatus.PENDING,
    )
    session.add(appt)

    # Auto-link patient to clinician
    existing_link = await session.execute(
        select(ClinicianPatient).where(
            and_(
                ClinicianPatient.clinician_profile_id == data.clinician_profile_id,
                ClinicianPatient.patient_id == patient_id,
            )
        )
    )
    if not existing_link.scalar_one_or_none():
        session.add(ClinicianPatient(
            clinician_profile_id=data.clinician_profile_id,
            patient_id=patient_id,
        ))

    await session.commit()
    await session.refresh(appt)
    return _appt_to_read(appt, clinician)


# ══════════════════════════════════════════════════════════════════════════════
# Patient appointment management
# ══════════════════════════════════════════════════════════════════════════════

async def get_my_appointments(
    patient_id: UUID,
    session: AsyncSession,
    status_filter: str | None = None,
    upcoming_only: bool = False,
    page: int = 1,
    page_size: int = 20,
) -> AppointmentListResponse:
    # Auto-mark missed before returning
    await mark_missed_appointments(session)

    q = select(Appointment).where(Appointment.patient_id == patient_id)

    if status_filter:
        q = q.where(Appointment.status == _coerce_status(status_filter))

    if upcoming_only:
        q = q.where(Appointment.appointment_date >= datetime.now(timezone.utc))

    q = q.order_by(Appointment.appointment_date.desc())

    count_result = await session.execute(
        select(func.count()).select_from(q.subquery())
    )
    total: int = count_result.scalar_one()
    total_pages = math.ceil(total / page_size) if total else 1

    q = q.offset((page - 1) * page_size).limit(page_size)
    rows = await session.execute(q)
    appointments = rows.scalars().all()

    clinician_ids = list({a.clinician_profile_id for a in appointments})
    clinician_rows = await session.execute(
        select(ClinicianProfile).where(ClinicianProfile.id.in_(clinician_ids))
    )
    clinician_map: dict[UUID, ClinicianProfile] = {
        c.id: c for c in clinician_rows.scalars().all()
    }

    return AppointmentListResponse(
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        appointments=[
            _appt_to_read(a, clinician_map.get(a.clinician_profile_id))
            for a in appointments
        ],
    )


async def get_appointment_detail(
    patient_id: UUID,
    appointment_id: UUID,
    session: AsyncSession,
) -> AppointmentRead:
    appt = await _get_appointment_for_patient(appointment_id, patient_id, session)
    clinician = await _get_clinician(appt.clinician_profile_id, session)
    return _appt_to_read(appt, clinician)


async def cancel_appointment(
    patient_id: UUID,
    appointment_id: UUID,
    session: AsyncSession,
) -> AppointmentRead:
    appt = await _get_appointment_for_patient(appointment_id, patient_id, session)
    current = _coerce_status(appt.status)

    if current not in {AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED}:
        raise ValueError(
            f"Cannot cancel an appointment with status '{current.value}'. "
            "Only pending or accepted appointments can be cancelled."
        )

    appt.status = AppointmentStatus.CANCELLED
    await session.commit()
    await session.refresh(appt)

    clinician = await _get_clinician(appt.clinician_profile_id, session)
    return _appt_to_read(appt, clinician)


async def reschedule_appointment(
    patient_id: UUID,
    appointment_id: UUID,
    new_date: datetime,
    session: AsyncSession,
) -> AppointmentRead:
    appt = await _get_appointment_for_patient(appointment_id, patient_id, session)
    current = _coerce_status(appt.status)

    if current != AppointmentStatus.PENDING:
        raise ValueError(
            "Only pending appointments can be rescheduled by the patient. "
            "Please contact your clinician to reschedule an accepted appointment."
        )

    aware_new_date = new_date if new_date.tzinfo else new_date.replace(tzinfo=timezone.utc)
    if aware_new_date <= datetime.now(timezone.utc):
        raise ValueError("New appointment date must be in the future.")

    appt.appointment_date = aware_new_date
    await session.commit()
    await session.refresh(appt)

    clinician = await _get_clinician(appt.clinician_profile_id, session)
    return _appt_to_read(appt, clinician)