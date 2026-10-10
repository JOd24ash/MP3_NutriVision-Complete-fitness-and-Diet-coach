"""Shared, local food catalogue. Values are sourced and marked in data/foods.json."""
import json
from pathlib import Path

_path = Path(__file__).parents[2] / "data" / "foods.json"
FOODS = {food["label"]: food for food in json.loads(_path.read_text(encoding="utf-8"))["foods"]}

def search_foods(query: str):
    term = query.lower().replace(" ", "_").strip()
    return [food for label, food in FOODS.items() if not term or term in label or term in food["display_name"].lower()]
