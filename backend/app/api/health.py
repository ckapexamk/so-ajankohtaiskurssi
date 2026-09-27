from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.health import HealthResponse
from app.services.health import health_status
from app.services.health import db_status


router = APIRouter(
    tags=["health"]
)


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status=health_status())


@router.get("/health/db", response_model=HealthResponse)
def database_check(db: Session = Depends(get_db)) -> HealthResponse:
    health = db_status(db)

    if health == "not ok":
        raise HTTPException(
            status_code=503,
            detail="Database is not connected",
        )

    return HealthResponse(status=health)