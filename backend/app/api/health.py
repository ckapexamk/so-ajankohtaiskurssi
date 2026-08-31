from fastapi import APIRouter

from app.schemas.health import HealthResponse
from app.services.health import health_status

router = APIRouter(
    tags=["health"]
)


@router.get("/health", response_model=HealthResponse)
def health_check() -> HealthResponse:
    return HealthResponse(status=health_status())