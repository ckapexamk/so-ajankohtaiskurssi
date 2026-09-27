from uuid import UUID, uuid4
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.activity_type_unit_type import ActivityTypeUnitType


class ActivityType(Base):
    __tablename__ = "activity_types"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    slug: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    is_system: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=text("false"),
    )

    user_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
    )

    unit_link: Mapped[list["ActivityTypeUnitType"]] = relationship(
        back_populates="activity_type",
        cascade="all, delete-orphan",
    )

    __table_args__ = (

        # slug format: lowercase & url-friendly
        CheckConstraint(
            "slug ~ '^[a-z0-9]+([_-][a-z0-9]+)*$'",
            name="ck_activity_type_slug_format",
        ),

        # system has no user_id
        CheckConstraint(
            """
            (is_system = TRUE AND user_id IS NULL)
            OR
            (is_system = FALSE AND user_id IS NOT NULL)
            """,
            name="ck_activity_type_system",
        ),

        # system slugs are globally unique
        Index("uq_activity_type_slug", "slug",
            unique=True,
            postgresql_where=text("is_system = TRUE"),
        ),

        # custom slugs are unique for the user
        Index("uq_activity_type_user_slug", "user_id", "slug",
            unique=True,
            postgresql_where=text("is_system = FALSE"),
        ),
    )

    def __str__(self) -> str:
        return self.name