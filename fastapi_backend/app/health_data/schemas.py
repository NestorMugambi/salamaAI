import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from .enums import (
    DescriptiveStatistic,
    TemporalRelationship,
    TemporalRelationshipToSleep,
    BodyPosture,
    MeasurementLocation,
    HeartRateUnit,
    BloodPressureUnit,
)


# --------------------------
# Blood Pressure Schemas
# --------------------------
class BloodPressureBase(BaseModel):
    value: Optional[float] = None
    unit: Optional[str] = None

    start_date_time: datetime
    end_date_time: Optional[datetime] = None

    descriptive_statistic: Optional[DescriptiveStatistic] = None
    temporal_relationship_to_physical_activity: Optional[TemporalRelationship] = None
    temporal_relationship_to_sleep: Optional[TemporalRelationshipToSleep] = None
    body_posture: Optional[BodyPosture] = None
    measurement_location: Optional[MeasurementLocation] = None

    systolic_value: float = Field(..., ge=50, le=300)
    diastolic_value: float = Field(..., ge=30, le=200)
    systolic_unit: BloodPressureUnit = Field(default=BloodPressureUnit.mmHg)
    diastolic_unit: BloodPressureUnit = Field(default=BloodPressureUnit.mmHg)


class BloodPressureCreate(BloodPressureBase):
    pass


class BloodPressureRead(BloodPressureBase):
    id: int
    user_id: UUID

    model_config = {"from_attributes": True}


# --------------------------
# Heart Rate Schemas
# --------------------------
class HeartRateBase(BaseModel):
    value: float = Field(..., ge=20, le=300)
    unit: HeartRateUnit = Field(default=HeartRateUnit.beats_per_min)

    start_date_time: datetime
    end_date_time: Optional[datetime] = None

    descriptive_statistic: Optional[DescriptiveStatistic] = None
    temporal_relationship_to_physical_activity: Optional[TemporalRelationship] = None
    temporal_relationship_to_sleep: Optional[TemporalRelationshipToSleep] = None
    body_posture: Optional[BodyPosture] = None
    measurement_location: Optional[MeasurementLocation] = None


class HeartRateCreate(HeartRateBase):
    pass


class HeartRateRead(HeartRateCreate):
    id: int
    user_id: UUID

    model_config = {"from_attributes": True}
