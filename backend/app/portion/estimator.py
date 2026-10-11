"""
Converts vision-pipeline detections (pixel area per item) into estimated
grams, using reference-object scaling (ML_PIPELINE.md, section 2).

reference_object_px / reference_object_real_cm describe a known-size
object visible in the photo (e.g. a plate of known diameter, or a coin) —
detecting *that* object is a separate CV step this module doesn't do; it
assumes the caller already has its pixel measurement (from a manual
calibration step, a fixed-camera-distance app flow, or a simple
circle-detection pass upstream). Swap in real detection before this
touches production photos.
"""

from typing import List, Optional

from ..nutrition.models import FoodItemInput
from .database import get_portion_defaults, get_unit_grams


def pixels_per_cm(reference_object_px: float, reference_object_real_cm: float) -> float:
    if reference_object_real_cm is None or reference_object_px is None:
        raise ValueError("Reference measurements must be provided")
    if reference_object_real_cm <= 0:
        raise ValueError("reference_object_real_cm must be > 0")
    if reference_object_px <= 0:
        raise ValueError("reference_object_px must be > 0")
    return reference_object_px / reference_object_real_cm


def estimate_grams_from_area(
    pixel_area: float,
    food_label: str,
    px_per_cm: float,
) -> float:
    """pixel_area -> real-world area (cm^2) -> volume (cm^3) via a per-food
    height default -> grams via a per-food density default."""
    if px_per_cm <= 0:
        raise ValueError("px_per_cm must be > 0")

    if pixel_area <= 0:
        defaults = get_portion_defaults(food_label)
        return float(defaults.get("serving_g", 100.0))

    area_cm2 = pixel_area / (px_per_cm ** 2)
    defaults = get_portion_defaults(food_label)
    volume_cm3 = area_cm2 * defaults["height_cm"]
    grams = volume_cm3 * defaults["density_g_per_cm3"]
    return round(grams, 1)


def estimate_meal_from_detections(
    detections: List[dict],
    reference_object_px: Optional[float] = None,
    reference_object_real_cm: Optional[float] = None,
) -> List[FoodItemInput]:
    """detections: list of {"food_label": str, "pixel_area": float, "confidence": float}
    (this is the shape the vision module's detector returns).

    Returns FoodItemInput objects ready to hand straight to
    nutrition.calculator.compute_meal_nutrition(). Handles missing or invalid
    calibration inputs safely by falling back to catalog standard serving weights.
    """
    px_per_cm: Optional[float] = None
    if reference_object_px is not None and reference_object_real_cm is not None:
        try:
            px = float(reference_object_px)
            cm = float(reference_object_real_cm)
            if px > 0 and cm > 0:
                px_per_cm = pixels_per_cm(px, cm)
        except (ValueError, TypeError):
            px_per_cm = None

    items: List[FoodItemInput] = []
    for d in detections:
        food_label = d.get("food_label", "")
        pixel_area = float(d.get("pixel_area") or 0.0)
        if px_per_cm and px_per_cm > 0 and pixel_area > 0:
            grams = estimate_grams_from_area(pixel_area, food_label, px_per_cm)
        else:
            defaults = get_portion_defaults(food_label)
            grams = float(defaults.get("serving_g", 100.0))
        items.append(
            FoodItemInput(
                food_label=food_label,
                estimated_grams=grams,
                confidence=d.get("confidence"),
            )
        )
    return items


def estimate_meal_from_voice(parsed_items: List[dict]) -> List[FoodItemInput]:
    """parsed_items: list of {"food_label": str, "quantity": float, "unit": str}
    (the shape speech.transcriber's NLP parser returns).

    No photo to measure area from, so grams come from per-unit defaults
    (UNIT_DEFAULT_GRAMS) scaled by the spoken quantity.
    """
    items: List[FoodItemInput] = []
    for p in parsed_items:
        per_unit = get_unit_grams(p["food_label"], p.get("unit", "piece"))
        grams: Optional[float] = round(per_unit * p["quantity"], 1) if per_unit is not None else None
        items.append(FoodItemInput(food_label=p["food_label"], estimated_grams=grams))
    return items
