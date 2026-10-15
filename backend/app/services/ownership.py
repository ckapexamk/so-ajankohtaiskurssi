from uuid import UUID

from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.models.workout_plan import WorkoutPlan
from app.models.workout_sessions import WorkoutSession
from app.repositories.goal import find_goal
from app.repositories.session import find_user_plan, find_workout


class SessionNotFoundError(Exception):
    pass

class PlanNotFoundError(Exception):
    pass

class GoalNotFoundError(Exception):
    pass


def get_owned_workout(
    db: Session,
    session_id: UUID,
    user_id: UUID,
) -> WorkoutSession:
    session = find_workout(db, session_id, user_id)
    if session is None:
        raise SessionNotFoundError()
    return session


def get_owned_plan(
    db: Session,
    plan_id: UUID,
    user_id: UUID,
) -> WorkoutPlan:
    plan = find_user_plan(db, plan_id, user_id)
    if plan is None:
        raise PlanNotFoundError()
    return plan


def get_owned_goal(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
) -> Goal:
    goal = find_goal(db, goal_id, user_id)
    if goal is None:
        raise GoalNotFoundError()
    return goal
