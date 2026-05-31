import uuid

from fastapi_users import schemas
from pydantic import BaseModel
from uuid import UUID
from .enums import UserRole


class UserRead(schemas.BaseUser[uuid.UUID]):
    role:UserRole


class UserCreate(schemas.BaseUserCreate):
    role:UserRole


class UserUpdate(schemas.BaseUserUpdate):
    role:UserRole


