from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.goal import GoalCreate, GoalRead, GoalUpdate
from app.services.ownership import GoalNotFoundError
from app.services.goal import (
    UnitTypeNotFoundError,
    create_user_goal,
    delete_user_goal,
    get_user_goal,
    list_user_goals,
    update_user_goal,
)

router = APIRouter(
    prefix="/goal",
    tags=["goal"],
)


@router.get("", response_model=list[GoalRead])
def list_goals(
    active: bool | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return list_user_goals(db, current_user.id, active=active)


@router.post("", response_model=GoalRead, status_code=201)
def post_goal(
    payload: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return create_user_goal(db, current_user.id, payload)
    except UnitTypeNotFoundError as exc:
        raise HTTPException(status_code=422, detail="Invalid unit_type_id") from exc


@router.get("/{goal_id}", response_model=GoalRead)
def get_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return get_user_goal(db, goal_id, current_user.id)
    except GoalNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Not found") from exc


@router.patch("/{goal_id}", response_model=GoalRead)
def patch_goal(
    goal_id: UUID,
    payload: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return update_user_goal(db, goal_id, current_user.id, payload)
    except GoalNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Not found") from exc
    except UnitTypeNotFoundError as exc:
        raise HTTPException(status_code=422, detail="Invalid unit_type_id") from exc


@router.delete("/{goal_id}", status_code=204)
def remove_goal(
    goal_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        delete_user_goal(db, goal_id, current_user.id)
    except GoalNotFoundError as exc:
        raise HTTPException(status_code=404, detail="Not found") from exc
    return Response(status_code=204)