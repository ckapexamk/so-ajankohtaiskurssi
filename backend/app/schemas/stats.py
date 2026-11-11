"""Response schemas for /api/stats"""

from typing import Literal

from pydantic import BaseModel


ProgressMetric = Literal["sessions", "duration_min", "distance_km"]
ProgressGranularity = Literal["week", "month"]


class ActivityTypeSummary(BaseModel):
    session_count: int


class StatsSummary(BaseModel):
    session_count: int
    total_duration_min: float
    total_distance_km: float
    average_intensity: float | None
    by_activity_type: dict[str, ActivityTypeSummary]


class StatsPeriod(BaseModel):
    period_label: str
    value: int | float
