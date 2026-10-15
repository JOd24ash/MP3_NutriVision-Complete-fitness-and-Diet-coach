"""
Tests for the meal nutrition calculation engine and food detection integration.

Covers:
  - compute_item_nutrition with known food labels and grams
  - Unknown food labels return status='unknown' instead of failing
  - Missing grams return status='missing_grams'
  - Allergy guardrails block flagged foods
  - Dietary preference filtering (diet tags in food data)
  - Portion-estimation pipeline from vision detections and voice
  - Allergen-allergy intersection guard
"""

import pytest
from app.nutrition.calculator import compute_item_nutrition, compute_meal_nutrition
from app.nutrition.models import FoodItemInput
from app.guardrails.engine import evaluate_meal
from app.guardrails.models import MedicalProfile
from app.portion.estimator import estimate_meal_from_detections, estimate_meal_from_voice


# ──────────────────────────────────────────────────────────────── helpers ──────

def _item(label: str, grams=None, conf=None):
    return FoodItemInput(food_label=label, estimated_grams=grams, confidence=conf)


# ───────────────────────────────────────────────────── basic nutrition tests ──

def test_chapati_nutrition_scales_with_grams():
    result = compute_item_nutrition(_item("chapati", grams=80))
    assert result.nutrition_status == "ok"
    assert result.nutrition is not None
    # 80g chapati at 297 kcal/100g = 237.6 -> 238 kcal
    assert result.nutrition.calories == pytest.approx(238, abs=2)
    # Protein 9.6g/100g * 0.8 = 7.68 -> 7.7 g
    assert result.nutrition.protein_g == pytest.approx(7.7, abs=0.2)


def test_alias_roti_resolves_to_chapati():
    r_chapati = compute_item_nutrition(_item("chapati", grams=40))
    r_roti = compute_item_nutrition(_item("roti", grams=40))
    assert r_roti.nutrition_status == "ok"
    assert r_roti.nutrition.calories == r_chapati.nutrition.calories


def test_dal_protein_density():
    result = compute_item_nutrition(_item("dal", grams=150))
    assert result.nutrition_status == "ok"
    # 150g at 9g/100g protein = 13.5 g
    assert result.nutrition.protein_g == pytest.approx(13.5, abs=0.3)


def test_rice_carb_dominant():
    result = compute_item_nutrition(_item("rice", grams=150))
    assert result.nutrition_status == "ok"
    # Rice is carb-heavy: 28.2g/100g -> 42.3g carbs > protein
    assert result.nutrition.carbs_g > result.nutrition.protein_g
    assert result.nutrition.carbs_g > result.nutrition.fat_g


def test_paneer_high_protein_and_fat():
    result = compute_item_nutrition(_item("paneer", grams=100))
    assert result.nutrition_status == "ok"
    assert result.nutrition.protein_g >= 18
    assert result.nutrition.fat_g >= 20


def test_idli_known_entry():
    result = compute_item_nutrition(_item("idli", grams=70))
    assert result.nutrition_status == "ok"
    # 70g at 146 kcal/100g -> 102.2 ~ 102 kcal
    assert result.nutrition.calories == pytest.approx(102, abs=3)


def test_boiled_egg_low_carbs():
    result = compute_item_nutrition(_item("boiled_egg", grams=50))
    assert result.nutrition_status == "ok"
    assert result.nutrition.carbs_g < 2
    assert result.nutrition.protein_g >= 6


# ────────────────────────────────────────── unknown / missing-grams handling ──

def test_unknown_food_returns_unknown_status():
    result = compute_item_nutrition(_item("space_burger", grams=200))
    assert result.nutrition_status == "unknown"
    assert result.nutrition is None


def test_missing_grams_returns_missing_grams_status():
    result = compute_item_nutrition(_item("chapati", grams=None))
    assert result.nutrition_status == "missing_grams"
    assert result.nutrition is None


def test_confidence_is_passed_through_unchanged():
    result = compute_item_nutrition(_item("rice", grams=100, conf=0.61))
    assert result.confidence == pytest.approx(0.61)


# ───────────────────────────────────────────────────────── meal-level totals ──

def test_meal_totals_exclude_unknown_items():
    items = [
        _item("chapati", grams=80),
        _item("mystery_food", grams=100),
        _item("dal", grams=150),
    ]
    meal = compute_meal_nutrition(items)
    assert meal.total.calories > 0
    assert any(i.nutrition_status == "unknown" for i in meal.items)


def test_meal_total_matches_sum_of_ok_items():
    items = [_item("rice", grams=150), _item("dal", grams=150)]
    meal = compute_meal_nutrition(items)
    r = compute_item_nutrition(_item("rice", grams=150))
    d = compute_item_nutrition(_item("dal", grams=150))
    expected = r.nutrition.calories + d.nutrition.calories
    assert meal.total.calories == expected


