ACTIVITY = {"sedentary": 1.2, "light": 1.375, "moderate": 1.55, "active": 1.725}
def targets(age, sex, height_cm, weight_kg, activity_level, goal):
    bmr = 10 * weight_kg + 6.25 * height_cm - 5 * age + (5 if sex == "male" else -161)
    tdee = bmr * ACTIVITY[activity_level]
    calories = max(1200 if sex == "female" else 1500, tdee + {"lose": -400, "maintain": 0, "gain": 300}[goal])
    return {"bmr": round(bmr), "tdee": round(tdee), "calories": round(calories), "protein_g": round(weight_kg * 1.6), "fat_g": round(calories * .25 / 9), "carbs_g": round((calories - weight_kg * 1.6 * 4 - calories * .25) / 4)}
