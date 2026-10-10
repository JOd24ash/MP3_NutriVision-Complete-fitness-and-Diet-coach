"""Canonical food labels shared by every food-entry path."""

import re

ALIASES = {
    "roti": "chapati", "whole_wheat_roti": "chapati", "wheat_roti": "chapati",
    "steamed_idli": "idli", "dal_tadka": "dal", "dal_fry": "dal",
    "curd": "dahi", "fresh_curd": "dahi", "yogurt": "dahi",
    "phulka": "chapati", "chapatti": "chapati", "chawal": "rice", "plain_rice": "rice",
    "chana_masala": "chole", "kidney_beans": "rajma", "chai": "masala_chai",
    "anda": "boiled_egg", "egg": "boiled_egg", "steamed_idly": "idli",
}


def normalize_food_label(label: str) -> str:
    key = re.sub(r"[^a-z0-9]+", "_", (label or "").strip().lower()).strip("_")
    return ALIASES.get(key, key)
