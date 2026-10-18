from uuid import UUID

from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.models.activity_type import ActivityType
from app.models.activity_type_unit_type import ActivityTypeUnitType
from app.schemas.activity_type import ActivityTypeCreate


def find_by_slug(db: Session, slug: str) -> ActivityType | None:
    return db.execute(
        select(ActivityType).where(ActivityType.slug == slug)
    ).scalar_one_or_none()


def create_activity(
    db: Session,
    name: str,
    slug: str,
) -> ActivityType:
    activity = find_by_slug(db, slug)

    if activity:
        return activity

    activity = ActivityType(
        name=name,
        slug=slug,
        is_system=True,
    )
    db.add(activity)
    db.flush()
    return activity


def create_custom_activity(
    db: Session,
    user_id: UUID,
    data: ActivityTypeCreate,
) -> ActivityType:
    activity_type = ActivityType(
        name=data.name,
        slug=data.slug,
        is_system=False,
        user_id=user_id,
    )
    db.add(activity_type)
    db.flush()
    return activity_type


def list_visible_activity_types(
    db: Session,
    user_id: UUID,
) -> list[ActivityType]:
    statement = (
        select(ActivityType)
        .options(
            selectinload(ActivityType.unit_link)
            .selectinload(ActivityTypeUnitType.unit_type)
        )
        .where(
            or_(
                ActivityType.is_system.is_(True),
                ActivityType.user_id == user_id,
            )
        )
        .order_by(ActivityType.name)
    )
    return list(db.scalars(statement).all())