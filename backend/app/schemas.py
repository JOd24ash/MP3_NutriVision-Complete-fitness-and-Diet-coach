from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

from .db.models import MetricType


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    allergies: List[str]
    conditions: List[str]


class ProfileUpdateRequest(BaseModel):
    allergies: Optional[List[str]] = Field(default_factory=list)
    conditions: Optional[List[str]] = Field(default_factory=list)

    @field_validator("allergies", "conditions", mode="before")
    @classmethod
    def coerce_values(cls, values):
        if values is None:
            return []
        if isinstance(values, str):
            values = [values]
        return [v for v in values if v and str(v).strip().lower() != "none"]

    @field_validator("allergies", "conditions")
    @classmethod
    def validate_values(cls, values: Optional[List[str]], info):
        allowed = {
            "allergies": {"gluten", "wheat", "dairy", "peanuts", "tree_nuts", "soy", "egg", "fish", "shellfish", "legumes", "sesame"},
            "conditions": {"diabetes", "hypertension", "ckd", "high_cholesterol", "pcos", "thyroid"},
        }[info.field_name]
        normalized = [str(value).strip().lower().replace(" ", "_") for value in (values or [])]
        invalid = sorted(set(normalized) - allowed)
        if invalid:
            raise ValueError(f"Unsupported {info.field_name}: {', '.join(invalid)}")
        return list(dict.fromkeys(normalized))


class MealItemPatchRequest(BaseModel):
    food_label: Optional[str] = None
    est_grams: Optional[float] = None
    confirmed_grams: Optional[float] = None


class MealItemCreateRequest(BaseModel):
    food_label: str = Field(min_length=1)
    est_grams: float = Field(gt=0)


class ManualMealCreateRequest(BaseModel):
    food_label: Optional[str] = None
    est_grams: Optional[float] = None
    items: Optional[List[MealItemCreateRequest]] = None
    meal_type: str = "snack"


class MealTotalOut(BaseModel):
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float


class MealItemOut(BaseModel):
    id: str
    food_label: str
    confidence: Optional[float] = None
    est_grams: Optional[float] = None
    confirmed_grams: Optional[float] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    guardrail_status: str
    guardrail_reason: Optional[str] = None


class MealResponse(BaseModel):
    meal_log_id: str
    items: List[MealItemOut]
    total: MealTotalOut
    transcript: Optional[str] = None
    needs_manual_review: bool = False
    confirmed: bool = False


class MealLogSummary(BaseModel):
    meal_log_id: str
    logged_at: datetime
    source: str
    items: List[MealItemOut]
    total: MealTotalOut
    confirmed: bool = True


class HealthMetricIn(BaseModel):
    metric_type: MetricType
    value: float
    unit: str


class HealthMetricOut(BaseModel):
    id: str
    metric_type: str
    value: float
    unit: str
    recorded_at: datetime

class GoalIn(BaseModel):
    age: float = Field(ge=3, le=120)
    sex: str
    height_cm: float = Field(ge=80, le=250)
    weight_kg: float = Field(ge=15, le=350)
    activity_level: str
    goal: str
    diet_preference: str

class ActivityIn(BaseModel):
    activity_type: str
    duration_minutes: float = Field(gt=0, le=720)
    intensity: str
