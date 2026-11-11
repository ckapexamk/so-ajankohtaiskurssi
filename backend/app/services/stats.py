"""Converts database sessions and measurements into analytics input types.

Returns a call using the summary function 'session_summary()' with the inputs.
"""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.session import find_stats_sessions
from app.services import analytics


def get_user_summary(
    db: Session,
    user_id: UUID,
    from_: datetime | None = None,
    to: datetime | None = None,
) -> analytics.SessionSummary:
    sessions, activity_slugs, unit_slugs = find_stats_sessions(
        db=db,
        user_id=user_id,
        from_=from_,
        to=to,
    )

    analytics_sessions: list[analytics.SessionInput] = []
    for session in sessions:
        activities: list[analytics.ActivityInput] = []
        for item in session.items:
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

    return analytics.session_summary(analytics_sessions)
