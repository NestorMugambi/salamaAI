# routes/user_profile.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import User, get_async_session
from app.users import current_active_user

from .schemas import (
    UserProfileCreate,
    UserProfileRead,
    UserProfileUpdate,
)
from .service import UserProfileService


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.post("/", response_model=UserProfileRead)
async def create_profile(
    profile: UserProfileCreate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = UserProfileService(session)

    # Ensure profile is linked to logged-in user
    profile.user_id = user.id

    created_profile = await service.create_profile(profile)

    if not created_profile:
        raise HTTPException(status_code=400, detail="Profile creation failed")

    return created_profile


@router.get("/", response_model=UserProfileRead)
async def get_profile(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = UserProfileService(session)

    profile = await service.get_profile(user.id)

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.put("/", response_model=UserProfileRead)
async def update_profile(
    profile_data: UserProfileUpdate,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = UserProfileService(session)

    updated_profile = await service.update_profile(user.id, profile_data)

    if not updated_profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return updated_profile


@router.delete("/", response_model=bool)
async def delete_profile(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    service = UserProfileService(session)

    success = await service.delete_profile(user.id)

    if not success:
        raise HTTPException(status_code=404, detail="Profile not found")

    return success
