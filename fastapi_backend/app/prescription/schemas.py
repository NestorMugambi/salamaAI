from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field
from app.enums import PrescriptionStatus  # Ensure this is imported from your enums file


# Base Schema (Shared fields)
class PrescriptionBase(BaseModel):
    medication_name: str = Field(..., max_length=255)
    dosage: str = Field(..., max_length=100)
    frequency: str = Field(..., max_length=100)
    duration: Optional[str] = Field(None, max_length=100)
    instructions: Optional[str] = None
    refills: int = Field(default=0, ge=0)


# Create Schema (For POST requests if patients can self-report, or for general input)
class PrescriptionCreate(PrescriptionBase):
    patient_id: UUID
    clinician_profile_id: UUID
    status: PrescriptionStatus = PrescriptionStatus.ACTIVE
    expires_at: Optional[datetime] = None


# Read Schema (For GET responses - Patient facing)
class PrescriptionRead(PrescriptionBase):
    id: UUID
    patient_id: UUID
    clinician_profile_id: UUID
    status: PrescriptionStatus
    issued_at: datetime
    expires_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Enable Pydantic to read directly from SQLAlchemy models
    model_config = ConfigDict(from_attributes=True)