"""Canonical food labels shared by every food-entry path.

Mapping strategy
----------------
Every output label produced by dima806/indian_food_image_detection (80 classes)
is mapped here to the nearest canonical key in foods.json.  Where there is no
close match the label is left unmapped so compute_item_nutrition returns
nutrition_status="unknown" and the frontend prompts the user to correct it —
nutrition values are never invented for missing entries.

Alias keys must be the *normalised* form of the raw label
(re.sub(r"[^a-z0-9]+", "_", raw.strip().lower()).strip("_")), which is
exactly what normalize_food_label() produces before the dict lookup.
"""

import re

# Maps normalised raw labels → canonical nutrition-DB keys (foods.json "label").
ALIASES: dict[str, str] = {
    # ── genuine synonyms & spelling variants ─────────────────────────────────
    "roti": "chapati",
    "whole_wheat_roti": "chapati",
    "wheat_roti": "chapati",
    "phulka": "chapati",
    "chapatti": "chapati",
    "chawal": "rice",
    "plain_rice": "rice",
    "white_rice": "rice",
    "steamed_rice": "rice",
    "boiled_rice": "rice",
    "cooked_rice": "rice",
    "brown_rice": "rice",
    "basmati_rice": "rice",
    "bhat": "rice",
    "steamed_idli": "idli",
    "steamed_idly": "idli",
    "dal_fry": "dal",
    "dal_tadka": "dal",
    "curd": "dahi",
    "fresh_curd": "dahi",
    "yogurt": "dahi",
    "chana_masala": "chole",
    "kidney_beans": "rajma",
    "chai": "masala_chai",
    "anda": "boiled_egg",
    "egg": "boiled_egg",
    "bhindi_masala": "bhindi_sabzi",
    "maach_jhol": "fish_curry",
    "sheera": "halwa",
    "phirni": "kheer",
    "doodhpak": "kheer",
    "chak_hao_kheer": "kheer",
    "chhena_kheeri": "kheer",
    "bandar_laddu": "ladoo",
    "gajar_ka_halwa": "halwa",
    "tandoori_roti": "chapati",
    "butter_roti": "chapati",
    "aloo_paratha": "paratha",
}



def normalize_food_label(label: str) -> str:
    """Normalise and alias a raw food label to its canonical nutrition-DB key."""
    key = re.sub(r"[^a-z0-9]+", "_", (label or "").strip().lower()).strip("_")
    return ALIASES.get(key, key)
