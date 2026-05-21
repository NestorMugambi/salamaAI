from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from app.enums import EducationLevel, Gender, PhysicalActivity, SmokingStatus, AlcoholUse
from datetime import datetime, date


class UserProfileBase(BaseModel):
        # Personal Information
    # -------------------------


    first_name: str

    middle_name: Optional[str] = None

    last_name: str

    phone_number: Optional[str] = None

    date_of_birth: date

    sex: Gender

    work_type: Optional[str] = None

    education: EducationLevel

    # -------------------------
    # Chronic Medical History
    # -------------------------
    diabetes: bool = False

    heart_disease: bool = False

    history_cvd: bool = False

    kidney_disease: bool = False

    prevalent_stroke: bool = False

    prevalent_hypertension: bool = False

    family_history_htn: Optional[bool] = None

    family_history_cvd: Optional[bool] = None

    # -------------------------
    # Lifestyle Baseline
    # -------------------------
    smoking: SmokingStatus

    cigs_per_day: Optional[int] = None

    alcohol_use: Optional[AlcoholUse] = None

    physical_activity_level: Optional[
        PhysicalActivity
    ] = None

    exercise_frequency: Optional[str] = None

    diet_quality: Optional[str] = None

    salt_intake: Optional[float] = None

    stress_score: Optional[int] = None

    sleep_duration: Optional[float] = None

    sleep_quality: Optional[str] = None

    class Config:
        from_attributes = True
    
class UserProfileCreate(UserProfileBase):
    user_id: UUID


class UserProfileRead(UserProfileBase):
    id: UUID
    user_id: UUID
    email: EmailStr
    age: int  # 👈 computed, not stored

    created_at: datetime
    updated_at: Optional[datetime]

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):


    smoking: SmokingStatus
    diabetes: Optional[bool] = None

    phone_number: Optional[str] = None
