from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity_type_unit_type import ActivityTypeUnitType
from app.models.unit_type import UnitType


def find_by_slug(db: Session, slug: str) -> UnitType | None:

    return db.execute(select(UnitType)
        .where( UnitType.slug == slug )
        
    ).scalar_one_or_none()


def create_link_if_missing(db: Session, activity_type_id: UUID, unit_type_id: UUID) -> ActivityTypeUnitType:

    existing = db.scalar(
        select(ActivityTypeUnitType)
        .where(
            ActivityTypeUnitType.activity_type_id == activity_type_id,
            ActivityTypeUnitType.unit_type_id == unit_type_id,
        )
    )

    if existing:
        return existing

    link = ActivityTypeUnitType( activity_type_id=activity_type_id, unit_type_id=unit_type_id )
    
    db.add(link)
    db.flush()
    return link