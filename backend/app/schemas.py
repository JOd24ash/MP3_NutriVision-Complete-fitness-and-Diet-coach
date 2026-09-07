from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr

from .db.models import MetricType


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ProfileResponse(BaseModel):
    user_id: str
    name: str
    email: str
    allergies: List[str]
    conditions: List[str]


class ProfileUpdateRequest(BaseModel):
    allergies: List[str]
    conditions: List[str]


class MealItemPatchRequest(BaseModel):
    food_label: Optional[str] = None
    est_grams: Optional[float] = None


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


class MealLogSummary(BaseModel):
    meal_log_id: str
    logged_at: datetime
    source: str
    items: List[MealItemOut]
    total: MealTotalOut


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
