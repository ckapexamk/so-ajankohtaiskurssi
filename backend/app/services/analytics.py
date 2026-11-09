"""Pure analytics inputs and functions; no database or network I/O.

Callers must pass sessions already filtered for the logged-in user.
"""

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal
from statistics import mean
from typing import Literal, TypedDict


class SeriesPoint(TypedDict):
    period_label: str
    value: int | float


class ActivitySummary(TypedDict):
    session_count: int


class SessionSummary(TypedDict):
    session_count: int
    total_duration_min: float
    total_distance_km: float
    average_intensity: float | None
    by_activity_type: dict[str, ActivitySummary]


# a single activity
@dataclass(frozen=True)
class ActivityInput:
    """An activity in a session
    
    activity_type   : stable slug such as "running".
    measurements    : maps unit slugs, such as "duration_min", to values.
    """
    activity_type: str
    measurements: Mapping[str, Decimal]


# session data
@dataclass(frozen=True)
class SessionInput:
    """Session fields needed by analytics.

    session_at  : None when the session is unscheduled.
    intensity   : scale of 1-10, or None when not recorded.
    """
    session_at: datetime | None
    intensity: int | None 
    activities: tuple[ActivityInput, ...]

# Progress time series
SeriesMetric = Literal["session_count", "duration_min", "distance_km"]
Granularity = Literal["week", "month"]


def sessions_series(
    sessions: list[SessionInput],
    metric: SeriesMetric,
    granularity: Granularity,
    activity_type: str | None = None,
) -> list[SeriesPoint]:
    """Using ISO time convention for months and weeks.
    
    Weeks start on Monday.
    Unscheduled sessions are skipped.
    """
    if granularity not in ("week", "month"):
        raise ValueError("granularity must be 'week' or 'month'")
    if metric not in ("session_count", "duration_min", "distance_km"):
        raise ValueError("unsupported series metric")

    time_series: dict[str, Decimal] = {}

    for session in sessions:
        if session.session_at is None:
            continue

        activities = session.activities
        if activity_type is not None:
            activities = tuple(
                activity
                for activity in activities
                if activity.activity_type == activity_type
            )
            if not activities:
                continue

        session_date = session.session_at.date()
        if granularity == "week":
            iso_year, iso_week, _ = session_date.isocalendar()
            period = f"{iso_year}-W{iso_week:02d}"
        else:
            period = f"{session_date.year:04d}-{session_date.month:02d}"

        if metric == "session_count":
            value = Decimal("1")
        else:
            value = sum(
                (
                    activity.measurements.get(metric, Decimal("0"))
                    for activity in activities
                ),
                start=Decimal("0"),
            )

        time_series[period] = time_series.get(period, Decimal("0")) + value

    return [
        {
            "period_label": period,
            "value": int(value) if metric == "session_count" else float(value),
        }
        for period, value in sorted(time_series.items())
    ]


def session_summary(sessions: list[SessionInput]) -> SessionSummary:
    """Sessions summary; no unscheduled sessions.

    Empty measurements are zeros.
    Average intensity for empty set is 'null'.
    """
    scheduled_sessions = [
        session for session in sessions if session.session_at is not None
    ]

    return {
        "session_count": len(scheduled_sessions),
        "total_duration_min": float(total_measurement(scheduled_sessions, "duration_min")),
        "total_distance_km": float(total_measurement(scheduled_sessions, "distance_km")),
        "average_intensity": sessions_intensity(scheduled_sessions),
        "by_activity_type": {
            activity_type: {"session_count": count}
            for activity_type, count in sessions_activities(scheduled_sessions).items()
        },
    }


def sessions_activities(sessions: list[SessionInput]) -> dict[str, int]:
    count: dict[str, int] = {}

    for session in sessions:
        if session.session_at is None:
            continue

        # A session counts once per activity type, even if it has duplicates.
        activity_types = {activity.activity_type for activity in session.activities}
        for activity_type in activity_types:
            count[activity_type] = count.get(activity_type, 0) + 1

    return count


def total_measurement(
    sessions: list[SessionInput],
    unit_slug: str,
) -> Decimal:
    """Total of a unit_slug measurements / None = 0"""
    total = Decimal("0")

    for session in sessions:
        for activity in session.activities:
            total += activity.measurements.get(unit_slug, Decimal("0"))

    return total


def sessions_intensity(sessions: list[SessionInput]) -> float | None:
    """Average intensity of sessions, or None if none were recorded."""
    intensities = [
        session.intensity
        for session in sessions
        if session.intensity is not None
    ]
    return float(mean(intensities)) if intensities else None


def sessions_duration(sessions: list[SessionInput]) -> Decimal:
    return total_measurement(sessions, "duration_min")


def sessions_distance(sessions: list[SessionInput]) -> Decimal:
    return total_measurement(sessions, "distance_km")

