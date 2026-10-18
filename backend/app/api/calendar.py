from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.deps import get_current_user
from app.db.session import get_db
from app.schemas.calendar import CalendarSessionRead
from app.services.calendar import list_calendar_sessions


router = APIRouter(
    prefix="/calendar",
    tags=["calendar"],
)


@router.get("", response_model=list[CalendarSessionRead])
def get_calendar(
    from_: datetime = Query(..., alias="from"),
    to: datetime = Query(...),
    plan_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if from_ > to:
        raise HTTPException(status_code=400, detail="Invalid date range")

    return list_calendar_sessions(
        db=db,
        user_id=current_user.id,
        from_=from_,
        to=to,
        plan_id=plan_id,
    )