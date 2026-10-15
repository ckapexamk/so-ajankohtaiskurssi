from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.schemas.session import SessionStatus


class CalendarSessionRead(BaseModel):
    model_config = {"from_attributes": True}

    id: UUID
    name: str
    session_at: datetime
    status: SessionStatus
    plan_id: UUID | None