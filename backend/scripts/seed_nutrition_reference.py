"""Seed nutrition_reference from backend/data/foods.json."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parents[1]))
from app.db.models import NutritionReference
from app.db.session import SessionLocal, init_db
from app.nutrition.food_data import FOODS

init_db(); db = SessionLocal()
for food in FOODS.values():
    row = db.query(NutritionReference).filter_by(food_label=food["label"]).first() or NutritionReference(food_label=food["label"])
    row.calories_per_100g, row.protein_per_100g, row.carbs_per_100g, row.fat_per_100g = (food[key] for key in ("kcal", "protein", "carbs", "fat"))
    row.common_allergens = food["allergens"]; db.add(row)
db.commit(); db.close()
