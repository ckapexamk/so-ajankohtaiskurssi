from sqlalchemy.orm import Session

from app.repositories.unit_type import create_unit, create_link_if_missing
from app.repositories.activity_type import create_activity

# create_activity(db, name, slug), create_unit(db, name, slug, unit_label)
def seed(db: Session) -> None:

    duration = create_unit(db, "Duration", "duration_min", "min")
    distance = create_unit(db, "Distance", "distance_km", "km")
    reps = create_unit(db, "Repetitions", "reps", "reps")
    weight = create_unit(db, "Weight", "weight_kg", "kg")

    running = create_activity(db, "Running", "running")
    cycling = create_activity(db, "Cycling", "cycling")
    bench_press = create_activity(db, "Bench Press", "bench_press")
    barbell_curl = create_activity(db, "Barbell Curl", "barbell_curl")
    hammer_curl = create_activity(db, "Hammer Curl", "hammer_curl")
    incline_curl = create_activity(db, "Incline Curl", "incline_curl")
    face_pull = create_activity(db, "Face Pull", "face_pull")
    other = create_activity(db, "Other", "other")

    create_link_if_missing(db, other.id, duration.id)

    create_link_if_missing(db, running.id, duration.id, per_set=False)
    create_link_if_missing(db, running.id, distance.id, per_set=False)
    create_link_if_missing(db, cycling.id, duration.id, per_set=False)
    create_link_if_missing(db, cycling.id, distance.id, per_set=False)

    create_link_if_missing(db, bench_press.id, reps.id, per_set=True)
    create_link_if_missing(db, bench_press.id, weight.id, per_set=True)
    create_link_if_missing(db, barbell_curl.id, reps.id, per_set=True)
    create_link_if_missing(db, barbell_curl.id, weight.id, per_set=True)
    create_link_if_missing(db, hammer_curl.id, reps.id, per_set=True)
    create_link_if_missing(db, hammer_curl.id, weight.id, per_set=True)
    create_link_if_missing(db, incline_curl.id, reps.id, per_set=True)
    create_link_if_missing(db, incline_curl.id, weight.id, per_set=True)
    create_link_if_missing(db, face_pull.id, reps.id, per_set=True)
    create_link_if_missing(db, face_pull.id, weight.id, per_set=True)