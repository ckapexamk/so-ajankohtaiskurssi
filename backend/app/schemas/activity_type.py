# schemas/activity_type.py
from uuid import UUID
from pydantic import BaseModel, Field

class UnitTypeRead(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    name: str
    slug: str
    unit_label: str | None

class ActivityUnitLinkRead(BaseModel):
    model_config = {"from_attributes": True}

    unit_type_id: UUID
    sort_order: int
    is_required: bool
    per_set: bool
    unit_type: UnitTypeRead

class ActivityTypeRead(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    name: str
    slug: str
    is_system: bool
    user_id: UUID | None
    unit_link: list[ActivityUnitLinkRead] = Field(default_factory=list)

class ActivityTypeCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    slug: str = Field(
        min_length=1,
        max_length=100,
        pattern=r"^[a-z0-9]+([_-][a-z0-9]+)*$",
    )