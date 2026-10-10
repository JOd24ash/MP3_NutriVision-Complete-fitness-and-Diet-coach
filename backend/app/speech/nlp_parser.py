"""Small local Hinglish meal parser backed by the shared food aliases."""
import re
from typing import List, TypedDict

from ..nutrition.database import NUTRITION_DB
from ..nutrition.labels import ALIASES, normalize_food_label

NUMBER_WORDS = {"a": 1, "an": 1, "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10, "ek": 1, "do": 2, "teen": 3, "char": 4, "paanch": 5, "che": 6, "saat": 7, "aath": 8, "nau": 9, "das": 10, "aadha": .5, "derh": 1.5, "dhai": 2.5}
UNIT_WORDS = {"pieces": "piece", "piece": "piece", "roti": "piece", "katori": "bowl", "bowl": "bowl", "bowls": "bowl", "cup": "cup", "cups": "cup", "glass": "glass", "plate": "plate", "chammach": "spoon", "spoon": "spoon", "spoons": "spoon"}

class ParsedFoodItem(TypedDict):
    food_label: str
    quantity: float
    unit: str
    confidence: float

def _quantity(value: str) -> float:
    return float(NUMBER_WORDS.get(value, value))

def parse_transcript(transcript: str) -> List[ParsedFoodItem]:
    text = re.sub(r"[^a-z0-9 ]+", " ", (transcript or "").lower())
    known = sorted(set(NUTRITION_DB) | set(ALIASES), key=len, reverse=True)
    results: List[ParsedFoodItem] = []
    for spoken in known:
        for match in re.finditer(rf"\b{re.escape(spoken.replace('_', ' '))}\b", text):
            prefix = text[max(0, match.start()-30):match.start()].strip().split()
            quantity, unit, confidence = 1.0, "piece", .65
            if prefix:
                token = prefix[-1]
                if token in UNIT_WORDS:
                    unit, confidence = UNIT_WORDS[token], .8
                    if len(prefix) > 1:
                        token = prefix[-2]
                if token in NUMBER_WORDS or token.replace('.', '', 1).isdigit():
                    quantity, confidence = _quantity(token), .95
            results.append({"food_label": normalize_food_label(spoken), "quantity": quantity, "unit": unit, "confidence": confidence})
    return results
