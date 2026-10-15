from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.goal import Goal
from app.schemas.goal import GoalCreate


def find_goals(
    db: Session,
    user_id: UUID,
    active: bool | None = None,
) -> list[Goal]:
    statement = select(Goal).where(Goal.user_id == user_id)

    if active is not None:
        statement = statement.where(Goal.active == active)

    return list(db.scalars(statement.order_by(Goal.created_at.desc())).all())


def find_goal(db: Session, goal_id: UUID, user_id: UUID) -> Goal | None:
    statement = select(Goal).where(
        Goal.id == goal_id,
        Goal.user_id == user_id,
    )
    return db.scalar(statement)


def create_goal(db: Session, user_id: UUID, data: GoalCreate) -> Goal:
    goal = Goal(
        user_id=user_id,
        unit_type_id=data.unit_type_id,
        target_value=data.target_value,
        period=data.period,
        activity_type_id=data.activity_type_id,
        active=data.active,
    )
    db.add(goal)
    db.flush()
    return goal


def update_goal(
    db: Session,
    goal_id: UUID,
    user_id: UUID,
    changes: dict,
) -> Goal | None:
    goal = find_goal(db, goal_id, user_id)
    if goal is None:
        return None

    for field, value in changes.items():
        setattr(goal, field, value)

    db.flush()
    return goal


def delete_goal(db: Session, goal_id: UUID, user_id: UUID) -> bool:
    goal = find_goal(db, goal_id, user_id)
    if goal is None:
        return False

    db.delete(goal)
    db.flush()
    return True