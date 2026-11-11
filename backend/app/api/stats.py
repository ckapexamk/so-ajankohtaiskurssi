"""HTTP endpoints for authenticated user's statistics."""

from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.stats import (
    ProgressGranularity,
    ProgressMetric,
    StatsPeriod,
    StatsSummary,
)
from app.services.stats import get_user_progress, get_user_summary


router = APIRouter(
    prefix="/stats",
    tags=["stats"],
)


@router.get("/summary", response_model=StatsSummary)
def get_summary(
    from_: datetime | None = Query(default=None, alias="from"),
    to: datetime | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StatsSummary:
    """Return the authenticated user's sessions summary for the date range.
    
    datetime uses ISO 8601 format, e.g. YYYY-MM-DDT00:00:00Z
    """
    if from_ is not None and to is not None and from_ > to:
        raise HTTPException(status_code=400, detail="Invalid date range")

    return get_user_summary(
        db=db,
        user_id=current_user.id,
        from_=from_,
        to=to,
    )


@router.get("/progress", response_model=list[StatsPeriod])
def get_progress(
    metric: ProgressMetric = Query(...,
        description="Metric to chart: sessions, duration_min, or distance_km.",
    ),
    granularity: ProgressGranularity = Query(
        default="week",
        description="Time period length: ISO week (Monday start) or calendar month.",
    ),
    activity_type_id: UUID | None = Query(
        default=None,
        description="Optional activity type UUID from the activity catalog.",
    ),
    from_: datetime | None = Query(
        default=None,
        alias="from",
        description="Optional datetime in format YYYY-MM-DDT00:00:00Z",
    ),
    to: datetime | None = Query(
        default=None,
        description="Optional datetime in format YYYY-MM-DDT00:00:00Z",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[StatsPeriod]:
    if from_ is not None and to is not None and from_ > to:
        raise HTTPException(status_code=400, detail="Invalid date range")

    return get_user_progress(
        db=db,
        user_id=current_user.id,
        metric=metric,
        granularity=granularity,
        activity_type_id=activity_type_id,
        from_=from_,
        to=to,
    )
