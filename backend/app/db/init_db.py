from app.db.session import SessionLocal
from app.services.seed import seed

# Initialize database with seed
def init_db() -> None:
    with SessionLocal() as db:
        seed(db)
        db.commit()


if __name__ == "__main__":
    init_db()