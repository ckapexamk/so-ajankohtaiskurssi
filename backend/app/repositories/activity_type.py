from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity_type import ActivityType


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