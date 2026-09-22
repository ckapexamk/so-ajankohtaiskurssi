from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class UserPublic(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    email: EmailStr
    display_name: str