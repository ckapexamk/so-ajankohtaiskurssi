import jwt
from uuid import UUID
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.core.security import decode_access_token
from app.db.session import get_db


security = HTTPBearer()


def get_current_user( 
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
    except jwt.ExpiredSignatureError:
        raise error
    except jwt.InvalidTokenError:
        raise error

    user_id = payload.get("sub")

    if user_id is None:
        raise error

    try:
            user_id = UUID(user_id)
    except (ValueError, TypeError, AttributeError):
            raise error
    
    user = db.scalar(
        select(User).where(User.id == user_id)
    )

    if user is None:
        raise error

    return user