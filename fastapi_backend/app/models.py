from uuid import uuid4

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
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import DeclarativeBase, relationship

from .enums import (
    BpHistory,
    BpMedication,
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
    DiseaseType,
    RiskLevel,
    EducationLevel,
    PhysicalActivity,
)


class Base(DeclarativeBase):
    pass


# =========================================================
# User
# =========================================================
class User(SQLAlchemyBaseUserTableUUID, Base):
    __tablename__ = "user"

    # -------------------------
    # Relationships
    # -------------------------
    blood_pressures = relationship(
        "BloodPressure",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    heart_rates = relationship(
        "HeartRate",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    prescriptions = relationship(
        "Prescription",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    profiles = relationship(
        "UserProfile",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    health_assessments = relationship(
        "HealthAssessment",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    risk_assessment_results = relationship(
        "RiskAssessmentResult",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# =========================================================
# User Profile
# Stores relatively static information
# =========================================================
class UserProfile(Base):
    __tablename__ = "user_profile"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        unique=True,
    )

    # -------------------------
    # Personal Information
    # -------------------------
    first_name = Column(String(50), nullable=False)

    middle_name = Column(String(50), nullable=True)

    last_name = Column(String(50), nullable=False)

    phone_number = Column(String, nullable=True)

    date_of_birth = Column(Date, nullable=False)

    sex = Column(
        Enum(Gender),
        nullable=False,
    )

    work_type = Column(String, nullable=True)

    education = Column(Enum(EducationLevel), nullable=False)

    # -------------------------
    # Chronic Medical History
    # -------------------------
    diabetes = Column(Boolean, nullable=False, default=False)

    heart_disease = Column(Boolean, nullable=False, default=False)

    history_cvd = Column(Boolean, nullable=False, default=False)

    kidney_disease = Column(Boolean, nullable=False, default=False)

    prevalent_stroke = Column(Boolean, nullable=False, default=False)

    prevalent_hypertension = Column(Boolean, nullable=False, default=False)
    bp_history = Column(Enum(BpHistory), nullable=False, default=False)

    family_history_htn = Column(Boolean, nullable=True)

    family_history_cvd = Column(Boolean, nullable=True)

    # -------------------------
    # Lifestyle Baseline
    # -------------------------
    smoking = Column(
        Enum(SmokingStatus),
        nullable=False,
    )

    cigs_per_day = Column(Integer, nullable=True)

    alcohol_use = Column(
        Enum(AlcoholUse),
        nullable=True,
    )

    physical_activity_level = Column(
        Enum(PhysicalActivity),
        nullable=True,
    )

    exercise_frequency = Column(String, nullable=True)

    diet_quality = Column(String, nullable=True)

    salt_intake = Column(Float, nullable=True)

    stress_score = Column(Integer, nullable=True)

    sleep_duration = Column(Float, nullable=True)

    sleep_quality = Column(String, nullable=True)

    # -------------------------
    # Metadata
    # -------------------------
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
    )

    # -------------------------
    # Relationships
    # -------------------------
    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id"),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="profiles",
    )




# =========================================================
# Health Assessment
# Dynamic prediction-time clinical data
# =========================================================
class HealthAssessment(Base):
    __tablename__ = "health_assessment"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        unique=True,
    )

    # -------------------------
    # Relationships
    # -------------------------
    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id"),
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="health_assessments",
    )

    # -------------------------
    # Anthropometric Measurements
    # -------------------------
    weight = Column(Float, nullable=True)

    height = Column(Float, nullable=True)

    bmi = Column(Float, nullable=True)

    log_bmi = Column(Float, nullable=True)

    # -------------------------
    # Current Clinical Data
    # -------------------------
    glucose = Column(Float, nullable=True)

    avg_glucose_level = Column(Float, nullable=True)

    total_cholesterol = Column(Float, nullable=True)

    hdl_cholesterol = Column(Float, nullable=True)

    on_bp_medication = Column(
        Boolean,
        nullable=False,
        default=False,
    )
    bp_medication_type = Column(
        Enum(BpMedication), nullable=False, default=BpMedication.NONE
    )

    # -------------------------
    # Lifestyle Snapshot
    # -------------------------
    smoking_status = Column(
        Enum(SmokingStatus),
        nullable=True,
    )
    cigs_per_day = Column(Integer, nullable=True)

    alcohol_use = Column(
        Enum(AlcoholUse),
        nullable=True,
    )

    physical_activity_level = Column(
        Enum(PhysicalActivity),
        nullable=True,
    )

    # -------------------------
    # Notes / Metadata
    # -------------------------
    assessment_notes = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # -------------------------
    # Related Measurements
    # -------------------------
    blood_pressures = relationship(
        "BloodPressure",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )

    heart_rates = relationship(
        "HeartRate",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )

    risk_assessment_results = relationship(
        "RiskAssessmentResult",
        back_populates="assessment",
        cascade="all, delete-orphan",
    )


# =========================================================
# Blood Pressure
# =========================================================
class BloodPressure(Base):
    __tablename__ = "blood_pressure"

    id = Column(Integer, primary_key=True)

    # -------------------------
    # Relationships
    # -------------------------
    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id"),
        nullable=False,
    )

    assessment_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("health_assessment.id"),
        nullable=True,
    )

    # -------------------------
    # Measurement Data
    # -------------------------
    systolic_value = Column(Float, nullable=False)

    diastolic_value = Column(Float, nullable=False)

    systolic_unit = Column(
        Enum(BloodPressureUnit),
        default=BloodPressureUnit.mmHg,
    )

    diastolic_unit = Column(
        Enum(BloodPressureUnit),
        default=BloodPressureUnit.mmHg,
    )

    pulse_pressure = Column(Float, nullable=True)

    # -------------------------
    # Timing
    # -------------------------
    start_date_time = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date_time = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # -------------------------
    # Contextual Metadata
    # -------------------------
    descriptive_statistic = Column(
        Enum(DescriptiveStatistic),
        nullable=True,
    )

    temporal_relationship_to_physical_activity = Column(
        Enum(TemporalRelationship),
        nullable=True,
    )

    temporal_relationship_to_sleep = Column(
        Enum(TemporalRelationshipToSleep),
        nullable=True,
    )

    body_posture = Column(
        Enum(BodyPosture),
        nullable=True,
    )

    measurement_location = Column(
        Enum(MeasurementLocation),
        nullable=True,
    )

    # -------------------------
    # Relationships
    # -------------------------
    user = relationship(
        "User",
        back_populates="blood_pressures",
    )

    assessment = relationship(
        "HealthAssessment",
        back_populates="blood_pressures",
    )


