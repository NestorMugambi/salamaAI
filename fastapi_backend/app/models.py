from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import (
    Boolean,
    Column,
    Date,
    String,
    Integer,
    ForeignKey,
    Float,
    DateTime,
    Enum,
    func,
)
from sqlalchemy.orm import DeclarativeBase, relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from uuid import uuid4, UUID
from typing import Optional, List
from datetime import datetime

from .enums import (
    DescriptiveStatistic,
    TemporalRelationship,
    TemporalRelationshipToSleep,
    BodyPosture,
    MeasurementLocation,
    HeartRateUnit,
    BloodPressureUnit,
    AdministrationRoute,
    Gender,
    SmokingStatus,
    AlcoholUse,
)


# --------------------------
# Base
# --------------------------
class Base(DeclarativeBase):
    pass


# --------------------------
# User
# --------------------------
class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"

    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")
    blood_pressures = relationship(
        "BloodPressure", back_populates="user", cascade="all, delete-orphan"
    )
    heart_rates = relationship(
        "HeartRate", back_populates="user", cascade="all, delete-orphan"
    )
    prescriptions = relationship(
        "Prescription", back_populates="user", cascade="all, delete-orphan"
    )
    profiles = relationship("UserProfile", back_populates="user")


# -------------------------
# User Profile
# -------------------------
class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    first_name = Column(String(50), nullable=False)
    middle_name = Column(String(50), nullable=True)
    last_name = Column(String(50), nullable=False)
    phone_number = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=False)
    sex = Column(Enum(Gender), nullable=False)

    weight = Column(Float, nullable=True)
    height = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)

    smoking = Column(Enum(SmokingStatus), nullable=False, default=False)
    diabetes = Column(Boolean, nullable=False, default=False)

    history_cvd = Column(
        Boolean, nullable=False, default=False
    )  # history of CardioVasclular disease
    kidney_disease = Column(Boolean, nullable=False, default=False)
    family_history_htn = Column(Boolean, nullable=True)  # family hypertension history

    on_bp_medication = Column(Boolean, nullable=False, default=False)

    total_cholesterol = Column(Float, nullable=True)
    hdl_cholesterol = Column(Float, nullable=True)  # High density liproprotein level
    glucose = Column(Float, nullable=True)

    physical_activity_level = Column(String, nullable=True)
    diet_quality = Column(String, nullable=True)
    alcohol_use = Column(Enum(AlcoholUse), nullable=True)
    stress_level = Column(String, nullable=True)
    sleep_quality = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    user = relationship("User", back_populates="profiles")


# --------------------------
# Item
# --------------------------
class Item(Base):
    __tablename__ = "items"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    quantity = Column(Integer, nullable=True)

    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    user = relationship("User", back_populates="items")


# --------------------------
# Blood Pressure
# --------------------------
class BloodPressure(Base):
    __tablename__ = "bloodpressure"

    id = Column(Integer, primary_key=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    value = Column(Float, nullable=True)
    unit = Column(String, nullable=True)

    start_date_time = Column(DateTime(timezone=True), nullable=False)  # Timezone-aware
    end_date_time = Column(DateTime(timezone=True), nullable=True)

    descriptive_statistic = Column(Enum(DescriptiveStatistic), nullable=True)
    temporal_relationship_to_physical_activity = Column(
        Enum(TemporalRelationship), nullable=True
    )
    temporal_relationship_to_sleep = Column(
        Enum(TemporalRelationshipToSleep), nullable=True
    )
    body_posture = Column(Enum(BodyPosture), nullable=True)
    measurement_location = Column(Enum(MeasurementLocation), nullable=True)

    systolic_value = Column(Float, nullable=False)
    diastolic_value = Column(Float, nullable=False)
    systolic_unit = Column(Enum(BloodPressureUnit), default=BloodPressureUnit.mmHg)
    diastolic_unit = Column(Enum(BloodPressureUnit), default=BloodPressureUnit.mmHg)

    user = relationship("User", back_populates="blood_pressures")


# --------------------------
# Heart Rate
# --------------------------
class HeartRate(Base):
    __tablename__ = "heartrate"

    id = Column(Integer, primary_key=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    value = Column(Float, nullable=True)
    unit = Column(Enum(HeartRateUnit), default=HeartRateUnit.beats_per_min)

    start_date_time = Column(DateTime(timezone=True), nullable=False)  # Timezone-aware
    end_date_time = Column(DateTime(timezone=True), nullable=True)

    descriptive_statistic = Column(Enum(DescriptiveStatistic), nullable=True)
    temporal_relationship_to_physical_activity = Column(
        Enum(TemporalRelationship), nullable=True
    )
    temporal_relationship_to_sleep = Column(
        Enum(TemporalRelationshipToSleep), nullable=True
    )
    body_posture = Column(Enum(BodyPosture), nullable=True)
    measurement_location = Column(Enum(MeasurementLocation), nullable=True)

    user = relationship("User", back_populates="heart_rates")


# --------------------------
# Prescription
# --------------------------
class Prescription(Base):
    __tablename__ = "prescription"

    id = Column(Integer, primary_key=True)
    user_id = Column(PG_UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    medication_name = Column(String, nullable=False)
    route = Column(Enum(AdministrationRoute), nullable=False)
    prescription_trigger = Column(String, nullable=True)

    schedule = relationship(
        "DoseSchedule", back_populates="prescription", cascade="all, delete-orphan"
    )
    user = relationship("User", back_populates="prescriptions")


# --------------------------
# Dose Schedule
# --------------------------
class DoseSchedule(Base):
    __tablename__ = "doseschedule"

    id = Column(Integer, primary_key=True)
    prescription_id = Column(Integer, ForeignKey("prescription.id"), nullable=False)

    dose_duration_value = Column(Float, nullable=True)
    dose_duration_unit = Column(String, nullable=True)

    dose_administration_duration_value = Column(Float, nullable=True)
    dose_administration_duration_unit = Column(String, nullable=True)

    dose_value = Column(Float, nullable=True)
    dose_unit = Column(String, nullable=True)
    dose_min_value = Column(Float, nullable=True)
    dose_max_value = Column(Float, nullable=True)

    frequency = Column(String, nullable=True)
    dose_prn_trigger = Column(String, nullable=True)

    prescription = relationship("Prescription", back_populates="schedule")
