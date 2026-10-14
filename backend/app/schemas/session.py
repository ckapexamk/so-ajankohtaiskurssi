from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


SessionStatus = Literal["planned", "in_progress", "completed"]


# Create POST
class MeasurementCreate(BaseModel):
    unit_type_id: UUID
    planned_value: Decimal | None = None
    actual_value: Decimal | None = None
    set_index: int | None = None

    @model_validator(mode="after")
    def require_value(self):
        if self.planned_value is None and self.actual_value is None:
            raise ValueError("Add a planned or actual value.")
        return self

class ItemCreate(BaseModel):
    activity_type_id: UUID
    sort_order: int = 0
    notes: str | None = None
    measurements: list[MeasurementCreate] = Field(default_factory=list)

class SessionCreate(BaseModel):
    name: str
    session_at: datetime | None = None
    status: SessionStatus = "planned"
    notes: str | None = None
    intensity: int | None = None
    plan_id: UUID | None = None
    items: list[ItemCreate] = Field(default_factory=list)

# Read GET
class MeasurementRead(BaseModel):
    model_config = {"from_attributes": True}
    
    id: UUID
    unit_type_id: UUID
    planned_value: Decimal | None
    actual_value: Decimal | None
    set_index: int | None

class ItemRead(BaseModel):
    model_config = {"from_attributes": True}
    
    id: UUID
    activity_type_id: UUID
    sort_order: int
    notes: str | None
    measurements: list[MeasurementRead] = Field(default_factory=list)

class SessionRead(BaseModel):
    model_config = {"from_attributes": True}
      
    id: UUID
    user_id: UUID
    name: str
    session_at: datetime | None
    status: SessionStatus
    notes: str | None
    intensity: int | None
    plan_id: UUID | None
    created_at: datetime
    items: list[ItemRead] = Field(default_factory=list)

# Update PATCH
class SessionUpdate(BaseModel):
    name: str | None = None
    session_at: datetime | None = None
    status: SessionStatus | None = None
    notes: str | None = None
    intensity: int | None = None
    plan_id: UUID | None = None
    items: list[ItemCreate] = Field(default_factory=list)