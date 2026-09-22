from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from starlette.middleware.sessions import SessionMiddleware
from app.admin import sqladmin

from app.api.health import router as health_router
from app.api.auth import router as auth_router
from app.core.config import get_settings
from app.db.session import get_db


settings = get_settings()
session = get_db()

app = FastAPI(title="Excercise Progress Tracker")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=settings.sqladmin_secret_key,
)

app.include_router(auth_router)
app.include_router(health_router)
sqladmin(app)