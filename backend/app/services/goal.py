from uuid import UUID

from sqlalchemy.orm import Session

from app.models.unit_type import UnitType
from app.models.goal import Goal
from app.repositories.goal import create_goal, update_goal, find_goal, find_goals, delete_goal
from app.schemas.goal import GoalCreate, GoalUpdate


class GoalNotFoundError(Exception):
    pass


class UnitTypeNotFoundError(Exception):
    pass


def validate_unit_type(db: Session, unit_type_id: UUID) -> None:
    unit = db.get(UnitType, unit_type_id)

    if unit is None:
        raise UnitTypeNotFoundError()


def list_user_goals(
    db: Session,
    user_id: UUID,
    active: bool | None = None,
) -> list[Goal]:
    return find_goals(db, user_id, active)


def get_user_goal(db: Session, goal_id: UUID, user_id: UUID) -> Goal:
    goal = find_goal(db, goal_id, user_id)
    if goal is None:
        raise GoalNotFoundError()
    return goal


def create_user_goal(
    db: Session,
    user_id: UUID,
    data: GoalCreate,
) -> Goal:
    validate_unit_type(db, data.unit_type_id)

    goal = create_goal(db, user_id, data)
    db.commit()
    return goal


def update_user_goal(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
    patch: GoalUpdate,
) -> Goal:
    changes = patch.model_dump(exclude_unset=True)

    existing_goal = find_goal(db, goal_id, user_id)
    if existing_goal is None:
        raise GoalNotFoundError()

    if "unit_type_id" in changes:
        validate_unit_type(db, changes["unit_type_id"])

    goal = update_goal(db, goal_id, user_id, changes)
    if goal is None:
        raise GoalNotFoundError()

    db.commit()
    return goal


def delete_user_goal(db: Session, goal_id: UUID, user_id: UUID) -> None:
    deleted = delete_goal(db, goal_id, user_id)
    if not deleted:
        raise GoalNotFoundError()
    db.commit()