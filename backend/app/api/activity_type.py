from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.activity_type import ActivityTypeCreate, ActivityTypeRead
from app.services.activity_type import (
    DuplicateActivityTypeError,
    create_custom_activity_type,
    list_activity_types,
)

router = APIRouter(
    prefix="/activity-types",
    tags=["activity-type"],
)


@router.get("", response_model=list[ActivityTypeRead])
def get_activity_types(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_activity_types(db, current_user.id)


@router.post("", response_model=ActivityTypeRead, status_code=201)
def post_custom_activity(
    payload: ActivityTypeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_custom_activity_type(
            db=db,
            user_id=current_user.id,
            data=payload,
        )
    except DuplicateActivityTypeError as exc:
        raise HTTPException(
            status_code=409,
            detail="Activity type already exists",
        ) from exc