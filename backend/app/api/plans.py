from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.session import PlanCreate, PlanRead, PlanUpdate, PlansRead
from app.services.ownership import PlanNotFoundError, SessionNotFoundError
from app.services.plans import (
    create_user_plan, get_user_plan, list_plans, update_user_plan,
    delete_user_plan, attach_session, detach_session,
)

router = APIRouter(
    prefix="/plans",
    tags=["plans"],
)


@router.post("/{plan_id}/sessions/{session_id}")
def attach(
    plan_id: UUID,
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return attach_session(
            db=db,
            plan_id=plan_id,
            session_id=session_id,
            user_id=current_user.id,
        )
    except SessionNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")


@router.delete("/{plan_id}/sessions/{session_id}", status_code=204)
def detach(
    plan_id: UUID,
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        detach_session(
            db=db,
            plan_id=plan_id,
            session_id=session_id,
            user_id=current_user.id,
        )
    except SessionNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")


@router.post("", response_model=PlansRead, status_code=201)
def post_plan(
    payload: PlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        return create_user_plan(
            db=db,
            user_id=current_user.id,
            plan_data=payload,
        )
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")


@router.get("", response_model=list[PlansRead])
def get_plans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        return list_plans(
            db=db,
            user_id=current_user.id,
        )
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")


@router.get("/{plan_id}", response_model=PlanRead)
def get_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        return get_user_plan(
            db=db,
            plan_id=plan_id,
            user_id=current_user.id,
        )
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")


@router.patch("/{plan_id}", response_model=PlansRead)
def patch_plan(
    plan_id: UUID,
    payload: PlanUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if "name" in payload.model_fields_set and (
        payload.name is None or not payload.name.strip()
    ):
        raise HTTPException(status_code=422, detail="Plan name cannot be empty")

    try:
        return update_user_plan(
            db=db,
            plan_id=plan_id,
            user_id=current_user.id,
            patch=payload,
        )
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")


@router.delete("/{plan_id}", status_code=204)
def delete_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        delete_user_plan(
            db=db,
            plan_id=plan_id,
            user_id=current_user.id,
        )
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Not found")