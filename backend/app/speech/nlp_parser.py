"""
Extracts (food_label, quantity, unit) tuples from a Whisper transcript
(ML_PIPELINE.md section 5). Rule-based on purpose: a small, known food
vocabulary (shared with nutrition/database.py) plus number-word and unit
matching, rather than a trained NLU model — cheap to run, and the
low-confidence-parse fallback (ML_PIPELINE.md: "prompt user to
confirm/edit") is what actually protects against code-mixed phrasing this
doesn't catch. Extend KNOWN_FOODS / NUMBER_WORDS / UNIT_WORDS as more
languages and dishes get added.
"""

import re
from typing import List, TypedDict

from ..nutrition.database import NUTRITION_DB

KNOWN_FOODS = list(NUTRITION_DB.keys())

NUMBER_WORDS = {
    "a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}

UNIT_WORDS = ["piece", "pieces", "bowl", "bowls", "cup", "cups", "cube", "cubes"]

_UNIT_SINGULAR = {"pieces": "piece", "bowls": "bowl", "cups": "cup", "cubes": "cube"}


class ParsedFoodItem(TypedDict):
    food_label: str
    quantity: float
    unit: str


def _parse_quantity(token: str) -> float:
    token = token.strip().lower()
    if token in NUMBER_WORDS:
        return float(NUMBER_WORDS[token])
    try:
        return float(token)
    except ValueError:
        return 1.0


def parse_transcript(transcript: str) -> List[ParsedFoodItem]:
    """Best-effort extraction — not exhaustive. Each recognized food gets a
    quantity (default 1) and unit (default "piece") pulled from nearby
    words in the transcript."""
    text = transcript.lower()
    results: List[ParsedFoodItem] = []

    for food in KNOWN_FOODS:
        for match in re.finditer(rf"\b{re.escape(food)}\b", text):
            window_start = max(0, match.start() - 25)
            window = text[window_start:match.start()]

            qty_match = re.search(
                r"(\d+(?:\.\d+)?|" + "|".join(NUMBER_WORDS.keys()) + r")\s*(?:" + "|".join(UNIT_WORDS) + r")?\s*(?:of\s*)?$",
                window,
            )
            quantity = _parse_quantity(qty_match.group(1)) if qty_match else 1.0

            unit_match = re.search(r"(" + "|".join(UNIT_WORDS) + r")\s*(?:of\s*)?$", window)
            unit = _UNIT_SINGULAR.get(unit_match.group(1), unit_match.group(1)) if unit_match else "piece"

            results.append({"food_label": food, "quantity": quantity, "unit": unit})

    return results
