from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Type
from app.models import BloodPressure,HeartRate
from .service import BloodPressureService

from .schemas import BloodPressureCreate, BloodPressureRead, HeartRateCreate, HeartRateRead
from app.database import User, get_async_session
from app.users import current_active_user

router = APIRouter(tags=["health_data"])


# --------------------------
# Blood Pressure Routes
# --------------------------
@router.post("/blood-pressure/", response_model=BloodPressureRead)
async def create_bp(
       bp_in: BloodPressureCreate,
       session: AsyncSession = Depends(get_async_session),
       user: User = Depends(current_active_user)
   ):
       ##print(f"User ID: {user.id}")  # Debugging
       
       instance = BloodPressure(
           user_id=user.id,
           **bp_in.model_dump(exclude={'user_id'}))
       ##print(f"Instance user_id: {instance.user_id}")  # Debugging
       session.add(instance)
       await session.commit()
       await session.refresh(instance)
       return instance


@router.get("/blood-pressure/", response_model=list[BloodPressureRead])
async def get_all_bp(session: AsyncSession = Depends(get_async_session)):    
    result = await session.execute(select(BloodPressure))
    return result.scalars().all()


# --------------------------
# Heart Rate Routes
# --------------------------
@router.post("/heart-rate/", response_model=HeartRateRead)
async def create_hr(
    hr_in: HeartRateCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user)
):
    instance = HeartRate(**hr_in.model_dump(), user_id = user.id)
    session.add(instance)
    await session.commit()
    await session.refresh(instance)
    return instance


@router.get("/heart-rate/", response_model=list[HeartRateRead])
async def get_all_hr(session: AsyncSession = Depends(get_async_session)):
    result = await session.execute(select(HeartRate))
    return result.scalars().all()
