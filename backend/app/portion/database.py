"""
Per-food defaults for volume -> gram conversion (ML_PIPELINE.md, section 2).

height_cm: assumed stack/serving height on a plate — a rough constant per
food category, not measured per-photo. This is the biggest simplification
in the whole pipeline; ML_PIPELINE.md flags portion estimation as
lab-controlled in most research, so validate against manually-weighed
plates (see SETUP.md's `scripts/eval_portion_accuracy.py`) before trusting
these numbers for real users.

density_g_per_cm3: matches the `density_g_per_cm3` column on
`nutrition_reference` in DATA_MODEL.md.
"""

from typing import Dict, Optional, TypedDict


class PortionDefaults(TypedDict):
    height_cm: float
    density_g_per_cm3: float


PORTION_DB: Dict[str, PortionDefaults] = {
    "chapati": {"height_cm": 0.4, "density_g_per_cm3": 0.9},
    "rice": {"height_cm": 2.0, "density_g_per_cm3": 0.75},
    "dal": {"height_cm": 2.5, "density_g_per_cm3": 1.0},
    "paneer": {"height_cm": 1.5, "density_g_per_cm3": 1.05},
    "idli": {"height_cm": 3.0, "density_g_per_cm3": 0.6},
}

# Fallback for foods detected by vision but not yet in PORTION_DB — keeps
# the pipeline from hard-failing on an unseen label; grams will be rougher.
DEFAULT_HEIGHT_CM = 2.0
DEFAULT_DENSITY_G_PER_CM3 = 0.85

# Default single-serving weights (grams) used by the voice/manual path,
# where there's no photo to measure area from — keyed by common spoken unit.
UNIT_DEFAULT_GRAMS: Dict[str, Dict[str, float]] = {
    "chapati": {"piece": 40.0, "bowl": 120.0},
    "rice": {"piece": 100.0, "bowl": 150.0, "cup": 180.0},
    "dal": {"piece": 100.0, "bowl": 150.0, "cup": 200.0},
    "paneer": {"piece": 20.0, "bowl": 100.0, "cube": 15.0},
    "idli": {"piece": 35.0, "bowl": 105.0},
}


def get_portion_defaults(food_label: str) -> PortionDefaults:
    key = (food_label or "").strip().lower()
    return PORTION_DB.get(
        key, {"height_cm": DEFAULT_HEIGHT_CM, "density_g_per_cm3": DEFAULT_DENSITY_G_PER_CM3}
    )


def get_unit_grams(food_label: str, unit: str) -> Optional[float]:
    key = (food_label or "").strip().lower()
    unit_key = (unit or "piece").strip().lower()
    food_units = UNIT_DEFAULT_GRAMS.get(key)
    if not food_units:
        return None
    return food_units.get(unit_key, food_units.get("piece"))
