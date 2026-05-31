"""
patient_appointments/routes.py

Endpoints
─────────────────────────────────────────────────────────────────────────────
GET    /appointments/clinicians           browse / search clinicians to book with
POST   /appointments/book                 book an appointment
GET    /appointments/me                   my appointments (with filters)
GET    /appointments/me/{id}              single appointment detail
PATCH  /appointments/me/{id}/reschedule   reschedule a pending appointment
DELETE /appointments/me/{id}              cancel an appointment
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import User, get_async_session
from app.users import current_active_user
from . import service as appt_service
from .schemas import (
    AppointmentBookRequest,
    AppointmentListResponse,
    AppointmentRead,
    ClinicianListResponse,
)

router = APIRouter(prefix="/appointments", tags=["Patient Appointments"])


# ── Clinician discovery ───────────────────────────────────────────────────────


@router.get(
    "/clinicians",
    response_model=ClinicianListResponse,
    summary="Browse clinicians available for booking",
    description=(
        "Returns verified, active clinicians. "
        "Filter by `specialization` or free-text `search` (name / hospital). "
        "Set `verified_only=false` to include unverified clinicians."
    ),
)
async def browse_clinicians(
    search: Optional[str] = Query(
        default=None, description="Search by name or hospital"
    ),
    specialization: Optional[str] = Query(default=None, description="e.g. Cardiology"),
    verified_only: bool = Query(default=True),
    session: AsyncSession = Depends(get_async_session),
) -> ClinicianListResponse:
    return await appt_service.list_clinicians(
        session, search, specialization, verified_only
    )


# ── Booking ───────────────────────────────────────────────────────────────────


@router.post(
    "/book",
    response_model=AppointmentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Book an appointment with a clinician",
    description=(
        "Creates a new appointment with `status=pending`. "
        "The clinician will confirm or reject it. "
        "Also automatically links the patient to the clinician's practice "
        "if not already linked."
    ),
)
async def book_appointment(
    data: AppointmentBookRequest,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> AppointmentRead:
    try:
        return await appt_service.book_appointment(user.id, data, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))


# ── Patient's own appointments ────────────────────────────────────────────────


@router.get(
    "/me",
    response_model=AppointmentListResponse,
    summary="List my appointments",
    description=(
        "Returns the authenticated patient's appointments, newest first. "
        "Filter by `status` (pending | accepted | completed | cancelled |missed) "
        "or set `upcoming=true` for future appointments only."
    ),
)
async def my_appointments(
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="pending | accepted | completed | cancelled |missed",
    ),
    upcoming: bool = Query(default=False, description="Show only future appointments"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> AppointmentListResponse:
    return await appt_service.get_my_appointments(
        user.id, session, status_filter, upcoming, page, page_size
    )


@router.get(
    "/me/{appointment_id}",
    response_model=AppointmentRead,
    summary="Get a single appointment detail",
)
async def appointment_detail(
    appointment_id: UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> AppointmentRead:
    try:
        return await appt_service.get_appointment_detail(
            user.id, appointment_id, session
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch(
    "/me/{appointment_id}/reschedule",
    response_model=AppointmentRead,
    summary="Reschedule a pending appointment",
    description="Only PENDING appointments can be rescheduled by the patient.",
)
async def reschedule_appointment(
    appointment_id: UUID,
    new_date: datetime = Query(
        ..., description="New appointment datetime (timezone-aware)"
    ),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> AppointmentRead:
    try:
        return await appt_service.reschedule_appointment(
            user.id, appointment_id, new_date, session
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.delete(
    "/me/{appointment_id}",
    response_model=AppointmentRead,
    summary="Cancel an appointment",
    description="Only PENDING or CONFIRMED appointments can be cancelled.",
)
async def cancel_appointment(
    appointment_id: UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> AppointmentRead:
    try:
        return await appt_service.cancel_appointment(user.id, appointment_id, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))
