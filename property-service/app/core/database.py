from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# The database URL — like Django's DATABASES setting
# SQLite for now, change to postgresql://user:pass@host/db for production

# Engine = the actual connection to the database
# connect_args is SQLite-specific — not needed for PostgreSQL
engine = create_engine(
    settings.DATABASE_URL
)

# SessionLocal = a factory that creates DB sessions
# Each request gets its own session, then it closes
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base = parent class for all your DB models
Base = declarative_base()

# Dependency — gives a DB session to any route that needs it
# yield = gives the session, then closes it after the request finishes
def get_db():
    db = SessionLocal()
    try:
        yield db        # ← request uses db here
    finally:
        db.close()      # ← always closes, even if request crashes