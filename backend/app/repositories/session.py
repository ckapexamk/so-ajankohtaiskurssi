from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.workout_sessions import WorkoutSession
from app.models.workout_session_items import WorkoutSessionItem
from app.models.workout_session_measurements import WorkoutSessionMeasurements
from app.models.workout_plan import WorkoutPlan
from app.schemas.session import SessionCreate, SessionUpdate, ItemCreate


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


def find_owned_plan(
    db: Session,
    plan_id: UUID,
    user_id: UUID,
) -> WorkoutPlan | None:
    return db.scalar(
        select(WorkoutPlan).where(
            WorkoutPlan.id == plan_id,
            WorkoutPlan.user_id == user_id,
        )
    )


#List/Find
def find_workouts(
    db: Session,
    user_id: UUID,
) -> list[WorkoutSession]:
    statement = (
        select(WorkoutSession)
        .options(
            selectinload(WorkoutSession.items).selectinload(
                WorkoutSessionItem.measurements
            )
        )
        .where(WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.session_at.asc().nulls_last())
    )
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
    session_id: UUID,
    user_id: UUID,
    patch: SessionUpdate,
) -> WorkoutSession | None:
    workout = db.scalar(
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
    if workout is None:
        return None
  
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
    session_id: UUID,
    user_id: UUID,
) -> bool:
    workout = db.scalar(
        select(WorkoutSession).where(
            WorkoutSession.id == session_id,
            WorkoutSession.user_id == user_id,
        )
    )
    if workout is None:
        return False

    db.delete(workout)
    db.flush()
    return True

