from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


PROJECT_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    database_url: str
    api_port: int = 8000
    api_host: str = "0.0.0.0"
    sqladmin_username: str
    sqladmin_password: str
    sqladmin_secret_key: str

    model_config = SettingsConfigDict(
        env_file=PROJECT_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()