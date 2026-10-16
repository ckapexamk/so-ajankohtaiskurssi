from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.workout_sessions import WorkoutSession
from app.models.workout_session_items import WorkoutSessionItem
from app.models.workout_session_measurements import WorkoutSessionMeasurements
from app.models.workout_plan import WorkoutPlan
from app.schemas.session import PlanCreate, SessionCreate, SessionUpdate, ItemCreate


def build_items(items_data: list[ItemCreate]) -> list[WorkoutSessionItem]:
    return [
        WorkoutSessionItem(
            activity_type_id=item.activity_type_id,
            sort_order=item.sort_order,
            notes=item.notes,
            measurements=[
                WorkoutSessionMeasurements(**measurement.model_dump())
                for measurement in item.measurements
            ],
        )
        for item in items_data
    ]


def create_plan(
    db: Session,
    user_id: UUID,
    data: PlanCreate,
) -> WorkoutPlan:
    plan = WorkoutPlan(
        user_id=user_id,
        name=data.name,
        notes=data.notes,
        start_date=data.start_date,
        length_weeks=data.length_weeks,
    )
    db.add(plan)
    db.flush()
    return plan


def find_user_plans(
    db: Session,
    user_id: UUID,
) -> list[WorkoutPlan]:
    statement = (
        select(WorkoutPlan)
        .where(WorkoutPlan.user_id == user_id)
        .order_by(WorkoutPlan.name)
    )
    return list(db.scalars(statement).all())


def find_user_plan(
    db: Session,
    plan_id: UUID,
    user_id: UUID,
) -> WorkoutPlan | None:
    statement = (
        select(WorkoutPlan)
        .options(selectinload(WorkoutPlan.sessions))
        .where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == user_id,
        )
    )
    return db.scalar(statement)


#List/Find
def find_workouts(
    db: Session,
    user_id: UUID,
    from_: datetime | None = None,
    to: datetime | None = None,
    status: str | None = None,
    activity_type_id: UUID | None = None,
    unscheduled: bool | None = None,
    plan_id: UUID | None = None,
) -> list[WorkoutSession]:
    statement = (
        select(WorkoutSession)
            .options(
                selectinload(WorkoutSession.items)
                .selectinload(WorkoutSessionItem.measurements)
            )
            .where(WorkoutSession.user_id == user_id)
            .order_by(WorkoutSession.session_at.asc().nulls_last())
    )

    if from_ is not None:
        statement = statement.where(WorkoutSession.session_at >= from_)

    if to is not None:
        statement = statement.where(WorkoutSession.session_at <= to)

    if status is not None:
        statement = statement.where(WorkoutSession.status == status)

    if activity_type_id is not None:
        statement = statement.where(WorkoutSession.items.any(
            WorkoutSessionItem.activity_type_id == activity_type_id
        ))

    if unscheduled is True:
        statement = statement.where(WorkoutSession.session_at.is_(None))
    elif unscheduled is False:
        statement = statement.where(WorkoutSession.session_at.is_not(None))
    
    if plan_id is not None:
        statement = statement.where(WorkoutSession.plan_id == plan_id)

    return list(db.scalars(statement).all())


def find_workout(
    db: Session,
    session_id: UUID,
    user_id: UUID,
) -> WorkoutSession | None:
    statement = (
        select(WorkoutSession)
        .options(
            selectinload(WorkoutSession.items).selectinload(
                WorkoutSessionItem.measurements
            )
        )
        .where(
            WorkoutSession.id == session_id,
            WorkoutSession.user_id == user_id,
        )
    )
    return db.scalar(statement)


#Create
def create_workout(
    db: Session,
    user_id: UUID,
    data: SessionCreate,
) -> WorkoutSession:
    workout = WorkoutSession(
        user_id=user_id,
        name=data.name,
        session_at=data.session_at,
        status=data.status,
        notes=data.notes,
        intensity=data.intensity,
        plan_id=data.plan_id,
        items=build_items(data.items),
    )

    db.add(workout)
    db.flush()
    return workout

#Update
def update_workout(
    db: Session,
    workout: WorkoutSession,
    patch: SessionUpdate,
) -> WorkoutSession:
  
    changes = patch.model_dump(exclude_unset=True)
    items_data = changes.pop("items", None)

    for field, value in changes.items():
        setattr(workout, field, value)

    if items_data is not None:
        workout.items = build_items(items_data)

    db.flush()
    return workout


#Delete
def delete_workout(
    db: Session,
    workout: WorkoutSession,
) -> None:
    db.delete(workout)
    db.flush()

# Calendar
def find_calendar_sessions(db, user_id, from_, to, plan_id=None):
    statement = select(WorkoutSession).where(
        WorkoutSession.user_id == user_id,
        WorkoutSession.session_at.is_not(None),
        WorkoutSession.session_at >= from_,
        WorkoutSession.session_at <= to,
    )

    if plan_id is not None:
        statement = statement.where(WorkoutSession.plan_id == plan_id)

    statement = statement.order_by(WorkoutSession.session_at.asc())
    return list(db.scalars(statement).all())