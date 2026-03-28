from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from typing import Type, TypeVar, Generic, Optional, List
from pydantic import BaseModel
from fastapi import HTTPException, status
from datetime import datetime
from app.models import BloodPressure, HeartRate
from.schemas import BloodPressureCreate,HeartRateCreate

T = TypeVar('T')  # Generic type for SQLAlchemy models
S = TypeVar('S', bound=BaseModel)  # Generic type for Pydantic schemas

class GenericService(Generic[T, S]):
    """Generic service for CRUD operations on any SQLAlchemy model."""
    
    def __init__(self, session: AsyncSession, model: Type[T]):
        self.session = session
        self.model = model

    async def create_record(
        self,
        user_id: str,
        data: S,
        **kwargs
    ) -> T:
        """Create a new record for the given model."""
        record = self.model(user_id=user_id, **data.model_dump(), **kwargs)
        self.session.add(record)
        await self.session.commit()
        await self.session.refresh(record)
        return record

    async def get_record(
        self,
        record_id: int,
        user_id: str
    ) -> Optional[T]:
        """Fetch a single record by ID (with ownership check)."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.id == record_id)
            .where(self.model.user_id == user_id)
        )
        return result.scalar_one_or_none()

    async def get_user_records(
        self,
        user_id: str,
        limit: int = 100
    ) -> List[T]:
        """Fetch all records for a user."""
        result = await self.session.execute(
            select(self.model)
            .where(self.model.user_id == user_id)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_all_records(
        self,
        limit: int = 100
    ) -> List[T]:
        """Fetch all records (admin-only)."""
        result = await self.session.execute(
            select(self.model)
            .limit(limit)
        )
        return result.scalars().all()

    async def delete_record(
        self,
        record_id: int,
        user_id: str
    ) -> bool:
        """Delete a record (with ownership check)."""
        record = await self.get_record(record_id, user_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"{self.model.__name__} record not found or access denied."
            )
        await self.session.delete(record)
        await self.session.commit()
        return True
    
class BloodPressureService(GenericService[BloodPressure, BloodPressureCreate]):
    """Service for Blood Pressure records."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, BloodPressure)

class HeartRateService(GenericService[HeartRate, HeartRateCreate]):
    """Service for Heart Rate records."""
    
    def __init__(self, session: AsyncSession):
        super().__init__(session, HeartRate)
        