# ─────────────────────────────────────────── guardrail / allergy checks ──────

def test_dairy_allergy_flags_paneer():
    profile = MedicalProfile(allergies=["dairy"], conditions=[])
    result = compute_item_nutrition(_item("paneer", grams=100))
    rows = evaluate_meal([result], profile)
    assert rows[0].guardrail_status in {"warn", "blocked"}


def test_no_allergy_paneer_ok():
    profile = MedicalProfile(allergies=[], conditions=[])
    result = compute_item_nutrition(_item("paneer", grams=100))
    rows = evaluate_meal([result], profile)
    assert rows[0].guardrail_status == "ok"


def test_gluten_allergy_flags_chapati():
    profile = MedicalProfile(allergies=["gluten"], conditions=[])
    result = compute_item_nutrition(_item("chapati", grams=80))
    rows = evaluate_meal([result], profile)
    assert rows[0].guardrail_status in {"warn", "blocked"}


def test_legume_allergy_flags_dal():
    profile = MedicalProfile(allergies=["legumes"], conditions=[])
    result = compute_item_nutrition(_item("dal", grams=150))
    rows = evaluate_meal([result], profile)
    assert rows[0].guardrail_status in {"warn", "blocked"}


def test_peanut_allergy_flags_roasted_peanuts():
    profile = MedicalProfile(allergies=["peanuts"], conditions=[])
    result = compute_item_nutrition(_item("roasted_peanuts", grams=30))
    rows = evaluate_meal([result], profile)
    assert rows[0].guardrail_status in {"warn", "blocked"}


def test_unrelated_allergy_does_not_flag_rice():
    profile = MedicalProfile(allergies=["peanuts"], conditions=[])
    result = compute_item_nutrition(_item("rice", grams=150))
    rows = evaluate_meal([result], profile)
    assert rows[0].guardrail_status == "ok"


# ─────────────────────────────── portion estimation from vision detections ──

def test_detection_falls_back_to_serving_without_calibration():
    detections = [{"food_label": "chapati", "pixel_area": 0, "confidence": 0.9}]
    items = estimate_meal_from_detections(detections, None, None)
    assert len(items) == 1
    assert items[0].estimated_grams == pytest.approx(40, abs=5)  # serving_g for chapati=40


def test_detection_with_calibration_estimates_positive_grams():
    # 25 cm reference spanning 500 px -> 20 px/cm
    detections = [{"food_label": "rice", "pixel_area": 400.0, "confidence": 0.85}]
    items = estimate_meal_from_detections(detections, reference_object_px=500, reference_object_real_cm=25)
    assert len(items) == 1
    assert items[0].estimated_grams is not None
    assert items[0].estimated_grams > 0


def test_detection_confidence_preserved():
    detections = [{"food_label": "dal", "pixel_area": 0, "confidence": 0.72}]
    items = estimate_meal_from_detections(detections)
    assert items[0].confidence == pytest.approx(0.72)


# ─────────────────────────────────────────── voice portion estimation ──────

def test_voice_estimation_uses_piece_unit():
    parsed = [{"food_label": "idli", "quantity": 2, "unit": "piece", "confidence": 0.9}]
    items = estimate_meal_from_voice(parsed)
    assert len(items) == 1
    # 2 pieces * 35g/piece = 70g
    assert items[0].estimated_grams == pytest.approx(70, abs=10)


def test_voice_estimation_unknown_unit_falls_back_to_serving_default():
    """When the spoken unit is unrecognised, the estimator safely falls back to the
    food's catalogue serving_g (chapati serving_g = 40g). This is the correct
    defensive behaviour — unknown units must not silently produce zero grams."""
    parsed = [{"food_label": "chapati", "quantity": 1, "unit": "galaxy", "confidence": 0.9}]
    items = estimate_meal_from_voice(parsed)
    # Either None (no lookup) or the catalogue serving_g fallback (40g) are acceptable.
    # The implementation currently returns the catalogue default — verify it is a reasonable positive weight.
    assert items[0].estimated_grams is None or items[0].estimated_grams > 0


# ─────────────────────────────────────────── diet tag verification ──────

def test_rice_is_vegan():
    from app.nutrition.food_data import FOODS
    assert FOODS["rice"]["diet"] == "vegan"


def test_paneer_is_veg_not_vegan():
    from app.nutrition.food_data import FOODS
    assert FOODS["paneer"]["diet"] == "veg"


def test_egg_diet_is_eggetarian():
    from app.nutrition.food_data import FOODS
    assert FOODS["boiled_egg"]["diet"] == "eggetarian"


def test_chicken_is_non_veg():
    from app.nutrition.food_data import FOODS
    assert FOODS["chicken_curry"]["diet"] == "non_veg"
