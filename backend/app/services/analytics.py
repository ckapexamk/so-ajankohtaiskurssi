from collections.abc import Mapping
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal

""" Pure analytics inputs and functions only; no network Input/Output or "db.query(...)"
    Callers must pass already user-filtered lists. This module must not query the database.
"""


# a single activity
@dataclass(frozen=True)
class ActivityInput:
    """An activity in a session
    
    activity_type is a stable slug such as "running".
    measurements maps unit slugs, such as "duration_min", to values.
    """
    activity_type: str
    measurements: Mapping[str, Decimal]


# session data
@dataclass(frozen=True)
class SessionInput:
    """Session fields needed by analytics.

    session_at is None when the session is unscheduled.
    intensity is on a 1-10 scale, or None when not recorded.
    """
    session_at: datetime | None
    intensity: int | None 
    activities: tuple[ActivityInput, ...]

