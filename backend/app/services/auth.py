from sqlalchemy.orm import Session

from app.schemas.auth import UserCreate
from app.models.user import User
from app.repositories.user import find_by_email, create_user
from app.core.security import hash_password, verify_password, validate_password


class DuplicateEmailError(Exception):
    pass

def register_user(db: Session, user_data: UserCreate) -> User:
        
    email_exists = find_by_email(db, user_data.email)

    if email_exists:
        raise DuplicateEmailError()

    password_hash = hash_password(user_data.password)

    user = create_user(
        db=db,
        email=user_data.email,
        password_hash=password_hash,
        display_name=user_data.display_name,
    )

    db.commit()

    return user
