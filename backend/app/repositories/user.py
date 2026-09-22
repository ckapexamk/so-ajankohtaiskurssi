from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.user import User


def find_by_email(db: Session, email: str) -> User | None:
    return db.execute(
        select(User).where(User.email == email)
    ).scalar_one_or_none()

def create_user(
        db: Session,
        email: str,
        password_hash: str,
        display_name: str,
    ) -> User:

    user = User(
        email=email,
        password_hash=password_hash,
        display_name=display_name,
    )
    db.add(user)
    db.flush()
    return user