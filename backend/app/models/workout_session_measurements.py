from uuid import UUID, uuid4
from decimal import Decimal

from sqlalchemy import (
    ForeignKey,
    Uuid,
    Numeric,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class WorkoutSessionMeasurements(Base):
    __tablename__ = "workout_session_measurements"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4
    )

    session_item_id: Mapped[UUID] = mapped_column(
        ForeignKey("workout_session_items.id", ondelete="CASCADE"),
        nullable=False,
    )

    unit_type_id: Mapped[UUID] = mapped_column(
        ForeignKey("unit_types.id", ondelete="CASCADE"),
        nullable=False,
    )

    planned_value: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    actual_value: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    set_index: Mapped[int | None] = mapped_column(nullable=True)
