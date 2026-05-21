from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

from app.enums import (
    AlcoholUse,
    DescriptiveStatistic,
    PhysicalActivity,
    SmokingStatus,
    TemporalRelationship,
    TemporalRelationshipToSleep,
    BodyPosture,
    MeasurementLocation,
    HeartRateUnit,
    BloodPressureUnit,
)


# =========================================================
# Blood Pressure Schemas
# =========================================================

class BloodPressureBase(BaseModel):

    start_date_time: datetime
    end_date_time: Optional[datetime] = None

    descriptive_statistic: Optional[
        DescriptiveStatistic
    ] = None

    temporal_relationship_to_physical_activity: Optional[
        TemporalRelationship
    ] = None

    temporal_relationship_to_sleep: Optional[
        TemporalRelationshipToSleep
    ] = None

    body_posture: Optional[
        BodyPosture
    ] = None

    measurement_location: Optional[
        MeasurementLocation
    ] = None

    systolic_value: float = Field(
        ...,
        ge=50,
        le=300,
    )

    diastolic_value: float = Field(
        ...,
        ge=30,
        le=200,
    )

    systolic_unit: BloodPressureUnit = Field(
        default=BloodPressureUnit.mmHg
    )

    diastolic_unit: BloodPressureUnit = Field(
        default=BloodPressureUnit.mmHg
    )


class BloodPressureCreate(BloodPressureBase):
    pass


class BloodPressureRead(BloodPressureBase):
    id: int
    user_id: UUID

    model_config = {
        "from_attributes": True
    }


# =========================================================
# Minimal BP Schema for HealthAssessment nesting
# =========================================================

class BloodPressureValueRead(BaseModel):
    systolic_value: float
    diastolic_value: float

    model_config = {
        "from_attributes": True
    }


# =========================================================
# Heart Rate Schemas
# =========================================================

class HeartRateBase(BaseModel):

    value: float = Field(
        ...,
        ge=20,
        le=300,
    )

    unit: HeartRateUnit = Field(
        default=HeartRateUnit.beats_per_min
    )

    start_date_time: datetime

    end_date_time: Optional[
        datetime
    ] = None

    descriptive_statistic: Optional[
        DescriptiveStatistic
    ] = None

    temporal_relationship_to_physical_activity: Optional[
        TemporalRelationship
    ] = None

    temporal_relationship_to_sleep: Optional[
        TemporalRelationshipToSleep
    ] = None

    body_posture: Optional[
        BodyPosture
    ] = None

    measurement_location: Optional[
        MeasurementLocation
    ] = None


class HeartRateCreate(HeartRateBase):
    pass


class HeartRateRead(HeartRateCreate):
    id: int
    user_id: UUID

    model_config = {
        "from_attributes": True
    }


# =========================================================
# Minimal Heart Rate Schema for HealthAssessment nesting
# =========================================================

class HeartRateValueRead(BaseModel):
    value: float

    model_config = {
        "from_attributes": True
    }


# =========================================================
# Health Assessment Schemas
# =========================================================
class HealthAssessmentBase(BaseModel):

    # -------------------------
    # Anthropometric Measurements
    # -------------------------
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None
    log_bmi: Optional[float] = None

    # -------------------------
    # Current Clinical Data
    # -------------------------
    glucose: Optional[float] = None
    avg_glucose_level: Optional[float] = None
    total_cholesterol: Optional[float] = None
    hdl_cholesterol: Optional[float] = None
    on_bp_medication: bool = False

    # -------------------------
    # Lifestyle Snapshot
    # -------------------------
    smoking_status: Optional[SmokingStatus] = None
    alcohol_use: Optional[AlcoholUse] = None
    physical_activity_level: Optional[PhysicalActivity] = None
    
    #blood_pressures: list[BloodPressureValueRead] = []
    #heart_rates: list[HeartRateValueRead] = []

    # -------------------------
    # Notes / Metadata
    # -------------------------
    assessment_notes: Optional[str] = None

    model_config = {
        "from_attributes": True
    }


class HealthAssessmentCreate(HealthAssessmentBase):
    pass


class HealthAssessmentRead(HealthAssessmentBase):
    id: UUID
    user_id: UUID

    # Only read schema keeps the related measurements
    blood_pressures: list[BloodPressureValueRead] = []
    heart_rates: list[HeartRateValueRead] = []

    model_config = {
        "from_attributes": True
    }