"""Optional crop classifier for Indian-food labels.

The Hugging Face model is image classification, not detection. It is only
applied to regions supplied by the segmentation detector.
"""

import os
from dataclasses import dataclass
from functools import lru_cache

from ..nutrition.food_data import FOODS
from ..nutrition.labels import normalize_food_label

MODEL_ID = "dima806/indian_food_image_detection"


@dataclass(frozen=True)
class ClassifierSettings:
    enabled: bool
    confidence: float
    device: str | None


def classifier_settings() -> ClassifierSettings:
    try:
        confidence = float(os.environ.get("INDIAN_FOOD_CLASSIFIER_CONFIDENCE", "0.60"))
    except ValueError as error:
        raise RuntimeError("INDIAN_FOOD_CLASSIFIER_CONFIDENCE must be a number") from error
    if not 0 <= confidence <= 1:
        raise RuntimeError("INDIAN_FOOD_CLASSIFIER_CONFIDENCE must be between 0 and 1")
    return ClassifierSettings(
        enabled=os.environ.get("INDIAN_FOOD_CLASSIFIER_ENABLED", "false").lower() == "true",
        confidence=confidence,
        device=os.environ.get("INDIAN_FOOD_CLASSIFIER_DEVICE") or None,
    )


class IndianFoodClassifier:
    def __init__(self, settings: ClassifierSettings):
        try:
            import torch
            from transformers import AutoImageProcessor, AutoModelForImageClassification
        except ImportError as error:
            raise RuntimeError("Indian food classifier requires transformers and torch") from error

        self.settings = settings
        self.processor = AutoImageProcessor.from_pretrained(MODEL_ID)
        self.model = AutoModelForImageClassification.from_pretrained(MODEL_ID)
        requested = settings.device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.device = torch.device(requested)
        self.torch = torch
        self.model.to(self.device).eval()

    def classify(self, image):
        inputs = self.processor(images=image.convert("RGB"), return_tensors="pt")
        inputs = {key: value.to(self.device) for key, value in inputs.items()}
        with self.torch.inference_mode():
            scores = self.torch.softmax(self.model(**inputs).logits, dim=-1)[0]
        index = int(scores.argmax().item())
        return self.model.config.id2label[index], float(scores[index].item())


@lru_cache(maxsize=2)
def _get_classifier(settings: ClassifierSettings) -> IndianFoodClassifier:
    return IndianFoodClassifier(settings)


def get_classifier() -> IndianFoodClassifier | None:
    settings = classifier_settings()
    return _get_classifier(settings) if settings.enabled else None


def refine_detection(image, detection: dict) -> dict:
    """Replace a region label only with a confident nutrition-catalog match."""
    classifier = get_classifier()
    if classifier is None or not detection.get("bbox"):
        return detection
    x1, y1, x2, y2 = (round(value) for value in detection["bbox"])
    crop = image.crop((max(0, x1), max(0, y1), min(image.width, x2), min(image.height, y2)))
    if crop.width < 2 or crop.height < 2:
        return detection
    label, score = classifier.classify(crop)
    canonical = normalize_food_label(label)
    result = {**detection, "classifier_label": label, "classifier_confidence": score}
    if score >= classifier.settings.confidence and canonical in FOODS:
        result.update(food_label=canonical, confidence=score, detection_confidence=detection["confidence"])
    else:
        result["uncertain"] = True
    return result
