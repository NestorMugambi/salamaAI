from typing import Generic, List, Optional, Type, TypeVar
from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import (
    BloodPressure,
    HealthAssessment,
    HeartRate,
)
from .schemas import (
    BloodPressureCreate,
    HealthAssessmentCreate,
    HeartRateCreate,
)

T = TypeVar("T")
S = TypeVar("S", bound=BaseModel)


class GenericService(Generic[T, S]):
    """
    Generic async CRUD service.
    """

    def __init__(
        self,
        session: AsyncSession,
        model: Type[T],
    ):
        self.session = session
        self.model = model

    # =====================================================
    # Create
    # =====================================================

    async def create_record(
        self,
        user_id: str,
        data: S,
        **kwargs,
    ) -> T:
        """
        Create a new record.
        If creating a HealthAssessment, it fetches the latest BloodPressure 
        and HeartRate records for the user from the DB and associates them.
        """

        if self.model == HealthAssessment:
            # 1. Create the assessment record with provided payload
            record = HealthAssessment(
                user_id=user_id,
                **data.model_dump(),
                **kwargs,
            )
            self.session.add(record)
            
            # Flush so PostgreSQL generates the UUID 'id' for HealthAssessment
            await self.session.flush()

            # 2. Fetch the latest BloodPressure record for this user
            bp_query = (
                select(BloodPressure)
                .where(BloodPressure.user_id == user_id)
                .order_by(BloodPressure.start_date_time.desc())
                .limit(1)
            )
            bp_result = await self.session.execute(bp_query)
            latest_bp = bp_result.scalar_one_or_none()

            if latest_bp:
                # Link the existing latest BP to this health assessment
                latest_bp.assessment_id = record.id
                self.session.add(latest_bp)

            # 3. Fetch the latest HeartRate record for this user
            hr_query = (
                select(HeartRate)
                .where(HeartRate.user_id == user_id)
                .order_by(HeartRate.start_date_time.desc())
                .limit(1)
            )
            hr_result = await self.session.execute(hr_query)
            latest_hr = hr_result.scalar_one_or_none()

            if latest_hr:
                # Link the existing latest HR to this health assessment
                latest_hr.assessment_id = record.id
                self.session.add(latest_hr)

        else:
            # Standard creation flow for BloodPressure or HeartRate
            record = self.model(
                user_id=user_id,
                **data.model_dump(),
                **kwargs,
            )
            self.session.add(record)

        await self.session.commit()

        # Refresh so returned object includes populated relationships
        if self.model == HealthAssessment:
            await self.session.refresh(
                record,
                attribute_names=[
                    "blood_pressures",
                    "heart_rates",
                    "risk_assessment_results",
                ],
            )
        else:
            await self.session.refresh(record)

        return record

    # =====================================================
    # Get Single Record
    # =====================================================

    async def get_record(
        self,
        record_id: int,
        user_id: str,
    ) -> Optional[T]:

        query = (
            select(self.model)
            .where(self.model.id == record_id)
            .where(self.model.user_id == user_id)
        )

        if self.model == HealthAssessment:
            query = query.options(
                selectinload(HealthAssessment.blood_pressures),
                selectinload(HealthAssessment.heart_rates),
                selectinload(HealthAssessment.risk_assessment_results),
            )

        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    # =====================================================
    # Get User Records
    # =====================================================

    async def get_user_records(
        self,
        user_id: str,
        limit: int = 100,
    ) -> List[T]:

        query = (
            select(self.model)
            .where(self.model.user_id == user_id)
            .limit(limit)
        )

        if self.model == HealthAssessment:
            query = query.options(
                selectinload(HealthAssessment.blood_pressures),
                selectinload(HealthAssessment.heart_rates),
                selectinload(HealthAssessment.risk_assessment_results),
            )

        result = await self.session.execute(query)
        return result.scalars().all()

    # =====================================================
    # Get All Records
    # =====================================================

    async def get_all_records(
        self,
        limit: int = 100,
    ) -> List[T]:

        query = select(self.model).limit(limit)

        if self.model == HealthAssessment:
            query = query.options(
                selectinload(HealthAssessment.blood_pressures),
                selectinload(HealthAssessment.heart_rates),
                selectinload(HealthAssessment.risk_assessment_results),
            )

        result = await self.session.execute(query)
        return result.scalars().all()

    # =====================================================
    # Delete
    # =====================================================

    async def delete_record(
        self,
        record_id: int,
        user_id: str,
    ) -> bool:

        record = await self.get_record(record_id, user_id)

        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.model.__name__} record not found or access denied.",
            )

        await self.session.delete(record)
        await self.session.commit()
        return True


# =========================================================
# Blood Pressure Service
# =========================================================

class BloodPressureService(GenericService[BloodPressure, BloodPressureCreate]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, BloodPressure)


# =========================================================
# Heart Rate Service
# =========================================================

class HeartRateService(GenericService[HeartRate, HeartRateCreate]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, HeartRate)


# =========================================================
# Health Assessment Service
# =========================================================

class HealthAssessmentService(GenericService[HealthAssessment, HealthAssessmentCreate]):
    def __init__(self, session: AsyncSession):
        super().__init__(session, HealthAssessment)