from sqlalchemy.orm import Session

from app.repositories.health import check_db


def health_status() -> str:
    return "ok"


def db_status(db: Session) -> str:
    if check_db(db):
        return "ok"

    return "not ok"