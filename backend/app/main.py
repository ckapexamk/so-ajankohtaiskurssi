from fastapi import FastAPI

from app.core.config import settings

from app.api.health import router as health_router

app = FastAPI()

# config testaus
@app.get("/config")
def config_check():
    return {
        "api_port": settings.api_port,
        "database_configured": bool(settings.database_url),
    }


app.include_router(health_router)