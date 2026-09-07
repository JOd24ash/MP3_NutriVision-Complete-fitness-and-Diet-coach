"""
Allergen/health guardrail layer (ROADMAP.md Phase 4 / ARCHITECTURE.md
"Guardrail Layer"). Not a model — a rules/lookup pass that runs after
detection (and, where available, after the nutrition engine) and before
anything reaches the UI or gets persisted.

Precedence per item: blocked > warn > unknown > ok.
  - blocked: a detected allergen matches the user's declared allergies.
  - warn:    a condition-caution tag matches a declared condition, or a
             diabetic profile's portion carbs exceed the warning threshold.
  - unknown: the food isn't in the guardrail reference DB at all — flagged
             for manual review rather than silently passed as safe.
  - ok:      no matches.
"""

from typing import List, Optional

from ..nutrition.models import FoodItemNutritionResult
from .database import DIABETES_CARB_WARNING_THRESHOLD_G, get_food_health_profile
from .models import (
    GuardrailCheckInput,
    GuardrailCheckResponse,
    GuardrailItemResult,
    GuardrailStatus,
    MealItemRow,
    MedicalProfile,
)

_STATUS_PRIORITY = {"ok": 0, "unknown": 1, "warn": 2, "blocked": 3}


def check_item(item: GuardrailCheckInput, profile: MedicalProfile) -> GuardrailItemResult:
    health_profile = get_food_health_profile(item.food_label)

    if health_profile is None:
        return GuardrailItemResult(
            food_label=item.food_label,
            guardrail_status="unknown",
            guardrail_reason="No guardrail data on file for this food — review manually.",
        )

    reasons: List[str] = []
    status: GuardrailStatus = "ok"

    user_allergies = {a.strip().lower() for a in profile.allergies}
    matched_allergens = user_allergies.intersection(a.lower() for a in health_profile["allergens"])
    if matched_allergens:
        status = "blocked"
        reasons.append(f"Contains {', '.join(sorted(matched_allergens))} — matches a declared allergy.")

    user_conditions = {c.strip().lower() for c in profile.conditions}
    for condition in user_conditions:
        tag_reason = health_profile["condition_tags"].get(condition)
        if tag_reason:
            reasons.append(tag_reason)
            if _STATUS_PRIORITY["warn"] > _STATUS_PRIORITY[status]:
                status = "warn"

    if (
        "diabetes" in user_conditions
        and item.carbs_g is not None
        and item.carbs_g > DIABETES_CARB_WARNING_THRESHOLD_G
    ):
        reasons.append(
            f"{item.carbs_g:g}g carbs in this portion is high for a diabetic profile "
            f"(over {DIABETES_CARB_WARNING_THRESHOLD_G:g}g)."
        )
        if _STATUS_PRIORITY["warn"] > _STATUS_PRIORITY[status]:
            status = "warn"

    return GuardrailItemResult(
        food_label=item.food_label,
        guardrail_status=status,
        guardrail_reason="; ".join(reasons) if reasons else None,
    )


def check_meal(items: List[GuardrailCheckInput], profile: MedicalProfile) -> GuardrailCheckResponse:
    results = [check_item(item, profile) for item in items]
    overall: GuardrailStatus = "ok"
    for r in results:
        if _STATUS_PRIORITY[r.guardrail_status] > _STATUS_PRIORITY[overall]:
            overall = r.guardrail_status
    return GuardrailCheckResponse(items=results, overall_status=overall)


def evaluate_meal(
    nutrition_results: List[FoodItemNutritionResult],
    profile: MedicalProfile,
) -> List[MealItemRow]:
    """Full pipeline glue: nutrition engine output (Phase 2.4) + guardrail
    check -> `meal_items`-shaped rows (DATA_MODEL.md), ready for the
    `/meals/photo` / `/meals/voice` response or a DB insert.
    """
    rows: List[MealItemRow] = []

    for n in nutrition_results:
        carbs_g: Optional[float] = n.nutrition.carbs_g if n.nutrition else None
        guardrail_input = GuardrailCheckInput(food_label=n.food_label, carbs_g=carbs_g)
        g = check_item(guardrail_input, profile)

        rows.append(
            MealItemRow(
                food_label=n.food_label,
                confidence=n.confidence,
                est_grams=n.estimated_grams,
                calories=n.nutrition.calories if n.nutrition else None,
                protein_g=n.nutrition.protein_g if n.nutrition else None,
                carbs_g=carbs_g,
                fat_g=n.nutrition.fat_g if n.nutrition else None,
                nutrition_status=n.nutrition_status,
                guardrail_status=g.guardrail_status,
                guardrail_reason=g.guardrail_reason,
            )
        )

    return rows
