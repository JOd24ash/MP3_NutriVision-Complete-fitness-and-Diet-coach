import pytest

from app.fitness.calculator import targets


def test_adult_gain_uses_mifflin_and_amdr_macros():
    plan = targets(30, "male", 175, 70, "moderate", "gain")
    assert plan["method"].startswith("Mifflin")
    assert plan["calories"] == round((10 * 70 + 6.25 * 175 - 5 * 30 + 5) * 1.55 + 300)
    assert plan["macro_percent_energy"] == {"carbs": 50, "protein": 20, "fat": 30}
    assert plan["carbs_g"] == round(plan["calories"] * 0.50 / 4)
    assert len(plan["sources"]) == 4


def test_minor_has_age_appropriate_targets_without_goal_calorie_change():
    gain = targets(14, "female", 160, 50, "light", "gain")
    maintain = targets(14, "female", 160, 50, "light", "maintain")
    assert gain["is_minor"] is True
    assert gain["calories"] == maintain["calories"]
    assert gain["macro_percent_energy"] == {"carbs": 55, "protein": 15, "fat": 30}
    assert "healthcare professional" in gain["caution"]


def test_young_child_profile_has_different_personalized_macro_targets():
    plan = targets(5, "male", 168, 60, "sedentary", "fitness")
    assert plan["calories"] == 2228
    assert plan["carbs_g"] == 306
    assert plan["protein_g"] == 84
    assert plan["fat_g"] == 74
    assert plan["age_group"] == "child"
    assert "Child (5 yrs)" in plan["age_group_label"]


def test_senior_profile_has_age_tailored_protein_density():
    plan = targets(65, "male", 165, 65, "sedentary", "fitness")
    assert plan["age_group"] == "senior"
    assert plan["macro_percent_energy"] == {"carbs": 50, "protein": 22, "fat": 28}
    assert plan["protein_g"] == round(plan["calories"] * 0.22 / 4)


@pytest.mark.parametrize("profile", [
    (2, "female", 100, 20, "light", "fitness"),
    (30, "other", 170, 70, "light", "fitness"),
    (30, "male", 170, 70, "unknown", "fitness"),
])
def test_invalid_profiles_are_rejected(profile):
    with pytest.raises(ValueError):
        targets(*profile)
