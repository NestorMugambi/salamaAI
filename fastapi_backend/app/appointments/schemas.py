"""
patient_appointments/schemas.py
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.enums import AppointmentStatus


# ══════════════════════════════════════════════════════════════════════════════
# Clinician discovery (so patient can browse who to book with)
# ══════════════════════════════════════════════════════════════════════════════

class ClinicianPublicRead(BaseModel):
    """Minimal clinician info shown to a patient when browsing / searching."""
    id: UUID                          # clinician_profile.id
    slug: str
    full_name: str
    specialization: str
    hospital_name: Optional[str] = None
    years_of_experience: Optional[int] = None
    bio: Optional[str] = None
    is_verified: bool

    model_config = {"from_attributes": True}


class ClinicianListResponse(BaseModel):
    total: int
    results: list[ClinicianPublicRead]


# ══════════════════════════════════════════════════════════════════════════════
# Appointment booking
# ══════════════════════════════════════════════════════════════════════════════

class AppointmentBookRequest(BaseModel):
    clinician_profile_id: UUID = Field(..., description="ID of the clinician to book with")
    appointment_date: datetime = Field(..., description="Requested date and time (timezone-aware)")
    reason: Optional[str] = Field(default=None, description="Reason for the visit")
    is_virtual: bool = Field(default=False, description="True for a video/online appointment")

    @field_validator("appointment_date")
    @classmethod
    def must_be_future(cls, v: datetime) -> datetime:
        now = datetime.now(v.tzinfo)
        if v <= now:
            raise ValueError("appointment_date must be in the future.")
        return v


class AppointmentCancelRequest(BaseModel):
    reason: Optional[str] = Field(default=None, description="Optional cancellation reason")


class AppointmentRead(BaseModel):
    id: UUID
    patient_id: UUID
    clinician_profile_id: UUID
    clinician_name: Optional[str] = None
    clinician_specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    appointment_date: datetime
    reason: Optional[str] = None
    clinician_notes: Optional[str] = None
    status: AppointmentStatus                       # pending | confirmed | completed | cancelled
    is_virtual: bool
    meeting_link: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AppointmentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    appointments: list[AppointmentRead]