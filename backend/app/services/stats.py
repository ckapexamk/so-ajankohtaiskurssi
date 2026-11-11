"""Converts database sessions and measurements into analytics input types.

Returns a summary function 'session_summary()' call with the inputs.
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.session import find_stats_sessions
from app.schemas.stats import ProgressGranularity, ProgressMetric
from app.services import analytics


def _load_analytics(
    db: Session,
    user_id: UUID,
    from_: datetime | None,
    to: datetime | None,
    activity_type_id: UUID | None = None,
) -> list[analytics.SessionInput]:
    db_sessions, activity_slugs, unit_slugs = find_stats_sessions(
        db=db,
        user_id=user_id,
        from_=from_,
        to=to,
        activity_type_id=activity_type_id,
    )

    analytics_sessions: list[analytics.SessionInput] = []
    for session in db_sessions:
        activities: list[analytics.ActivityInput] = []
        for item in session.items:
            if (
                activity_type_id is not None
                and item.activity_type_id != activity_type_id
            ):
                continue

            measurements: dict[str, Decimal] = {}
            for measurement in item.measurements:
                if measurement.actual_value is None:
                    continue

                unit_slug = unit_slugs[measurement.unit_type_id]
                measurements[unit_slug] = (
                    measurements.get(unit_slug, Decimal("0"))
                    + measurement.actual_value
                )

            activities.append(
                analytics.ActivityInput(
                    activity_type=activity_slugs[item.activity_type_id],
                    measurements=measurements,
                )
            )

        analytics_sessions.append(
            analytics.SessionInput(
                session_at=session.session_at,
                intensity=session.intensity,
                activities=tuple(activities),
            )
        )

    return analytics_sessions


def get_user_summary(
    db: Session,
    user_id: UUID,
    from_: datetime | None = None,
    to: datetime | None = None,
) -> analytics.SessionSummary:
    sessions = _load_analytics(
        db=db,
        user_id=user_id,
        from_=from_,
        to=to,
    )

    return analytics.session_summary(sessions)


def get_user_progress(
    db: Session,
    user_id: UUID,
    metric: ProgressMetric,
    granularity: ProgressGranularity,
    activity_type_id: UUID | None = None,
    from_: datetime | None = None,
    to: datetime | None = None,
) -> list[analytics.SeriesPoint]:
    """Load a user's filtered sessions and calculate chart points."""
    sessions = _load_analytics(
        db=db,
        user_id=user_id,
        from_=from_,
        to=to,
        activity_type_id=activity_type_id,
    )
    analytics_metric: analytics.SeriesMetric = (
        "session_count" if metric == "sessions" else metric
    )
    return analytics.sessions_series(
        sessions=sessions,
        metric=analytics_metric,
        granularity=granularity,
    )
