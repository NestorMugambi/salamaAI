from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional, Type
from app.models import BloodPressure, HeartRate
from .service import BloodPressureService, HeartRateService

from .schemas import (
    BloodPressureCreate,
    BloodPressureRead,
    HeartRateCreate,
    HeartRateRead,
)
from app.database import User, get_async_session
from app.users import current_active_user

router = APIRouter(tags=["health_data"])


@router.post("/blood-pressure/", response_model=BloodPressureRead)
async def create_bp(
    data: BloodPressureCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Create a new blood pressure record."""
    service = BloodPressureService(session)
    return await service.create_record(user.id, data)


@router.get("/blood-pressure/{bp_id}", response_model=BloodPressureRead)
async def get_bp(
    bp_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Fetch a single blood pressure record by ID."""
    service = BloodPressureService(session)
    record = await service.get_record(bp_id, user.id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.get("/blood-pressure/", response_model=list[BloodPressureRead])
async def get_all_bp(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Fetch all blood pressure records for the current user (with optional date filtering)."""
    service = BloodPressureService(session)
    records = await service.get_user_records(user.id, limit)

    # Optional: Filter by date range
    if start_date or end_date:
        records = [
            r
            for r in records
            if (not start_date or r.start_date_time >= start_date)
            and (not end_date or r.end_date_time <= end_date)
        ]
    return records


@router.delete("/blood-pressure/{bp_id}")
async def delete_bp(
    bp_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Delete a blood pressure record."""
    service = BloodPressureService(session)
    success = await service.delete_record(bp_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted"}


# ==============================================
# Heart Rate Routes (Same structure as BP)
# ==============================================


@router.post("/heart-rate/", response_model=HeartRateRead)
async def create_hr(
    data: HeartRateCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Create a new heart rate record."""
    service = HeartRateService(session)
    return await service.create_record(user.id, data)


@router.get("/heart-rate/{hr_id}", response_model=HeartRateRead)
async def get_hr(
    hr_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Fetch a single heart rate record by ID."""
    service = HeartRateService(session)
    record = await service.get_record(hr_id, user.id)
    if not record:
        raise HTTPException(status_code=404, detail="Record not found")
    return record


@router.get("/heart-rate/", response_model=list[HeartRateRead])
async def get_all_hr(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: int = Query(100, ge=1),
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Fetch all heart rate records for the current user (with optional date filtering)."""
    service = HeartRateService(session)
    records = await service.get_user_records(user.id, limit)

    # Optional: Filter by date range
    if start_date or end_date:
        records = [
            r
            for r in records
            if (not start_date or r.start_date_time >= start_date)
            and (not end_date or r.end_date_time <= end_date)
        ]
    return records


@router.delete("/heart-rate/{hr_id}")
async def delete_hr(
    hr_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Delete a heart rate record."""
    service = HeartRateService(session)
    success = await service.delete_record(hr_id, user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Record not found")
    return {"message": "Record deleted"}
