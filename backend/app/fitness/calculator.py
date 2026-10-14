"""Transparent, general-purpose nutrition targets; not medical prescriptions.

Sources: Mifflin et al., Am J Clin Nutr 1990 (adult resting energy); WHO/FAO/
UNU 2004 (Schofield equations for children); National Academies AMDR 2005.
"""

ACTIVITY = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725, "very_active": 1.725}
SOURCES = [
    {"title": "Mifflin-St Jeor resting-energy equation", "url": "https://pubmed.ncbi.nlm.nih.gov/2305711/"},
    {"title": "WHO/FAO/UNU human energy requirements", "url": "https://www.fao.org/4/y5686e/y5686e00.htm"},
    {"title": "National Academies AMDRs", "url": "https://www.ncbi.nlm.nih.gov/books/NBK56068/"},
    {"title": "NHS gradual adult weight-gain guidance", "url": "https://www.nhs.uk/live-well/healthy-weight/managing-your-weight/healthy-ways-to-gain-weight/"},
]


def _schofield_bmr(age: float, sex: str, weight_kg: float) -> float:
    """WHO Schofield weight equations, kcal/day, applicable to ages 3–17."""
    male = sex == "male"
    if age < 10:
        return (22.7 * weight_kg + 495) if male else (22.5 * weight_kg + 499)
    return (17.5 * weight_kg + 651) if male else (12.2 * weight_kg + 746)


def targets(age, sex, height_cm, weight_kg, activity_level, goal):
    """Return explainable energy/macro estimates from validated profile inputs."""
    age, height_cm, weight_kg = float(age), float(height_cm), float(weight_kg)
    if not 3 <= age <= 120 or not 80 <= height_cm <= 250 or not 15 <= weight_kg <= 350:
        raise ValueError("Age, height, or weight is outside the supported guidance range")
    if activity_level not in ACTIVITY:
        raise ValueError("Unsupported activity level")
    if sex not in {"male", "female"}:
        raise ValueError("Select male or female to use the published energy equations")
    if goal not in {"gain", "maintain", "fitness", "general_fitness", "lose"}:
        raise ValueError("Unsupported fitness goal")

    is_minor = age < 18
    if age < 10:
        age_group = "child"
        age_group_label = f"Child ({int(age) if age.is_integer() else age} yrs)"
        carb_pct, protein_pct, fat_pct = 55, 15, 30
    elif age < 18:
        age_group = "adolescent"
        age_group_label = f"Adolescent ({int(age) if age.is_integer() else age} yrs)"
        carb_pct, protein_pct, fat_pct = 55, 15, 30
    elif age < 60:
        age_group = "adult"
        age_group_label = f"Adult ({int(age) if age.is_integer() else age} yrs)"
        carb_pct, protein_pct, fat_pct = 50, 20, 30
    else:
        age_group = "senior"
        age_group_label = f"Senior ({int(age) if age.is_integer() else age} yrs)"
        carb_pct, protein_pct, fat_pct = 50, 22, 28

    method = "WHO/FAO/UNU Schofield resting-energy estimate" if is_minor else "Mifflin-St Jeor resting-energy estimate"
    bmr = _schofield_bmr(age, sex, weight_kg) if is_minor else 10 * weight_kg + 6.25 * height_cm - 5 * age + (5 if sex == "male" else -161)
    maintenance = bmr * ACTIVITY[activity_level]
    adjustment, note = 0, ""
    if is_minor:
        note = "For people under 18, this app does not set weight-loss or gain calorie changes. Growth, puberty, and medical needs should be reviewed with a qualified healthcare professional."
    elif goal == "gain":
        # NHS suggests 300–500 extra kcal/day for gradual adult weight gain.
        adjustment = 300
    elif goal == "lose":
        adjustment, note = -300, "Weight-change targets are general estimates; seek professional advice for medical conditions, pregnancy, or eating-disorder concerns."

    calories = round(max(maintenance + adjustment, 1))
    return {
        "bmr": round(bmr), "tdee": round(maintenance), "calories": calories,
        "carbs_g": round(calories * carb_pct / 100 / 4),
        "protein_g": round(calories * protein_pct / 100 / 4),
        "fat_g": round(calories * fat_pct / 100 / 9),
        "macro_percent_energy": {"carbs": carb_pct, "protein": protein_pct, "fat": fat_pct},
        "method": method,
        "age_group": age_group,
        "age_group_label": age_group_label,
        "explanation": f"{method} × {ACTIVITY[activity_level]} activity factor" + (f" {adjustment:+d} kcal/day for the selected adult goal." if adjustment else ".") + f" Calibrated for {age_group_label} with AMDR macronutrient distribution ({carb_pct}% carbs, {protein_pct}% protein, {fat_pct}% fat).",
        "is_minor": is_minor,
        "disclaimer": "General nutrition guidance only; not medical advice or a diagnosis.",
        "caution": note or None,
        "sources": SOURCES,
    }
