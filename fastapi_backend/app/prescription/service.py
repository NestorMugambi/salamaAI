from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from app.models import Prescription, DoseSchedule

from fastapi import HTTPException, status
from .schemas import PrescriptionCreate, PrescriptionRead, DoseScheduleRead


class PrescriptionService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_prescription(
        self, user_id: str, data: PrescriptionCreate
    ) -> PrescriptionRead:
        """Create a new prescription with dose schedules."""
        # Create prescription without committing yet
        prescription = Prescription(
            user_id=user_id,
            medication_name=data.medication_name,
            route=data.route,
            prescription_trigger=data.prescription_trigger,
        )

        # Add dose schedules
        for schedule_data in data.schedule:
            schedule = DoseSchedule(**schedule_data.model_dump())
            prescription.schedule.append(schedule)

        self.session.add(prescription)
        await self.session.flush()  # Generate IDs but don't commit

        # Refresh to load relationships
        await self.session.refresh(prescription)

        # Explicitly load schedule relationship
        result = await self.session.execute(
            select(Prescription)
            .options(selectinload(Prescription.schedule))
            .where(Prescription.id == prescription.id)
        )
        full_prescription = result.scalar_one()

        await self.session.commit()

        # Convert to Pydantic model
        return PrescriptionRead(
            id=full_prescription.id,
            user_id=full_prescription.user_id,
            medication_name=full_prescription.medication_name,
            route=full_prescription.route,
            prescription_trigger=full_prescription.prescription_trigger,
            schedule=[
                DoseScheduleRead(**schedule.__dict__)
                for schedule in full_prescription.schedule
            ],
        )

    async def get_prescription(
        self, prescription_id: int, user_id: str
    ) -> Optional[PrescriptionRead]:
        """Fetch a single prescription with its schedule."""
        result = await self.session.execute(
            select(Prescription)
            .options(selectinload(Prescription.schedule))  # Eager load schedule
            .where(Prescription.id == prescription_id)
            .where(Prescription.user_id == user_id)
        )
        prescription = result.scalar_one_or_none()

        if not prescription:
            return None

        return PrescriptionRead(
            id=prescription.id,
            user_id=prescription.user_id,
            medication_name=prescription.medication_name,
            route=prescription.route,
            prescription_trigger=prescription.prescription_trigger,
            schedule=[
                DoseScheduleRead(**schedule.__dict__)
                for schedule in prescription.schedule
            ],
        )

    async def get_user_prescriptions(
        self, user_id: str, limit: int = 100
    ) -> List[PrescriptionRead]:
        """Fetch all prescriptions for a user with their schedules."""
        result = await self.session.execute(
            select(Prescription)
            .options(selectinload(Prescription.schedule))  # Eager load schedule
            .where(Prescription.user_id == user_id)
            .limit(limit)
        )
        prescriptions = result.scalars().all()

        return [
            PrescriptionRead(
                id=p.id,
                user_id=p.user_id,
                medication_name=p.medication_name,
                route=p.route,
                prescription_trigger=p.prescription_trigger,
                schedule=[
                    DoseScheduleRead(**schedule.__dict__) for schedule in p.schedule
                ],
            )
            for p in prescriptions
        ]
