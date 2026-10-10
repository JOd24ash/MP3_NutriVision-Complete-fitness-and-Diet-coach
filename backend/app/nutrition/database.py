"""
Reference nutrition database (per 100 g), keyed by normalized food label.

Placeholder values — swap for the official ICMR/NIN "Indian Food
Composition Tables" dataset when available. Keep the key format
(lowercase, underscores for multi-word labels) so lookups from the
classification stage (Phase 2.2) don't need extra normalization logic
beyond `.strip().lower()`.
"""

from typing import Optional, TypedDict
from .food_data import FOODS
from .labels import normalize_food_label


class NutritionPer100g(TypedDict):
    kcal: float
    protein: float
    carbs: float
    fat: float


NUTRITION_DB: dict[str, NutritionPer100g] = {label: {key: food[key] for key in ("kcal", "protein", "carbs", "fat")} for label, food in FOODS.items()}


def get_nutrition_per_100g(food_label: str) -> Optional[NutritionPer100g]:
    """Look up per-100g nutrition for a food label, or None if unknown."""
    if not food_label:
        return None
    return NUTRITION_DB.get(normalize_food_label(food_label))
