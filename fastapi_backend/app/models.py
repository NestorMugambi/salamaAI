
from fastapi_users.db import SQLAlchemyBaseUserTableUUID
from sqlalchemy import Column, String, Integer, ForeignKey, Float, DateTime, Enum
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
    AdministrationRoute
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
    blood_pressures = relationship("BloodPressure", back_populates="user", cascade="all, delete-orphan")
    heart_rates = relationship("HeartRate", back_populates="user", cascade="all, delete-orphan")
    prescriptions = relationship("Prescription", back_populates="user", cascade="all, delete-orphan")


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
    temporal_relationship_to_physical_activity = Column(Enum(TemporalRelationship), nullable=True)
    temporal_relationship_to_sleep = Column(Enum(TemporalRelationshipToSleep), nullable=True)
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
    temporal_relationship_to_physical_activity = Column(Enum(TemporalRelationship), nullable=True)
    temporal_relationship_to_sleep = Column(Enum(TemporalRelationshipToSleep), nullable=True)
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

    schedule = relationship("DoseSchedule", back_populates="prescription", cascade="all, delete-orphan")
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