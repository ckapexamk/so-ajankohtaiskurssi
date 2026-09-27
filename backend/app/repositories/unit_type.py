from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity_type_unit_type import ActivityTypeUnitType
from app.models.unit_type import UnitType


def find_by_slug(db: Session, slug: str) -> UnitType | None:
    return db.execute(select(UnitType)
        .where( UnitType.slug == slug )
    ).scalar_one_or_none()

def create_unit(
    db: Session,
    name: str,
    slug: str,
    unit_label: str | None = None,
) -> UnitType:
    unit = find_by_slug(db, slug)

    if unit:
        return unit

    unit = UnitType(
        name=name,
        slug=slug,
        unit_label=unit_label,
        is_system=True,
    )
    db.add(unit)
    db.flush()
    return unit

def create_link_if_missing(db: Session,
        activity_type_id: UUID,
        unit_type_id: UUID,
        *,
        sort_order: int = 0,
        is_required: bool = False,
        per_set: bool = False,
    ) -> ActivityTypeUnitType:

    existing = db.scalar(
        select(ActivityTypeUnitType)
        .where(
            ActivityTypeUnitType.activity_type_id == activity_type_id,
            ActivityTypeUnitType.unit_type_id == unit_type_id,
        )
    )

    if existing:
        return existing

    link = ActivityTypeUnitType(
        activity_type_id=activity_type_id,
        unit_type_id=unit_type_id,
        sort_order=sort_order,
        is_required=is_required,
        per_set=per_set,
    )

    db.add(link)
    db.flush()
    return link