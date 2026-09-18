from uuid import UUID, uuid4
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, Integer, UniqueConstraint, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.activity_type import ActivityType
    from app.models.unit_type import UnitType


class ActivityTypeUnitType(Base):
    __tablename__ = "activity_type_unit_types"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    activity_type_id: Mapped[UUID] = mapped_column(
        ForeignKey("activity_types.id", ondelete="CASCADE"),
        nullable=False,
    )

    unit_type_id: Mapped[UUID] = mapped_column(
        ForeignKey("unit_types.id", ondelete="CASCADE"),
        nullable=False,      
    )
    
    sort_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default=text("0"),
    )

    is_required: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"), 
    )

    per_set: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False, 
        server_default=text("false"),
    )

    activity_type: Mapped["ActivityType"] = relationship(back_populates="unit_link",)
    unit_type: Mapped["UnitType"] = relationship(back_populates="activity_link",)

    __table_args__ = (
        UniqueConstraint("activity_type_id", "unit_type_id",
            name="uq_activity_type_unit_type",
        ),
    )