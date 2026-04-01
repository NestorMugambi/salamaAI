from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from app.enums import Gender, SmokingStatus, AlcoholUse
from datetime import datetime, date


class UserProfileBase(BaseModel):
    date_of_birth: date
    sex: Gender
    first_name: str
    middle_name: str
    last_name: str

    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None

    smoking: SmokingStatus
    diabetes: bool = False

    history_cvd: bool = False
    kidney_disease: bool = False
    family_history_htn: Optional[bool] = None

    on_bp_medication: bool = False

    total_cholesterol: Optional[float] = None
    hdl_cholesterol: Optional[float] = None
    glucose: Optional[float] = None

    physical_activity_level: Optional[str] = None
    diet_quality: Optional[str] = None
    alcohol_use: AlcoholUse
    stress_level: Optional[str] = None
    sleep_quality: Optional[str] = None

    phone_number: Optional[str] = None


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
    weight: Optional[float] = None
    height: Optional[float] = None
    bmi: Optional[float] = None

    smoking: SmokingStatus
    diabetes: Optional[bool] = None

    phone_number: Optional[str] = None
