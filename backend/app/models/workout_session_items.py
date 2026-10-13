from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.workout_sessions import WorkoutSession
    from app.models.workout_session_measurements import WorkoutSessionMeasurements

from uuid import UUID, uuid4

from sqlalchemy import (
    ForeignKey,
    Uuid,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class WorkoutSessionItem(Base):
    __tablename__ = "workout_session_items"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4
    )

    session_id: Mapped[UUID] = mapped_column(
        ForeignKey("workout_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )

    activity_type_id: Mapped[UUID] = mapped_column(
        ForeignKey("activity_types.id", ondelete="CASCADE"),
        nullable=False,
    )

    sort_order: Mapped[int] = mapped_column(nullable=False, default=0)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    session: Mapped["WorkoutSession"] = relationship(back_populates="items")

    measurements: Mapped[list["WorkoutSessionMeasurements"]] = relationship(
        back_populates="session_item",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    