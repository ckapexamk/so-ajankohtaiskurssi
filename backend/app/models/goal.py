from datetime import datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Uuid,
    Numeric,
    String,
    DateTime,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

class Goal(Base):
    __tablename__ = "goals"

    id: Mapped[UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid4
    )
    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    unit_type_id: Mapped[UUID] = mapped_column(
        ForeignKey("unit_types.id", ondelete="CASCADE"),
        nullable=False,
    )

    target_value: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)

    period: Mapped[str] = mapped_column(String(10), nullable=False)

    activity_type_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("activity_types.id", ondelete="CASCADE"),
        nullable=True,
    )

    active: Mapped[bool] = mapped_column(nullable=False, default=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint(
            "period IN ('week', 'month')",
            name="ck_goals_period",
        ),
    )

    