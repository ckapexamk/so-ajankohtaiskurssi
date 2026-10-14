from datetime import datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.schemas.session import SessionCreate, SessionUpdate
from app.models.workout_session_items import WorkoutSessionItem
from app.models.workout_session_measurements import WorkoutSessionMeasurements
from app.models.workout_sessions import WorkoutSession
from app.models.activity_type_unit_type import ActivityTypeUnitType
from app.repositories.session import ( 
    create_workout, update_workout, delete_workout,
    find_workouts, find_workout, find_owned_plan,
)

class SessionNotFoundError(Exception):
    pass

class PlanNotFoundError(Exception):
    pass

class MeasurementError(Exception):
    pass


def validate_measurements(db, items):
    for item in items:
        for measurement in item.measurements:
            link = db.scalar(
                select(ActivityTypeUnitType).where(
                    ActivityTypeUnitType.activity_type_id == item.activity_type_id,
                    ActivityTypeUnitType.unit_type_id == measurement.unit_type_id,
                )
            )

            if link is None:
                raise MeasurementError("Activity type and unit type are not linked.")

            if link.per_set and measurement.set_index is None:
                raise MeasurementError("A set index is required for per-set measurements")


def find_user_workouts(
    db: Session,
    user_id: UUID,
    from_: datetime | None = None,
    to: datetime | None = None,
    status: str | None = None,
    activity_type_id: UUID | None = None,
    unscheduled: bool | None = None,
    plan_id: UUID | None = None,
) -> list[WorkoutSession]:

    return find_workouts(
        db,
        user_id,
        from_,
        to,
        status,
        activity_type_id,
        unscheduled,
        plan_id,
    )


def find_user_workout(db: Session, session_id: UUID, user_id: UUID) -> WorkoutSession:
    session = find_workout(db, session_id, user_id)
    if session is None:
        raise SessionNotFoundError()
    return session


def create_workout_session(db: Session, user_id: UUID, session_data: SessionCreate) -> WorkoutSession:
    validate_measurements(db, session_data.items)

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
    
    if "items" in patch.model_fields_set:
        validate_measurements(db, patch.items)
    
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


def clone_workout_session(db, session_id, user_id, data):
    source = find_workout(db, session_id, user_id)

    if source is None:
        raise SessionNotFoundError()

    if data.plan_id is not None:
        plan = find_owned_plan(db, data.plan_id, user_id)
        if plan is None:
            raise PlanNotFoundError()

    new_items = [
        WorkoutSessionItem(
            activity_type_id=item.activity_type_id,
            sort_order=item.sort_order,
            notes=item.notes,
            measurements=[
                WorkoutSessionMeasurements(
                    unit_type_id=measurement.unit_type_id,
                    planned_value=measurement.planned_value,
                    actual_value=None,
                    set_index=measurement.set_index,
                )
                for measurement in item.measurements
            ],
        )
        for item in source.items
    ]

    clone = WorkoutSession(
        user_id=user_id,
        name=(data.name if data.name is not None
            else source.name
        ),
        session_at=(data.session_at if data.session_at is not None
            else source.session_at
        ),
        plan_id=data.plan_id,
        source_session_id=source.id,
        items=new_items,
    )

    db.add(clone)
    db.commit()
    return clone


def delete_workout_session(db: Session, session_id: UUID, user_id: UUID) -> None:
    deleted = delete_workout(
        db=db,
        session_id=session_id,
        user_id=user_id
    )
    if not deleted:
        raise SessionNotFoundError()

    db.commit()
