"""Response schemas for /api/stats"""

from pydantic import BaseModel


class ActivityTypeSummary(BaseModel):
    session_count: int


class StatsSummary(BaseModel):
    session_count: int
    total_duration_min: float
    total_distance_km: float
    average_intensity: float | None
    by_activity_type: dict[str, ActivityTypeSummary]
