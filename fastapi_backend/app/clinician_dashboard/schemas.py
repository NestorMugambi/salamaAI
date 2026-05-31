"""
clinician_dashboard/schemas.py

Pydantic schemas for the clinician dashboard.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID
from app.enums import AppointmentStatus

from pydantic import BaseModel, Field, field_validator


# ══════════════════════════════════════════════════════════════════════════════
# Clinician Profile
# ══════════════════════════════════════════════════════════════════════════════


class ClinicianProfileCreate(BaseModel):
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    specialization: str
    license_number: str
    hospital_name: Optional[str] = None
    years_of_experience: Optional[int] = None
    bio: Optional[str] = None


class ClinicianProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    middle_name: Optional[str] = None
    last_name: Optional[str] = None
    specialization: Optional[str] = None
    hospital_name: Optional[str] = None
    years_of_experience: Optional[int] = None
    bio: Optional[str] = None


class ClinicianProfileRead(BaseModel):
    id: UUID
    user_id: UUID
    slug: str
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    full_name: str
    specialization: str
    license_number: str
    hospital_name: Optional[str] = None
    years_of_experience: Optional[int] = None
    bio: Optional[str] = None
    is_verified: bool
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ══════════════════════════════════════════════════════════════════════════════
# Patient summaries (for list / search views)
# ══════════════════════════════════════════════════════════════════════════════


class RiskCardSummary(BaseModel):
    disease: str
    display_name: str
    risk_score: float
    risk_label: str  # Low | Moderate | High
    risk_percent: float
    color_hint: str
    last_assessed: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PatientSummary(BaseModel):
    """Compact row for patient lists and search results."""

    user_id: UUID
    full_name: str
    age: Optional[int] = None
    sex: Optional[str] = None
    email: Optional[str] = None
    overall_risk_percent: float = 0.0
    overall_risk_label: str = "No data"
    risk_cards: list[RiskCardSummary] = []
    last_assessed: Optional[datetime] = None
    linked_since: Optional[datetime] = None  # ClinicianPatient.created_at

    model_config = {"from_attributes": True}


class HighRiskPatientResponse(BaseModel):
    """Response for GET /clinicians/me/patients?risk=high"""

    total: int
    patients: list[PatientSummary]


class PatientSearchResponse(BaseModel):
    query: str
    total: int
    results: list[PatientSummary]


# ══════════════════════════════════════════════════════════════════════════════
# Patient detail (profile + latest assessment)
# ══════════════════════════════════════════════════════════════════════════════


class BloodPressureRead(BaseModel):
    systolic_value: float
    diastolic_value: float
    start_date_time: datetime

    model_config = {"from_attributes": True}


class HealthAssessmentSummary(BaseModel):
    id: UUID
    created_at: datetime
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    glucose: Optional[float] = None
    avg_glucose_level: Optional[float] = None
    total_cholesterol: Optional[float] = None
    hdl_cholesterol: Optional[float] = None
    on_bp_medication: bool = False
    smoking_status: Optional[str] = None
    alcohol_use: Optional[str] = None
    physical_activity_level: Optional[str] = None
    assessment_notes: Optional[str] = None
    blood_pressures: list[BloodPressureRead] = []

    model_config = {"from_attributes": True}


class UserProfileRead(BaseModel):
    id: UUID
    user_id: UUID
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    sex: Optional[str] = None
    education: Optional[str] = None
    work_type: Optional[str] = None

    model_config = {"from_attributes": True}


class PatientDetailResponse(BaseModel):
    user_id: UUID
    email: Optional[str] = None
    profile: Optional[UserProfileRead] = None
    latest_assessment: Optional[HealthAssessmentSummary] = None
    assessment_count: int = 0
    risk_cards: list[RiskCardSummary] = []
    overall_risk_percent: float = 0.0
    overall_risk_label: str = "No data"


# ══════════════════════════════════════════════════════════════════════════════
# Appointments
# ══════════════════════════════════════════════════════════════════════════════


class AppointmentCreate(BaseModel):
    patient_id: UUID
    appointment_date: datetime
    reason: Optional[str] = None
    is_virtual: bool = False
    meeting_link: Optional[str] = None

    @field_validator("meeting_link")
    @classmethod
    def link_required_for_virtual(cls, v: Optional[str], info) -> Optional[str]:
        if info.data.get("is_virtual") and not v:
            raise ValueError("meeting_link is required for virtual appointments.")
        return v


class AppointmentUpdate(BaseModel):
    appointment_date: Optional[datetime] = None
    reason: Optional[str] = None
    clinician_notes: Optional[str] = None
    status: Optional[str] = None
    is_virtual: Optional[bool] = None
    meeting_link: Optional[str] = None


class AppointmentRead(BaseModel):
    id: UUID
    patient_id: UUID
    clinician_profile_id: UUID
    appointment_date: datetime
    reason: Optional[str] = None
    clinician_notes: Optional[str] = None
    status: AppointmentStatus
    is_virtual: bool
    meeting_link: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # Denormalised for display
    patient_name: Optional[str] = None
    patient_email: Optional[str] = None

    model_config = {"from_attributes": True}


class AppointmentListResponse(BaseModel):
    total: int
    page: int
    page_size: int
    total_pages: int
    appointments: list[AppointmentRead]


# ══════════════════════════════════════════════════════════════════════════════
# Prescriptions
# ══════════════════════════════════════════════════════════════════════════════


class PrescriptionCreate(BaseModel):
    patient_id: UUID
    medication_name: str
    dosage: str
    frequency: str
    duration: Optional[str] = None
    instructions: Optional[str] = None
    refills: int = Field(default=0, ge=0)


class PrescriptionRead(BaseModel):
    id: UUID
    patient_id: UUID
    clinician_profile_id: UUID
    medication_name: str
    dosage: str
    frequency: str
    duration: Optional[str] = None
    instructions: Optional[str] = None
    refills: int
    issued_at: datetime
    patient_name: Optional[str] = None

    model_config = {"from_attributes": True}


class PrescriptionListResponse(BaseModel):
    total: int
    prescriptions: list[PrescriptionRead]
