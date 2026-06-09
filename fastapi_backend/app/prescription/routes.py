from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import User, get_async_session
from app.users import current_active_user
from .schemas import PrescriptionCreate, PrescriptionRead
from .service import PrescriptionService

router = APIRouter(prefix="/prescriptions", tags=["Prescriptions"])


@router.post("/", response_model=PrescriptionRead)
async def create_prescription(
    data: PrescriptionCreate,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    service = PrescriptionService(session)
    # user.id is passed as the patient_id context
    return await service.create_prescription(patient_id=user.id, data=data)


@router.get("/{prescription_id}", response_model=PrescriptionRead)
async def get_prescription(
    prescription_id: UUID,
    session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    service = PrescriptionService(session)
    prescription = await service.get_prescription(
        prescription_id=prescription_id, patient_id=user.id
    )
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
    return await service.get_user_prescriptions(patient_id=user.id, limit=limit)