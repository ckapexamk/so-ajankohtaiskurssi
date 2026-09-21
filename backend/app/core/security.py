import bcrypt


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, password_hash: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), password_hash.encode("utf-8"))

def validate_password(password: str) -> None:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("Password is too long for bcrypt")