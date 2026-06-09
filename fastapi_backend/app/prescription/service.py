from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Prescription
from .schemas import PrescriptionCreate, PrescriptionRead


class PrescriptionService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_prescription(
        self, patient_id: UUID, data: PrescriptionCreate
    ) -> PrescriptionRead:
        """Create a new flattened prescription."""
        # Dump model data to clean dictionary matching the DB column fields
        prescription_data = data.model_dump()
        
        # Override or ensure patient_id is mapped correctly from context
        prescription_data["patient_id"] = patient_id

        prescription = Prescription(**prescription_data)

        self.session.add(prescription)
        await self.session.flush()  # Generate ID and timestamps without committing yet
        await self.session.commit()

        # Leverage Pydantic v2 from_attributes parsing
        return PrescriptionRead.model_validate(prescription)

    async def get_prescription(
        self, prescription_id: UUID, patient_id: UUID
    ) -> Optional[PrescriptionRead]:
        """Fetch a single flattened prescription."""
        result = await self.session.execute(
            select(Prescription)
            .where(Prescription.id == prescription_id)
            .where(Prescription.patient_id == patient_id)
        )
        prescription = result.scalar_one_or_none()

        if not prescription:
            return None

        return PrescriptionRead.model_validate(prescription)

    async def get_user_prescriptions(
        self, patient_id: UUID, limit: int = 100
    ) -> List[PrescriptionRead]:
        """Fetch all prescriptions for a patient."""
        result = await self.session.execute(
            select(Prescription)
            .where(Prescription.patient_id == patient_id)
            .limit(limit)
        )
        prescriptions = result.scalars().all()

        return [PrescriptionRead.model_validate(p) for p in prescriptions]