# =========================================================
# Heart Rate
# =========================================================
class HeartRate(Base):
    __tablename__ = "heart_rate"

    id = Column(Integer, primary_key=True)

    # -------------------------
    # Relationships
    # -------------------------
    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id"),
        nullable=False,
    )

    assessment_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("health_assessment.id"),
        nullable=True,
    )

    # -------------------------
    # Measurement Data
    # -------------------------
    value = Column(Float, nullable=False)

    unit = Column(
        Enum(HeartRateUnit),
        default=HeartRateUnit.beats_per_min,
    )

    # -------------------------
    # Timing
    # -------------------------
    start_date_time = Column(
        DateTime(timezone=True),
        nullable=False,
    )

    end_date_time = Column(
        DateTime(timezone=True),
        nullable=True,
    )

    # -------------------------
    # Contextual Metadata
    # -------------------------
    descriptive_statistic = Column(
        Enum(DescriptiveStatistic),
        nullable=True,
    )

    temporal_relationship_to_physical_activity = Column(
        Enum(TemporalRelationship),
        nullable=True,
    )

    temporal_relationship_to_sleep = Column(
        Enum(TemporalRelationshipToSleep),
        nullable=True,
    )

    body_posture = Column(
        Enum(BodyPosture),
        nullable=True,
    )

    measurement_location = Column(
        Enum(MeasurementLocation),
        nullable=True,
    )

    # -------------------------
    # Relationships
    # -------------------------
    user = relationship(
        "User",
        back_populates="heart_rates",
    )

    assessment = relationship(
        "HealthAssessment",
        back_populates="heart_rates",
    )


