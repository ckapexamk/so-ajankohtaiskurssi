from datetime import datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, model_validator

GoalPeriod = Literal["week", "month"]

class GoalCreate(BaseModel):
    unit_type_id: UUID
    target_value: Decimal
    period: GoalPeriod
    activity_type_id: UUID | None = None
    active: bool = True

class GoalUpdate(BaseModel):
    unit_type_id: UUID | None = None
    target_value: Decimal | None = None
    period: GoalPeriod | None = None
    activity_type_id: UUID | None = None
    active: bool | None = None

    @model_validator(mode="after")
    def reject_null_required_fields(self):
        for field in ("unit_type_id", "target_value", "period"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} cannot be null.")
        return self


class GoalRead(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    user_id: UUID
    unit_type_id: UUID
    target_value: Decimal
    period: GoalPeriod
    activity_type_id: UUID | None
    active: bool
    created_at: datetime