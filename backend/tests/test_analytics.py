"""Pure analytics tests.

Run from backend/: python -m pytest tests/test_analytics.py
"""

from datetime import date, datetime
from decimal import Decimal

import pytest

from app.services import analytics
from app.services.analytics import (
    ActivityInput,
    SessionInput,
    session_summary,
    sessions_series,
    sessions_streaks,
)


@pytest.fixture
def test_sessions() -> list[SessionInput]:
    """Scheduled sessions and a unscheduled session."""
    return [
        SessionInput(
            session_at=datetime(2026, 1, 5, 9),
            intensity=6,
            activities=(
                ActivityInput(
                    "running",
                    {
                        "duration_min": Decimal("30"),
                        "distance_km": Decimal("5.2"),
                    },
                ),
                # Separate entries represent actual strength set measurements.
                ActivityInput(
                    "bench_press",
                    {"reps": Decimal("8"), "weight_kg": Decimal("40")},
                ),
                ActivityInput(
                    "bench_press",
                    {"reps": Decimal("6"), "weight_kg": Decimal("45")},
                ),
            ),
        ),
        SessionInput(
            session_at=datetime(2026, 1, 11, 10),
            intensity=8,
            activities=(
                ActivityInput(
                    "running",
                    {
                        "duration_min": Decimal("45"),
                        "distance_km": Decimal("7.3"),
                    },
                ),
            ),
        ),
        SessionInput(
            session_at=datetime(2026, 1, 12, 8),
            intensity=None,
            activities=(
                ActivityInput(
                    "cycling",
                    {
                        "duration_min": Decimal("20"),
                        "distance_km": Decimal("10"),
                    },
                ),
            ),
        ),
        SessionInput(
            session_at=datetime(2026, 1, 19, 12),
            intensity=4,
            activities=(
                ActivityInput(
                    "running",
                    {
                        "duration_min": Decimal("15"),
                        "distance_km": Decimal("2"),
                    },
                ),
            ),
        ),
        SessionInput(
            session_at=None,
            intensity=10,
            activities=(
                ActivityInput(
                    "running",
                    {
                        "duration_min": Decimal("99"),
                        "distance_km": Decimal("99"),
                    },
                ),
            ),
        ),
    ]


def test_session_summary(
    test_sessions: list[SessionInput],
) -> None:
    assert session_summary(test_sessions) == {
        "session_count": 4,
        "total_duration_min": 110.0,
        "total_distance_km": 24.5,
        "average_intensity": 6.0,
        "by_activity_type": {
            "running": {"session_count": 3},
            "bench_press": {"session_count": 1},
            "cycling": {"session_count": 1},
        },
    }


def test_weekly_series(
    test_sessions: list[SessionInput],
) -> None:
    assert sessions_series(
        test_sessions,
        metric="session_count",
        granularity="week",
    ) == [
        {"period_label": "2026-W02", "value": 2},
        {"period_label": "2026-W03", "value": 1},
        {"period_label": "2026-W04", "value": 1},
    ]

    assert sessions_series(
        test_sessions,
        metric="duration_min",
        granularity="week",
        activity_type="running",
    ) == [
        {"period_label": "2026-W02", "value": 75.0},
        {"period_label": "2026-W04", "value": 15.0},
    ]


def test_monthly_series(
    test_sessions: list[SessionInput],
) -> None:
    assert sessions_series(
        test_sessions,
        metric="distance_km",
        granularity="month",
    ) == [{"period_label": "2026-01", "value": 24.5}]


def test_sessions_streaks(
    test_sessions: list[SessionInput],
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FrozenDate(date):
        @classmethod
        def today(cls) -> "FrozenDate":
            return cls(2026, 1, 20)

    monkeypatch.setattr(analytics, "date", FrozenDate)

    # Active ISO weeks 2, 3, and 4; current week is week 4.
    assert sessions_streaks(test_sessions) == {"current": 3, "longest": 3}


def test_streaks_sparse_history(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FrozenDate(date):
        @classmethod
        def today(cls) -> "FrozenDate":
            return cls(2026, 1, 20)

    monkeypatch.setattr(analytics, "date", FrozenDate)
    sparse_sessions = [
        SessionInput(datetime(2026, 1, 5, 9), 5, ()),
        SessionInput(datetime(2026, 1, 19, 9), 5, ()),
    ]

    assert sessions_streaks(sparse_sessions) == {"current": 1, "longest": 1}


def test_empty_input(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    class FrozenDate(date):
        @classmethod
        def today(cls) -> "FrozenDate":
            return cls(2026, 1, 20)

    monkeypatch.setattr(analytics, "date", FrozenDate)

    assert session_summary([]) == {
        "session_count": 0,
        "total_duration_min": 0.0,
        "total_distance_km": 0.0,
        "average_intensity": None,
        "by_activity_type": {},
    }
    assert sessions_series([], metric="session_count", granularity="week") == []
    assert sessions_streaks([]) == {"current": 0, "longest": 0}