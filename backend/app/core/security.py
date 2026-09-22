from datetime import datetime, timedelta, timezone
import bcrypt
import jwt

from app.core.config import get_settings


settings = get_settings()
ALGORITHM = "HS256"

def create_access_token(user_id: str) -> str:
    expiry = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": user_id, "exp": expiry}

    return jwt.encode(payload, settings.jwt_secret, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    return jwt.decode(token, settings.jwt_secret, algorithms=ALGORITHM)

def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), password_hash.encode("utf-8"))