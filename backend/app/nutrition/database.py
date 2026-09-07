"""
Reference nutrition database (per 100 g), keyed by normalized food label.

Placeholder values — swap for the official ICMR/NIN "Indian Food
Composition Tables" dataset when available. Keep the key format
(lowercase, underscores for multi-word labels) so lookups from the
classification stage (Phase 2.2) don't need extra normalization logic
beyond `.strip().lower()`.
"""

from typing import Optional, TypedDict


class NutritionPer100g(TypedDict):
    kcal: float
    protein: float
    carbs: float
    fat: float


NUTRITION_DB: dict[str, NutritionPer100g] = {
    "chapati": {"kcal": 297, "protein": 9.6, "carbs": 55.7, "fat": 3.7},
    "rice": {"kcal": 130, "protein": 2.7, "carbs": 28.2, "fat": 0.3},
    "dal": {"kcal": 116, "protein": 9.0, "carbs": 20.0, "fat": 0.4},
    "paneer": {"kcal": 265, "protein": 18.3, "carbs": 1.2, "fat": 20.8},
    "idli": {"kcal": 146, "protein": 4.5, "carbs": 30.4, "fat": 0.7},
}


def get_nutrition_per_100g(food_label: str) -> Optional[NutritionPer100g]:
    """Look up per-100g nutrition for a food label, or None if unknown."""
    if not food_label:
        return None
    return NUTRITION_DB.get(food_label.strip().lower())
