from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.workout_sessions import WorkoutSession

from datetime import datetime
from datetime import date
from uuid import UUID, uuid4

from sqlalchemy import (
    Uuid,
    Date,
    DateTime,
    ForeignKey,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    start_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    length_weeks: Mapped[int | None] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    sessions: Mapped[list["WorkoutSession"]] = relationship(
        back_populates="plan",
        order_by="WorkoutSession.session_at.asc().nulls_last()",
    )