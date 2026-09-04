from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

from app.api.health import router as health_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# config testaus
@app.get("/")
def config_check():
    return {
        "api_port": settings.api_port,
        "database_url": bool(settings.database_url),
    }


app.include_router(health_router)