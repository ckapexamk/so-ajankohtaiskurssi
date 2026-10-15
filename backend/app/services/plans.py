from uuid import UUID

from sqlalchemy.orm import Session

from app.models.workout_plan import WorkoutPlan
from app.models.workout_sessions import WorkoutSession
from app.schemas.session import PlanCreate
from app.repositories.session import (
    create_plan,
    find_user_plans,
)
from app.services.ownership import (
    SessionNotFoundError,
    get_owned_plan,
    get_owned_workout,
)


def attach_session(
    db: Session,
    plan_id: UUID,
    session_id: UUID,
    user_id: UUID,
) -> WorkoutSession:
    plan = get_owned_plan(db, plan_id, user_id)
    session = get_owned_workout(db, session_id, user_id)

    session.plan_id = plan.id
    db.commit()
    return session


def detach_session(
    db: Session,
    plan_id: UUID,
    session_id: UUID,
    user_id: UUID,
) -> WorkoutSession:
    plan = get_owned_plan(db, plan_id, user_id)
    session = get_owned_workout(db, session_id, user_id)
    if session.plan_id != plan.id:
        raise SessionNotFoundError()

    session.plan_id = None
    db.commit()
    return session


def create_user_plan(
    db: Session,
    user_id: UUID,
    plan_data: PlanCreate,
) -> WorkoutPlan:
    plan = create_plan(db=db, user_id=user_id, data=plan_data)
    db.commit()
    return plan


def list_plans(db: Session, user_id: UUID) -> list[WorkoutPlan]:
    return find_user_plans(db, user_id)


def get_user_plan(
    db: Session,
    plan_id: UUID,
    user_id: UUID,
) -> WorkoutPlan:
    return get_owned_plan(db, plan_id, user_id)


def delete_user_plan(
    db: Session,
    plan_id: UUID,
    user_id: UUID,
) -> None:
    plan = get_owned_plan(db, plan_id, user_id)
    db.delete(plan)
    db.commit()
