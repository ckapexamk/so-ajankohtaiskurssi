"""HTTP endpoints for authenticated user's statistics."""

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.stats import StatsSummary
from app.services.stats import get_user_summary


router = APIRouter(
    prefix="/stats",
    tags=["stats"],
)


@router.get("/summary", response_model=StatsSummary)
def get_summary(
    from_: datetime | None = Query(default=None, alias="from"),
    to: datetime | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StatsSummary:
    """Return the authenticated user's sessions summary for the date range.
    
    datetime uses ISO 8601 format, e.g. 2026-10-01T00:00:00Z
    """
    if from_ is not None and to is not None and from_ > to:
        raise HTTPException(status_code=400, detail="Invalid date range")

    return get_user_summary(
        db=db,
        user_id=current_user.id,
        from_=from_,
        to=to,
    )
