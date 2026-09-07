from typing import List, Literal, Optional

from pydantic import BaseModel, Field

NutritionStatus = Literal["ok", "unknown", "missing_grams"]


class FoodItemInput(BaseModel):
    """One detected+portioned food item, as handed off from Phase 2.3."""

    food_label: str
    estimated_grams: Optional[float] = None
    confidence: Optional[float] = Field(
        default=None, description="Detection/classification confidence, carried through unchanged."
    )


class NutritionValues(BaseModel):
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float


class FoodItemNutritionResult(BaseModel):
    """Full per-item result, including validation status."""

    food_label: str
    estimated_grams: Optional[float] = None
    confidence: Optional[float] = None
    nutrition: Optional[NutritionValues] = None
    nutrition_status: NutritionStatus = "ok"


class MealItemSummary(BaseModel):
    """Slim per-item entry for the meal-level response."""

    food_label: str
    grams: Optional[float] = None
    calories: Optional[int] = None
    nutrition_status: NutritionStatus = "ok"


class MealTotal(BaseModel):
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float


class MealNutritionResponse(BaseModel):
    items: List[MealItemSummary]
    total: MealTotal
