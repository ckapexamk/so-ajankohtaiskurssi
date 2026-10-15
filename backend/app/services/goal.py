from uuid import UUID

from sqlalchemy.orm import Session

from app.models.unit_type import UnitType
from app.models.goal import Goal
from app.repositories.goal import (
    create_goal,
    delete_goal,
    find_goals,
    update_goal,
)
from app.schemas.goal import GoalCreate, GoalUpdate
from app.services.ownership import get_owned_goal


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
    return get_owned_goal(db, goal_id, user_id)


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

    existing_goal = get_owned_goal(db, goal_id, user_id)

    if "unit_type_id" in changes:
        validate_unit_type(db, changes["unit_type_id"])

    goal = update_goal(db, existing_goal, changes)
    db.commit()
    return goal


def delete_user_goal(db: Session, goal_id: UUID, user_id: UUID) -> None:
    goal = get_owned_goal(db, goal_id, user_id)
    delete_goal(db, goal)
    db.commit()