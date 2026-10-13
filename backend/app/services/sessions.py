from uuid import UUID

from sqlalchemy.orm import Session

from app.schemas.session import SessionCreate, SessionUpdate
from app.models.workout_sessions import WorkoutSession
from app.repositories.session import ( 
    create_workout, update_workout, delete_workout,
    find_workouts, find_workout, find_owned_plan,
)

class SessionNotFoundError(Exception):
    pass

class PlanNotFoundError(Exception):
    pass


def find_user_workouts(db: Session, user_id: UUID) -> list[WorkoutSession]:
    return find_workouts(db, user_id)


def find_user_workout(db: Session, session_id: UUID, user_id: UUID) -> WorkoutSession:
    session = find_workout(db, session_id, user_id)
    if session is None:
        raise SessionNotFoundError()
    return session


def create_workout_session(db: Session, user_id: UUID, session_data: SessionCreate) -> WorkoutSession:
    if session_data.plan_id is not None:
        plan = find_owned_plan(db, session_data.plan_id, user_id)
        if plan is None:
            raise PlanNotFoundError()
        
    session = create_workout(
        db=db,
        user_id=user_id,
        data=session_data
    )
 
    db.commit()
    return session


def update_workout_session(db: Session, session_id: UUID, user_id: UUID, patch: SessionUpdate) -> WorkoutSession:
    if "plan_id" in patch.model_fields_set and patch.plan_id is not None:
        plan = find_owned_plan(db, patch.plan_id, user_id)
        if plan is None:
            raise PlanNotFoundError()
    
    session = update_workout(
        db=db,
        session_id=session_id,
        user_id=user_id,
        patch=patch
    )
    if session is None:
        raise SessionNotFoundError()
    
    db.commit()
    return session


def delete_workout_session(db: Session, session_id: UUID, user_id: UUID) -> None:
    deleted = delete_workout(
        db=db,
        session_id=session_id,
        user_id=user_id
    )
    if not deleted:
        raise SessionNotFoundError()

    db.commit()