# =========================================================
# Prescription
# =========================================================
class Prescription(Base):
    __tablename__ = "prescription"

    id = Column(Integer, primary_key=True)

    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id"),
        nullable=False,
    )

    medication_name = Column(
        String,
        nullable=False,
    )

    route = Column(
        Enum(AdministrationRoute),
        nullable=False,
    )

    prescription_trigger = Column(
        String,
        nullable=True,
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    # -------------------------
    # Relationships
    # -------------------------
    user = relationship(
        "User",
        back_populates="prescriptions",
    )

    schedules = relationship(
        "DoseSchedule",
        back_populates="prescription",
        cascade="all, delete-orphan",
    )


# =========================================================
# Dose Schedule
# =========================================================
class DoseSchedule(Base):
    __tablename__ = "dose_schedule"

    id = Column(Integer, primary_key=True)

    prescription_id = Column(
        Integer,
        ForeignKey("prescription.id"),
        nullable=False,
    )

    dose_duration_value = Column(Float, nullable=True)

    dose_duration_unit = Column(String, nullable=True)

    dose_administration_duration_value = Column(
        Float,
        nullable=True,
    )

    dose_administration_duration_unit = Column(
        String,
        nullable=True,
    )

    dose_value = Column(Float, nullable=True)

    dose_unit = Column(String, nullable=True)

    dose_min_value = Column(Float, nullable=True)

    dose_max_value = Column(Float, nullable=True)

    frequency = Column(String, nullable=True)

    dose_prn_trigger = Column(String, nullable=True)

    # -------------------------
    # Relationships
    # -------------------------
    prescription = relationship(
        "Prescription",
        back_populates="schedules",
    )


# =========================================================
# Risk Assessment Result
# Stores prediction outputs from ML models
# =========================================================
class RiskAssessmentResult(Base):
    __tablename__ = "risk_assessment_result"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        unique=True,
    )

    user_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("user.id"),
        nullable=False,
    )

    assessment_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("health_assessment.id"),
        nullable=False,
    )

    # =====================================================
    # Fields strictly matching RiskAssessmentResultRead
    # =====================================================
    disease = Column(
        String(255),
        nullable=False,
    )

    risk_score = Column(
        Float,
        nullable=False,
    )

    risk_percentage = Column(
        Float,
        nullable=False,
    ) # <--- Added to model to match schema (e.g., 83.0)

    risk_label = Column(
        String(100),
        nullable=False,
    )

    model_version = Column(
        String(50),
        nullable=False,
    )

    predicted_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    # =====================================================
    # Relationships
    # =====================================================
    user = relationship(
        "User",
        back_populates="risk_assessment_results",
    )

    assessment = relationship(
        "HealthAssessment",
        back_populates="risk_assessment_results",
    )

    # 1:1 Relationship to Explainability table
    explainability = relationship(
        "RiskAssessmentExplainability",
        back_populates="risk_assessment",
        uselist=False,
        cascade="all, delete-orphan",
    )
    
class RiskAssessmentExplainability(Base):
    __tablename__ = "risk_assessment_explainability"

    id = Column(
        PG_UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
        unique=True,
    )

    risk_assessment_id = Column(
        PG_UUID(as_uuid=True),
        ForeignKey("risk_assessment_result.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
    )

    # =====================================================
    # AI Insights & Metrics
    # =====================================================
    top_risk_factors = Column(
        Text,
        nullable=True,
    )

    recommendation = Column(
        Text,
        nullable=True,
    )

    clinical_summary = Column(
        Text,
        nullable=True,
    )

    shap_values = Column(
        Text,
        nullable=True,
    )

    lime_explanation = Column(
        Text,
        nullable=True,
    )

    inference_time_ms = Column(
        Float,
        nullable=True,
    )

    # =====================================================
    # Relationships
    # =====================================================
    risk_assessment = relationship(
        "RiskAssessmentResult",
        back_populates="explainability",
    )