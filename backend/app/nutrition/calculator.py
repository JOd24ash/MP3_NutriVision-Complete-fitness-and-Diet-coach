"""
Converts estimated grams (Phase 2.3) into calories/macros using the
per-100g reference database.

Validation rules enforced here:
  - Unknown food        -> nutrition_status = "unknown", nutrition = None
  - Missing grams        -> nutrition_status = "missing_grams", nutrition = None
  - Calories             -> rounded to nearest integer
  - Macros (protein/carbs/fat) -> rounded to 1 decimal place
  - Confidence score      -> passed through unchanged on every item
"""

from typing import List

from .database import get_nutrition_per_100g
from .models import (
    FoodItemInput,
    FoodItemNutritionResult,
    MealItemSummary,
    MealNutritionResponse,
    MealTotal,
    NutritionValues,
)


def _scale(value_per_100g: float, grams: float) -> float:
    return (grams / 100.0) * value_per_100g


def compute_item_nutrition(item: FoodItemInput) -> FoodItemNutritionResult:
    """Compute nutrition for a single food item, applying validation rules."""
    per_100g = get_nutrition_per_100g(item.food_label)

    if per_100g is None:
        return FoodItemNutritionResult(
            food_label=item.food_label,
            estimated_grams=item.estimated_grams,
            confidence=item.confidence,
            nutrition=None,
            nutrition_status="unknown",
        )

    if item.estimated_grams is None:
        return FoodItemNutritionResult(
            food_label=item.food_label,
            estimated_grams=None,
            confidence=item.confidence,
            nutrition=None,
            nutrition_status="missing_grams",
        )

    grams = item.estimated_grams
    nutrition = NutritionValues(
        calories=round(_scale(per_100g["kcal"], grams)),
        protein_g=round(_scale(per_100g["protein"], grams), 1),
        carbs_g=round(_scale(per_100g["carbs"], grams), 1),
        fat_g=round(_scale(per_100g["fat"], grams), 1),
    )

    return FoodItemNutritionResult(
        food_label=item.food_label,
        estimated_grams=grams,
        confidence=item.confidence,
        nutrition=nutrition,
        nutrition_status="ok",
    )


def compute_meal_nutrition(items: List[FoodItemInput]) -> MealNutritionResponse:
    """Compute per-item + total nutrition for a full meal.

    Items with status "unknown" or "missing_grams" are excluded from the
    total but still listed, so the frontend can flag them instead of
    silently under-reporting the meal's calories.
    """
    results = [compute_item_nutrition(item) for item in items]

    total_kcal = 0.0
    total_protein = 0.0
    total_carbs = 0.0
    total_fat = 0.0
    item_summaries: List[MealItemSummary] = []

    for r in results:
        if r.nutrition_status == "ok" and r.nutrition is not None:
            total_kcal += r.nutrition.calories
            total_protein += r.nutrition.protein_g
            total_carbs += r.nutrition.carbs_g
            total_fat += r.nutrition.fat_g

        item_summaries.append(
            MealItemSummary(
                food_label=r.food_label,
                grams=r.estimated_grams,
                calories=r.nutrition.calories if r.nutrition else None,
                nutrition_status=r.nutrition_status,
            )
        )

    total = MealTotal(
        calories=round(total_kcal),
        protein_g=round(total_protein, 1),
        carbs_g=round(total_carbs, 1),
        fat_g=round(total_fat, 1),
    )

    return MealNutritionResponse(items=item_summaries, total=total)
