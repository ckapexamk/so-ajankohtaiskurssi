from uuid import UUID, uuid4

from sqlalchemy import Boolean, String, text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UnitType(Base):
    __tablename__ = "unit_types"

    id: Mapped[UUID] = mapped_column(
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True,)
    unit_label: Mapped[str | None] = mapped_column(String(30), nullable=True,)
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False,
        server_default=text("false"),
    )

    activity_link: Mapped[list["ActivityTypeUnitType"]] = relationship(
        back_populates="unit_type",
    )

    def __str__(self) -> str:
        return self.name