"""
SQLAlchemy models mirroring DATA_MODEL.md's relational schema.

Uses JSON columns for `allergies`/`conditions` instead of Postgres
text[] so this runs identically against SQLite in local dev (SETUP.md
uses Postgres+TimescaleDB in prod — swap the column type back to
`ARRAY(String)` from `sqlalchemy.dialects.postgresql` once you're only
targeting Postgres, and make `meal_logs.logged_at` /
`health_metrics.recorded_at` TimescaleDB hypertables per DATA_MODEL.md).
"""

import enum
import uuid

from sqlalchemy import (
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    JSON,
    String,
    Text,
    func,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


def _uuid() -> str:
    return str(uuid.uuid4())


class MealSource(str, enum.Enum):
    photo = "photo"
    voice = "voice"
    manual = "manual"


class GuardrailStatus(str, enum.Enum):
    ok = "ok"
    warn = "warn"
    blocked = "blocked"
    unknown = "unknown"


class MetricType(str, enum.Enum):
    weight = "weight"
    blood_sugar = "blood_sugar"
    bp = "bp"


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=_uuid)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    medical_profile = relationship("MedicalProfile", back_populates="user", uselist=False)
    meal_logs = relationship("MealLog", back_populates="user")
    health_metrics = relationship("HealthMetric", back_populates="user")


class MedicalProfile(Base):
    __tablename__ = "medical_profiles"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    allergies = Column(JSON, default=list)  # e.g. ["peanuts", "shellfish"]
    conditions = Column(JSON, default=list)  # e.g. ["diabetes", "ckd"]
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    user = relationship("User", back_populates="medical_profile")


class MealLog(Base):
    __tablename__ = "meal_logs"

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())  # hypertable partition key
    source = Column(Enum(MealSource), nullable=False)
    raw_image_url = Column(String, nullable=True)
    raw_audio_url = Column(String, nullable=True)
    confirmed = Column(String, default="false")  # "true"/"false" — kept simple across SQLite/Postgres

    user = relationship("User", back_populates="meal_logs")
    items = relationship("MealItem", back_populates="meal_log", cascade="all, delete-orphan")


class MealItem(Base):
    __tablename__ = "meal_items"

    id = Column(String, primary_key=True, default=_uuid)
    meal_log_id = Column(String, ForeignKey("meal_logs.id"), nullable=False)
    food_label = Column(String, nullable=False)
    confidence = Column(Float, nullable=True)
    est_grams = Column(Float, nullable=True)
    calories = Column(Float, nullable=True)
    protein_g = Column(Float, nullable=True)
    carbs_g = Column(Float, nullable=True)
    fat_g = Column(Float, nullable=True)
    guardrail_status = Column(Enum(GuardrailStatus), default=GuardrailStatus.ok)
    guardrail_reason = Column(Text, nullable=True)

    meal_log = relationship("MealLog", back_populates="items")


class HealthMetric(Base):
    __tablename__ = "health_metrics"  # TimescaleDB hypertable in prod

    id = Column(String, primary_key=True, default=_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())  # partition key
    metric_type = Column(Enum(MetricType), nullable=False)
    value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)

    user = relationship("User", back_populates="health_metrics")


class NutritionReference(Base):
    __tablename__ = "nutrition_reference"

    id = Column(String, primary_key=True, default=_uuid)
    food_label = Column(String, unique=True, nullable=False)
    density_g_per_cm3 = Column(Float, nullable=True)
    calories_per_100g = Column(Float, nullable=False)
    protein_per_100g = Column(Float, nullable=False)
    carbs_per_100g = Column(Float, nullable=False)
    fat_per_100g = Column(Float, nullable=False)
    common_allergens = Column(JSON, default=list)
