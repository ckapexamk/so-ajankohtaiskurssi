from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4)
    
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    session_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="planned",
    )
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    intensity: Mapped[int | None] = mapped_column(nullable=True)

    # Deferred migration until ticket 3
    plan_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("workout_plans.id", ondelete="SET NULL"),
        nullable=True,
    )

    source_session_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("workout_sessions.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "status IN ('planned', 'in_progress', 'completed')",
            name="ck_workout_sessions_status",
        ),
        CheckConstraint(
            "intensity IS NULL OR intensity BETWEEN 1 AND 10",
            name="ck_workout_sessions_intensity",
        ),
        Index("ix_workout_sessions_user_session_at", "user_id", "session_at"),
    )