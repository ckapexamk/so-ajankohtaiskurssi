"""Pure analytics inputs and functions; no database or network I/O.

Callers must pass sessions already filtered for the logged-in user.
"""

from collections.abc import Mapping
from dataclasses import dataclass
from datetime import date, datetime, timedelta
from decimal import Decimal
from statistics import mean
from typing import Literal, TypedDict


class SeriesPoint(TypedDict):
    period_label: str
    value: int | float


class ActivitySummary(TypedDict):
    session_count: int
    average_intensity: float | None
    total_distance_km: float | None


class SessionSummary(TypedDict):
    session_count: int
    total_duration_min: float
    total_distance_km: float
    average_intensity: float | None
    by_activity_type: dict[str, ActivitySummary]


# dataclasses for Input
@dataclass(frozen=True)
class ActivityInput:
    """An activity in a session
    
    activity_type   : stable slug such as "running".
    measurements    : maps unit slugs, such as "duration_min", to values.
    """
    activity_type: str
    measurements: Mapping[str, Decimal]


@dataclass(frozen=True)
class SessionInput:
    """Session fields needed by analytics.

    session_at  : Null when the session is unscheduled.
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


def total_measurement(
    sessions: list[SessionInput],
    unit_slug: str,
) -> Decimal:
    """Total of a unit_slug measurements / Null = 0"""
    total = Decimal("0")

    for session in sessions:
        for activity in session.activities:
            total += activity.measurements.get(unit_slug, Decimal("0"))

    return total


def sessions_intensity(sessions: list[SessionInput]) -> float | None:
    """Average intensity of sessions, or Null if none were recorded."""
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


def sessions_streaks(sessions: list[SessionInput]) -> dict[str, int]:
    """Return current and longest streaks of active weeks.

    Active week contains a session with a non-null session_at.
    Current streak includes this week. A session for today is not required.
    Unscheduled sessions do not count. Empty histories return zeros.
    """
    active_weeks = {
        session.session_at.date()
        - timedelta(days=session.session_at.date().weekday())
        for session in sessions
        if session.session_at is not None
    }

    if not active_weeks:
        return {"current": 0, "longest": 0}

    current_week = date.today()
    current_week -= timedelta(days=current_week.weekday())

    current = 0
    week = current_week
    while week in active_weeks:
        current += 1
        week -= timedelta(days=7)

    longest = 0
    streak = 0
    previous_week: date | None = None
    for week in sorted(active_weeks):
        if previous_week is None or week - previous_week != timedelta(days=7):
            streak = 1
        else:
            streak += 1
        longest = max(longest, streak)
        previous_week = week

    return {"current": current, "longest": longest}


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


def sessions_activity_intensity(sessions: list[SessionInput],) -> dict[str, float | None]:
    intensities: dict[str, list[int]] = {}

    for session in sessions:
        if session.session_at is None:
            continue

        activity_types = {activity.activity_type for activity in session.activities}
        for activity_type in activity_types:
            values = intensities.setdefault(activity_type, [])
            if session.intensity is not None:
                values.append(session.intensity)

    return {
        activity_type: float(mean(values)) if values else None
        for activity_type, values in intensities.items()
    }


def sessions_activity_volume(sessions: list[SessionInput],) -> dict[str, dict[str, Decimal]]:
    totals: dict[str, dict[str, Decimal]] = {}

    for session in sessions:
        if session.session_at is None:
            continue

        for activity in session.activities:
            for unit_slug, value in activity.measurements.items():
                if value is None:
                    continue

                by_unit = totals.setdefault(activity.activity_type, {})
                by_unit[unit_slug] = by_unit.get(unit_slug, Decimal("0")) + value

    return totals


def session_summary(sessions: list[SessionInput]) -> SessionSummary:
    """Sessions summary; no unscheduled sessions.

    Empty measurements are zeros.
    Average intensity for empty set is Null.
    """
    scheduled_sessions = [session for session in sessions if session.session_at is not None]
    activity_count = sessions_activities(scheduled_sessions)
    activity_intensity = sessions_activity_intensity(scheduled_sessions)
    activity_volume = sessions_activity_volume(scheduled_sessions)

    by_activity_type = {}
    for activity_type, count in activity_count.items():
        distance = activity_volume.get(activity_type, {}).get("distance_km")
        by_activity_type[activity_type] = {
            "session_count": count,
            "average_intensity": activity_intensity[activity_type],
            "total_distance_km": float(distance) if distance is not None else None,
    }

    return {
        "session_count": len(scheduled_sessions),
        "total_duration_min": float(total_measurement(scheduled_sessions, "duration_min")),
        "total_distance_km": float(total_measurement(scheduled_sessions, "distance_km")),
        "average_intensity": sessions_intensity(scheduled_sessions),
        "by_activity_type": by_activity_type
    }