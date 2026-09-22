from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.auth import UserCreate, UserPublic
from app.services.auth import DuplicateEmailError, register_user
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