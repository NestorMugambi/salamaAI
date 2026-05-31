"""
clinician_dashboard/routes.py

All clinician dashboard endpoints.

Endpoints
─────────────────────────────────────────────────────────────────────────────
POST   /clinicians/profile                        create profile
GET    /clinicians/me                             get my profile
PATCH  /clinicians/me                             update my profile

GET    /clinicians/me/patients                    list linked patients (+ risk filter)
GET    /clinicians/me/patients/search             search patients by name / email
GET    /clinicians/me/patients/{patient_id}       patient full detail

GET    /clinicians/me/appointments                list appointments
POST   /clinicians/me/appointments                schedule appointment
PATCH  /clinicians/me/appointments/{id}           update / add notes / change status

POST   /clinicians/me/prescriptions               assign prescription
GET    /clinicians/me/prescriptions               list prescriptions (all or per patient)
"""

from __future__ import annotations

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_async_session
from app.database import User
from app.users import current_active_user
from .service import create_clinician_profile, get_appointments, get_my_patients, get_patient_detail, get_prescriptions, update_clinician_profile
from .service import get_my_profile as get_profile_from_db
from .service import update_appointment as update_appointment_db
from . service import create_appointment as create_appointment_db
from .schemas import (
    AppointmentCreate,
    AppointmentListResponse,
    AppointmentRead,
    AppointmentUpdate,
    ClinicianProfileCreate,
    ClinicianProfileRead,
    ClinicianProfileUpdate,
    HighRiskPatientResponse,
    PatientDetailResponse,
    PatientSearchResponse,
    PrescriptionCreate,
    PrescriptionListResponse,
    PrescriptionRead,
)

router = APIRouter(prefix="/clinicians", tags=["Clinician Dashboard"])


# ── Profile ───────────────────────────────────────────────────────────────────

@router.post(
    "/profile",
    response_model=ClinicianProfileRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create clinician profile",
)
async def create_profile(
    data: ClinicianProfileCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> ClinicianProfileRead:
    try:
        return await create_clinician_profile(user.id, data, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get(
    "/me",
    response_model=ClinicianProfileRead,
    summary="Get my clinician profile",
)
async def get_my_profile(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> ClinicianProfileRead:
    try:
        return await get_profile_from_db(user.id, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch(
    "/me",
    response_model=ClinicianProfileRead,
    summary="Update my clinician profile",
)
async def update_profile(
    data: ClinicianProfileUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> ClinicianProfileRead:
    try:
        return await update_clinician_profile(user.id, data, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


# ── Patients ──────────────────────────────────────────────────────────────────

@router.get(
    "/me/patients",
    response_model=HighRiskPatientResponse,
    summary="List linked patients — optionally filter by risk level",
    description=(
        "Returns all patients linked to this clinician, sorted by overall risk "
        "score descending. Use `?risk=high` to filter to high-risk patients only. "
        "Valid values: `high`, `moderate`, `low`."
    ),
)
async def list_patients(
    risk: Optional[str] = Query(
        default=None,
        description="Filter by risk level: high | moderate | low",
    ),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> HighRiskPatientResponse:
    if risk and risk.lower() not in {"high", "moderate", "low"}:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="risk must be one of: high, moderate, low",
        )
    try:
        return await get_my_patients(user.id, session, risk, page, page_size)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/me/patients/search",
    response_model=PatientSearchResponse,
    summary="Search linked patients by name or email",
)
async def search_patients(
    q: str = Query(..., min_length=1, description="Search term — name or email"),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> PatientSearchResponse:
    try:
        return await search_patients(user.id, q, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.get(
    "/me/patients/{patient_id}",
    response_model=PatientDetailResponse,
    summary="Get full profile, latest assessment, and risk data for a patient",
)
async def get_patient(
    patient_id: UUID,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> PatientDetailResponse:
    try:
        return await get_patient_detail(user.id, patient_id, session)
    except PermissionError as exc:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail=str(exc))
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


# ── Appointments ──────────────────────────────────────────────────────────────

@router.post(
    "/me/appointments",
    response_model=AppointmentRead,
    status_code=status.HTTP_201_CREATED,
    summary="Schedule an appointment (virtual or in-person)",
    description=(
        "Set `is_virtual=true` and provide a `meeting_link` for virtual appointments. "
        "Leave `is_virtual=false` for in-person. "
        "`status` defaults to `pending`."
    ),
)
async def create_appointment(
    data: AppointmentCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> AppointmentRead:
    try:
        return await create_appointment_db(user.id, data, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get(
    "/me/appointments",
    response_model=AppointmentListResponse,
    summary="List appointments",
    description=(
        "Returns appointments for this clinician. "
        "Filter by `status` (pending | accepted | completed | cancelled |missed ) "
        "or set `upcoming=true` to show only future appointments."
    ),
)
async def list_appointments(
    status_filter: Optional[str] = Query(
        default=None,
        alias="status",
        description="pending | accepted | completed | cancelled |missed",
    ),
    upcoming: bool = Query(default=False, description="Show only future appointments"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> AppointmentListResponse:
    try:
        return await get_appointments(
            user.id, session, status_filter, upcoming, page, page_size
        )
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.patch(
    "/me/appointments/{appointment_id}",
    response_model=AppointmentRead,
    summary="Update appointment — reschedule, add notes, or change status",
)
async def update_appointment(
    appointment_id: UUID,
    data: AppointmentUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> AppointmentRead:
    try:
        return await update_appointment_db(user.id, appointment_id, data, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))


# ── Prescriptions ─────────────────────────────────────────────────────────────

@router.post(
    "/me/prescriptions",
    response_model=PrescriptionRead,
    status_code=status.HTTP_201_CREATED,
    summary="Assign a prescription to a patient",
)
async def assign_prescription(
    data: PrescriptionCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> PrescriptionRead:
    try:
        return await assign_prescription(user.id, data, session)
    except ValueError as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.get(
    "/me/prescriptions",
    response_model=PrescriptionListResponse,
    summary="List prescriptions — all or filtered by patient",
)
async def list_prescriptions(
    patient_id: Optional[UUID] = Query(
        default=None,
        description="Filter to a specific patient UUID",
    ),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
) -> PrescriptionListResponse:
    try:
        return await get_prescriptions(user.id, session, patient_id)
    except ValueError as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail=str(exc))