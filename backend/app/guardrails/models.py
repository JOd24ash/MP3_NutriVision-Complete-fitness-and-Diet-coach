from typing import List, Literal, Optional

from pydantic import BaseModel, Field

GuardrailStatus = Literal["ok", "warn", "blocked", "unknown"]


class MedicalProfile(BaseModel):
    """Mirrors `medical_profiles` in DATA_MODEL.md."""

    allergies: List[str] = Field(default_factory=list)
    conditions: List[str] = Field(default_factory=list)  # e.g. "diabetes", "hypertension", "ckd"


class GuardrailCheckInput(BaseModel):
    """One item to check — food label plus whatever nutrition context we have.

    carbs_g is optional: /guardrails/check can be called standalone right
    after vision detection (no grams yet) or after the nutrition engine
    (Phase 2.4/Phase 3) has already produced macros for the portion.
    """

    food_label: str
    carbs_g: Optional[float] = None


class GuardrailItemResult(BaseModel):
    food_label: str
    guardrail_status: GuardrailStatus
    guardrail_reason: Optional[str] = None


class GuardrailCheckResponse(BaseModel):
    items: List[GuardrailItemResult]
    overall_status: GuardrailStatus


class MealItemRow(BaseModel):
    """Shape matches `meal_items` in DATA_MODEL.md — one row per detected item,
    nutrition + guardrail fields together, ready to persist."""

    food_label: str
    confidence: Optional[float] = None
    est_grams: Optional[float] = None
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    nutrition_status: str
    guardrail_status: GuardrailStatus
    guardrail_reason: Optional[str] = None
