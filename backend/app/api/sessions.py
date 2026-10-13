from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.session import SessionCreate, SessionUpdate, SessionRead
from app.services.sessions import (
    SessionNotFoundError, PlanNotFoundError, find_user_workout, find_user_workouts,
    create_workout_session, update_workout_session, delete_workout_session
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


@router.get("", response_model=list[SessionRead])
def list_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return find_user_workouts(
        db=db,
        user_id=current_user.id,
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