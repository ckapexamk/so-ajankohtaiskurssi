from uuid import UUID

from sqlalchemy.orm import Session

from app.models.workout_plan import WorkoutPlan
from app.models.workout_sessions import WorkoutSession
from app.schemas.session import PlanCreate
from app.repositories.session import (
    create_plan,
    delete_plan,
    find_owned_plan,
    find_user_plan,
    find_user_plans,
    find_workout,
)


class PlanNotFoundError(Exception):
    pass

class SessionNotFoundError(Exception):
    pass


def attach_session(
    db: Session,
    plan_id: UUID,
    session_id: UUID,
    user_id: UUID,
) -> WorkoutSession:
    plan = find_owned_plan(db, plan_id, user_id)
    session = find_workout(db, session_id, user_id)

    if plan is None:
        raise PlanNotFoundError()
    if session is None:
        raise SessionNotFoundError()

    session.plan_id = plan.id
    db.commit()
    return session


def detach_session(
    db: Session,
    plan_id: UUID,
    session_id: UUID,
    user_id: UUID,
) -> WorkoutSession:
    plan = find_owned_plan(db, plan_id, user_id)
    session = find_workout(db, session_id, user_id)

    if plan is None:
        raise PlanNotFoundError()
    if session is None or session.plan_id != plan.id:
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
    plan = find_user_plan(db, plan_id, user_id)
    if plan is None:
        raise PlanNotFoundError()
    return plan


def delete_user_plan(
    db: Session,
    plan_id: UUID,
    user_id: UUID,
) -> None:
    deleted = delete_plan(
        db=db,
        plan_id=plan_id,
        user_id=user_id
    )
    if not deleted:
        raise PlanNotFoundError()

    db.commit()
