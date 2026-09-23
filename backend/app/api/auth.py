from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.auth import UserCreate, UserPublic
from app.services.auth import (
    LoginRequest, TokenResponse,
    DuplicateEmailError, LoginError,
    register_user, login_user
)
from app.db.session import get_db


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/register", response_model=UserPublic, status_code=201)
def register(
    data: UserCreate,
    db: Session = Depends(get_db),
) -> UserPublic:
    try:
        return register_user(db, data)
    except DuplicateEmailError:
        raise HTTPException(
            status_code=400,
            detail="Email already exists",
        )

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    try:
        return login_user(db, data)
    except LoginError:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

@router.get("/me", response_model=UserPublic)
def me(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user