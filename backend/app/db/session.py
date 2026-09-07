"""
Engine/session setup. Defaults to a local SQLite file so the backend runs
with zero external services; set DATABASE_URL (see SETUP.md's .env) to
point at the real Postgres+TimescaleDB instance for anything beyond local
dev.
"""

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from .models import Base

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./nutrivision.db")

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
