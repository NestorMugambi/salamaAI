from app.enums import AdministrationRoute, TimeUnit

from pydantic import BaseModel, Field
from typing import Optional, List
from uuid import UUID


# Base Schema (Shared fields)
class DoseScheduleBase(BaseModel):
    dose_duration_value: Optional[float] = None
    dose_duration_unit: Optional[TimeUnit] = None
    dose_administration_duration_value: Optional[float] = None
    dose_administration_duration_unit: Optional[TimeUnit] = None
    dose_value: Optional[float] = None
    dose_unit: Optional[str] = None
    dose_min_value: Optional[float] = None
    dose_max_value: Optional[float] = None
    frequency: Optional[str] = None
    dose_prn_trigger: Optional[str] = None


class PrescriptionBase(BaseModel):
    medication_name: str
    route: AdministrationRoute
    prescription_trigger: Optional[str] = None


# Create Schema (For POST requests)
class DoseScheduleCreate(DoseScheduleBase):
    pass


class PrescriptionCreate(PrescriptionBase):
    schedule: List[DoseScheduleCreate] = Field(default_factory=list)


# Read Schema (For GET responses)
class DoseScheduleRead(DoseScheduleBase):
    id: int


class PrescriptionRead(PrescriptionBase):
    id: int
    user_id: UUID
    schedule: List[DoseScheduleRead]
