from uuid import UUID, uuid4

from sqlalchemy import (
    ForeignKey,
    Uuid,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column

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

    