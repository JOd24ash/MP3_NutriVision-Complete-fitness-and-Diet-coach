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


@pytest.mark.parametrize("profile", [
    (2, "female", 100, 20, "light", "fitness"),
    (30, "other", 170, 70, "light", "fitness"),
    (30, "male", 170, 70, "unknown", "fitness"),
])
def test_invalid_profiles_are_rejected(profile):
    with pytest.raises(ValueError):
        targets(*profile)
