from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from uuid import UUID


# Enums
class AdministrationRoute(str, Enum):
    oral = "oral"
    iv = "iv"
    subcutaneous = "subcutaneous"
    intramuscular = "intramuscular"
    transdermal = "transdermal"


class PartOfDay(str, Enum):
    morning = "morning"
    afternoon = "afternoon"
    evening = "evening"
    night = "night"


class DayOfWeek(str, Enum):
    monday = "monday"
    tuesday = "tuesday"
    wednesday = "wednesday"
    thursday = "thursday"
    friday = "friday"
    saturday = "saturday"
    sunday = "sunday"


class TimeUnit(str, Enum):
    min = "min"
    h = "h"
    d = "d"
    wk = "wk"
    Mo = "Mo"
    yr = "yr"


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
