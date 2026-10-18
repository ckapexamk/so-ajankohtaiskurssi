from uuid import UUID

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.activity_type import ActivityType
from app.repositories.activity_type import (
    create_custom_activity as create_custom_activity_record,
    list_visible_activity_types,
)
from app.schemas.activity_type import ActivityTypeCreate


class DuplicateActivityTypeError(Exception):
    pass


def list_activity_types(db: Session, user_id: UUID) -> list[ActivityType]:
    return list_visible_activity_types(db, user_id)


def create_custom_activity_type(
    db: Session,
    user_id: UUID,
    data: ActivityTypeCreate,
) -> ActivityType:
    try:
        activity_type = create_custom_activity_record(db, user_id, data)
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise DuplicateActivityTypeError() from exc

    return activity_type
