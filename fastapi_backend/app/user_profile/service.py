from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from uuid import UUID
from datetime import datetime

from app.database import User
from app.models import UserProfile
from .schemas import UserProfileCreate, UserProfileRead, UserProfileUpdate
from app.utils import calculate_age

from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status


class UserProfileService:
    def __init__(self, session: AsyncSession):
        self.session = session

    # -----------------------------
    # Create PROFILE
    # -----------------------------
    async def create_profile(self, profile_data: UserProfileCreate) -> UserProfileRead:
        # First get the user to ensure it exists
        user_result = await self.session.execute(
            select(User).where(User.id == profile_data.user_id)
        )
        user = user_result.scalars().first()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )

        # Check if the user already has a profile
        profile_result = await self.session.execute(
            select(UserProfile).where(UserProfile.user_id == profile_data.user_id)
        )
        existing_profile = profile_result.scalars().first()

        if existing_profile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User already has a profile",
            )

        # Create profile
        user_profile = UserProfile(**profile_data.model_dump())
        self.session.add(user_profile)

        try:
            await self.session.commit()
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Profile creation failed due to a database constraint",
            )

        # Refresh and explicitly load the user relationship
        await self.session.refresh(user_profile)
        await self.session.execute(
            select(UserProfile)
            .options(selectinload(UserProfile.user))
            .where(UserProfile.id == user_profile.id)
        )

        return await self.to_read_schema(user_profile)

    # -----------------------------
    # GET PROFILE
    # -----------------------------
    async def get_profile(self, user_id: UUID) -> UserProfileRead | None:
        result = await self.session.execute(
            select(UserProfile)
            .options(selectinload(UserProfile.user))
            .where(UserProfile.user_id == user_id)
        )

        profile = result.scalars().first()
        if not profile:
            return None

        return await self.to_read_schema(profile)

    # -----------------------------
    # UPDATE PROFILE (PROTECTED FIELDS)
    # -----------------------------
    async def update_profile(
        self, user_id: UUID, profile_data: UserProfileUpdate
    ) -> UserProfileRead | None:
        # Fetch profile with user relationship
        result = await self.session.execute(
            select(UserProfile)
            .options(selectinload(UserProfile.user))
            .where(UserProfile.user_id == user_id)
        )

        profile = result.scalars().first()
        if not profile:
            return None

        # Fields that cannot be updated
        protected_fields = {
            "email",
            "sex",
            "date_of_birth",
            "first_name",
            "middle_name",
            "last_name",
        }

        # Get update data excluding protected fields
        update_data = {
            k: v
            for k, v in profile_data.model_dump(exclude_unset=True).items()
            if k not in protected_fields
        }

        # Apply updates
        for key, value in update_data.items():
            setattr(profile, key, value)

        profile.updated_at = datetime.utcnow()
        await self.session.commit()

        # Refresh to get updated values
        await self.session.refresh(profile)
        return await self.to_read_schema(profile)

    # -----------------------------
    # DELETE PROFILE
    # -----------------------------
    async def delete_profile(self, user_id: UUID) -> bool:
        result = await self.session.execute(
            select(UserProfile).where(UserProfile.user_id == user_id)
        )

        profile = result.scalars().first()
        if not profile:
            return False

        await self.session.delete(profile)
        await self.session.commit()
        return True

    # -----------------------------
    # RESPONSE MAPPER
    # -----------------------------
    async def to_read_schema(self, profile: UserProfile) -> UserProfileRead:
        # Ensure user is loaded
        if not hasattr(profile, "user") or profile.user is None:
            # Explicitly load if not loaded
            await self.session.refresh(profile, ["user"])

        if profile.user is None:
            raise ValueError("User relationship not available")

        profile_data = profile.__dict__
        profile_data.pop("_sa_instance_state", None)  # Remove SQLAlchemy internal state

        return UserProfileRead(
            **profile_data,
            email=profile.user.email,
            age=calculate_age(profile.date_of_birth) if profile.date_of_birth else None,
        )
