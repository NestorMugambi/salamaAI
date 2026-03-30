from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from .service import PrescriptionService
from .schemas import PrescriptionCreate, PrescriptionRead
from app.database import User, get_async_session
from app.users import current_active_user

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post("/", response_model=PrescriptionRead)
async def create_prescription(
    data: PrescriptionCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    service = PrescriptionService(session)
    return await service.create_prescription(user.id, data)


@router.get("/{prescription_id}", response_model=PrescriptionRead)
async def get_prescription(
    prescription_id: int,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    service = PrescriptionService(session)
    prescription = await service.get_prescription(prescription_id, user.id)
    if not prescription:
        raise HTTPException(status_code=404, detail="Prescription not found")
    return prescription


@router.get("/", response_model=List[PrescriptionRead])
async def get_user_prescriptions(
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    limit: int = 100,
):
    service = PrescriptionService(session)
    return await service.get_user_prescriptions(user.id, limit)
