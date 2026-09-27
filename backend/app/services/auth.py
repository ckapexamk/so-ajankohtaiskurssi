from sqlalchemy.orm import Session

from app.schemas.auth import UserCreate, LoginRequest, TokenResponse
from app.models.user import User
from app.repositories.user import find_by_email, create_user
from app.core.security import hash_password, verify_password, create_access_token


class DuplicateEmailError(Exception):
    pass

class LoginError(Exception):
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


def login_user(db: Session, login_data: LoginRequest) -> TokenResponse:
    user = find_by_email(db, login_data.email)

    if user is None:
            raise LoginError()

    valid_password = verify_password(login_data.password, user.password_hash)

    if not valid_password:
        raise LoginError()

    access_token = create_access_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )