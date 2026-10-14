from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.session import SessionCreate, SessionUpdate, SessionRead, SessionClone
from app.services.sessions import (
    SessionNotFoundError, PlanNotFoundError, MeasurementError,
    create_workout_session, update_workout_session, delete_workout_session,
    clone_workout_session, find_user_workout, find_user_workouts,
)

router = APIRouter(
    prefix="/sessions",
    tags=["sessions"],
)


@router.post("", response_model=SessionRead, status_code=201)
def post_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        return create_workout_session(
            db=db,
            user_id=current_user.id,
            session_data=payload,
        )
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Plan not found")
    except MeasurementError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.post("/{session_id}/clone", response_model=SessionRead, status_code=201)
def clone_session(
    session_id: UUID,
    payload: SessionClone,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        return clone_workout_session(
            db=db,
            session_id=session_id,
            user_id=current_user.id,
            data=payload or SessionClone(),
        )
    except SessionNotFoundError:
        raise HTTPException(status_code=404, detail="Session not found")
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Plan not found")
    except MeasurementError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("", response_model=list[SessionRead])
def list_sessions(
    from_: datetime | None = Query(None, alias="from"),
    to: datetime | None = None,
    status: str | None = None,
    activity_type_id: UUID | None = None,
    unscheduled: bool | None = None,
    plan_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if from_ is not None and to is not None and from_ > to:
        raise HTTPException(status_code=400, detail="Invalid date range")

    return find_user_workouts(
        db=db,
        user_id=current_user.id,
        from_=from_,
        to=to,
        status=status,
        activity_type_id=activity_type_id,
        unscheduled=unscheduled,
        plan_id=plan_id,
    )
    

@router.get("/{session_id}", response_model=SessionRead)
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        return find_user_workout(
            db=db,
            session_id=session_id,
            user_id=current_user.id,
        )
    except SessionNotFoundError:
        raise HTTPException(status_code=404, detail="Session not found")


@router.patch("/{session_id}", response_model=SessionRead, status_code=200)
def patch_session(
    session_id: UUID,
    payload: SessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        return update_workout_session(
            db=db,
            session_id=session_id,
            user_id=current_user.id,
            patch=payload,
        )
    except SessionNotFoundError:
        raise HTTPException(status_code=404, detail="Session not found")
    except PlanNotFoundError:
        raise HTTPException(status_code=404, detail="Plan not found")
    except MeasurementError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.delete("/{session_id}", status_code=204)
def delete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:    
        return delete_workout_session(
            db=db,
            session_id=session_id,
            user_id=current_user.id,
        )
    except SessionNotFoundError:
        raise HTTPException(status_code=404, detail="Session not found")