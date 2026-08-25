"""
Per-food allergen + condition-caution reference, keyed the same way as
`nutrition/database.py` (lowercase food_label). Mirrors the
`common_allergens` column on `nutrition_reference` in DATA_MODEL.md, plus
a `condition_tags` lookup for the diabetes/hypertension/ckd checks the
guardrail layer needs.

Placeholder/illustrative data — swap for a vetted clinical source
(dietitian-reviewed, ideally tied to the same ICMR reference used for
the RAG knowledge base) before this touches real user-facing advice.
"""

from typing import Dict, List, Optional, TypedDict


class FoodHealthProfile(TypedDict):
    allergens: List[str]
    condition_tags: Dict[str, str]  # condition -> human-readable caution reason


FOOD_HEALTH_DB: Dict[str, FoodHealthProfile] = {
    "chapati": {
        "allergens": ["gluten", "wheat"],
        "condition_tags": {
            "diabetes": "Wheat flatbread — moderate-to-high glycemic load per piece.",
        },
    },
    "rice": {
        "allergens": [],
        "condition_tags": {
            "diabetes": "High glycemic index — can spike blood sugar quickly in larger portions.",
        },
    },
    "dal": {
        "allergens": ["legumes"],
        "condition_tags": {
            "ckd": "Legumes are relatively high in potassium — caution with reduced kidney function.",
        },
    },
    "paneer": {
        "allergens": ["dairy", "milk"],
        "condition_tags": {
            "hypertension": "Often prepared or served with added salt — watch sodium intake.",
            "ckd": "Relatively high in phosphorus — caution with reduced kidney function.",
        },
    },
    "idli": {
        "allergens": [],
        "condition_tags": {},
    },
}

# Per-portion carb threshold (grams) above which a diabetic profile gets a
# warning regardless of which food it is — catches large portions of foods
# that aren't flagged by name alone.
DIABETES_CARB_WARNING_THRESHOLD_G = 40.0


def get_food_health_profile(food_label: str) -> Optional[FoodHealthProfile]:
    if not food_label:
        return None
    return FOOD_HEALTH_DB.get(food_label.strip().lower())
