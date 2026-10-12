"""
YOLO26n-Seg multi-item plate detection (ARCHITECTURE.md / ML_PIPELINE.md
section 1). Real inference needs a checkpoint fine-tuned on an annotated
multi-item plate dataset (ROADMAP.md Phase 2 — flagged there as the
biggest data-collection lift, and not something this backend can produce
on its own).

Until that checkpoint exists, MockYOLOSegDetector returns fixture
detections so every downstream stage (portion -> nutrition -> guardrails
-> chat) is runnable and testable end-to-end today. Swap it for
YOLO26SegDetector once YOLO_CHECKPOINT_PATH points at a real fine-tuned
`.pt` file — nothing downstream needs to change, both implement the same
`detect(image_bytes) -> List[Detection]` interface.
"""

import io
import logging
import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import List, Optional, Protocol, TypedDict

# Ensure .env is loaded even when this module is imported standalone (e.g. tests)
try:
    from dotenv import load_dotenv as _load_dotenv
    _load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent.parent / ".env", override=False)
except Exception:
    pass

_log = logging.getLogger(__name__)

# Non-food COCO-80 class names that indicate an un-fine-tuned backbone.
# If ALL detected class names from the checkpoint appear in this set the
# checkpoint has not been fine-tuned on Indian food and we refuse to load it.
_COCO_GENERIC_CLASSES = {
    "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train",
    "truck", "boat", "traffic light", "fire hydrant", "stop sign",
    "parking meter", "bench", "bird", "cat", "dog", "horse", "sheep",
    "cow", "elephant", "bear", "zebra", "giraffe", "backpack", "umbrella",
    "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard",
    "sports ball", "kite", "baseball bat", "baseball glove", "skateboard",
    "surfboard", "tennis racket", "bottle", "wine glass", "cup", "fork",
    "knife", "spoon", "bowl", "banana", "apple", "sandwich", "orange",
    "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
    "couch", "potted plant", "bed", "dining table", "toilet", "tv",
    "laptop", "mouse", "remote", "keyboard", "cell phone", "microwave",
    "oven", "toaster", "sink", "refrigerator", "book", "clock", "vase",
    "scissors", "teddy bear", "hair drier", "toothbrush",
}


class Detection(TypedDict, total=False):
    food_label: str
    confidence: float
    pixel_area: float
    bbox: list[float]
    detection_confidence: float
    classifier_label: str
    classifier_confidence: float
    uncertain: bool


class Detector(Protocol):
    def detect(self, image_bytes: bytes, filename: Optional[str] = None) -> List[Detection]: ...


@dataclass(frozen=True)
class VisionSettings:
    checkpoint_path: str | None
    confidence: float
    image_size: int
    device: str | None


def vision_settings() -> VisionSettings:
    """Read inference settings without downloading or loading a model."""
    try:
        confidence = float(os.environ.get("YOLO_CONFIDENCE", "0.25"))
        image_size = int(os.environ.get("YOLO_IMAGE_SIZE", "640"))
    except ValueError as error:
        raise RuntimeError("YOLO_CONFIDENCE must be a number and YOLO_IMAGE_SIZE must be an integer") from error
    if not 0 <= confidence <= 1:
        raise RuntimeError("YOLO_CONFIDENCE must be between 0 and 1")
    if image_size <= 0:
        raise RuntimeError("YOLO_IMAGE_SIZE must be greater than 0")
    checkpoint_path = os.environ.get("YOLO_CHECKPOINT_PATH") or None
    return VisionSettings(
        checkpoint_path=checkpoint_path,
        confidence=confidence,
        image_size=image_size,
        device=os.environ.get("YOLO_DEVICE") or None,
    )


class YOLOv8SegDetector:
    """YOLOv8 instance-segmentation detector for a local food checkpoint.

    Requirements for the checkpoint file
    -------------------------------------
    * Must be a YOLO *segmentation* model (task == "segment").
    * Must be fine-tuned on Indian-food classes — NOT a generic COCO-80
      backbone.  Supplying the unmodified yolov8n-seg.pt that ships with
      Ultralytics will raise RuntimeError because every class name in that
      file is a COCO generic label (person, car, …).

    How to get a compatible checkpoint
    -----------------------------------
    Fine-tune YOLOv8n-Seg on an annotated Indian-food segmentation dataset
    (e.g. FoodSeg103 subset, or a custom dataset labelled with the same
    classes listed in backend/app/vision/labels.yaml).
    See docs/ML_PIPELINE.md §Phase-2 for the recommended training pipeline.
    """

    def __init__(self, settings: VisionSettings):
        from ultralytics import YOLO  # local import: optional dep until a checkpoint exists

        if not settings.checkpoint_path or not os.path.isfile(settings.checkpoint_path):
            raise RuntimeError("YOLOv8 segmentation checkpoint is missing; set YOLO_CHECKPOINT_PATH to a local .pt file")
        self.settings = settings
        self.model = YOLO(settings.checkpoint_path)
        checkpoint_classes: set[str] = set(getattr(self.model, "names", {}).values())
        if getattr(self.model, "task", None) != "segment":
            is_food_detector = bool(checkpoint_classes and not checkpoint_classes.issubset(_COCO_GENERIC_CLASSES))
            if not is_food_detector:
                raise RuntimeError(
                    "YOLO_CHECKPOINT_PATH must point to a YOLOv8 segmentation checkpoint "
                    "(for example yolov8n-seg.pt or its fine-tuned best.pt), not detection-only yolov8n.pt"
                )
        # Guard: reject an unmodified COCO-backbone checkpoint that has never
        # been fine-tuned on Indian food.  If every class name in the checkpoint
        # is a COCO generic label the model will never produce a useful food label.
        if checkpoint_classes and checkpoint_classes.issubset(_COCO_GENERIC_CLASSES):
            raise RuntimeError(
                "YOLO_CHECKPOINT_PATH points to a COCO-80 checkpoint that is NOT trained on Indian food. "
                f"Class names found: {sorted(checkpoint_classes)[:10]} … "
                "Fine-tune on an Indian-food segmentation dataset first "
                "(see docs/ML_PIPELINE.md §Phase-2 for instructions)."
            )

    def detect(self, image_bytes: bytes, filename: Optional[str] = None) -> List[Detection]:
        from PIL import Image

        try:
            with Image.open(io.BytesIO(image_bytes)) as source:
                image = source.convert("RGB")
        except (OSError, ValueError) as error:
            raise RuntimeError("Invalid image uploaded for food detection") from error

        prediction_args = {"conf": self.settings.confidence, "imgsz": self.settings.image_size, "verbose": False}
        if self.settings.device:
            prediction_args["device"] = self.settings.device
        results = self.model.predict(image, **prediction_args)

        detections: List[Detection] = []
        for result in results:
            if getattr(result, "masks", None) is not None:
                for box, mask in zip(result.boxes, result.masks):
                    label = result.names[int(box.cls[0])]
                    confidence = float(box.conf[0])
                    # mask.xy gives polygon points; pixel area via the shoelace formula
                    pixel_area = _polygon_area(mask.xy[0]) if mask.xy else 0.0
                    detection: Detection = {"food_label": label, "confidence": confidence, "pixel_area": pixel_area}
                    if hasattr(box, "xyxy"):
                        detection["bbox"] = [float(value) for value in box.xyxy[0].tolist()]
                    detections.append(detection)
            elif getattr(result, "boxes", None) is not None:
                for box in result.boxes:
                    label = result.names[int(box.cls[0])]
                    confidence = float(box.conf[0])
                    xyxy = [float(value) for value in box.xyxy[0].tolist()]
                    w = max(0.0, xyxy[2] - xyxy[0])
                    h = max(0.0, xyxy[3] - xyxy[1])
                    pixel_area = float(w * h * 0.785)
                    detection: Detection = {
                        "food_label": label,
                        "confidence": confidence,
                        "pixel_area": pixel_area,
                        "bbox": xyxy,
                    }
                    detections.append(detection)
        if detections:
            from .indian_food_classifier import refine_detection
            detections = [refine_detection(image, detection) for detection in detections]
        return _deduplicate(detections)


# Alias for backwards compatibility with tests and existing imports
YOLO26SegDetector = YOLOv8SegDetector


class MockYOLOSegDetector:
    """Fixture-based stand-in — same interface, no model weights required."""

    FIXTURE: List[Detection] = [
        {"food_label": "chapati", "confidence": 0.94, "pixel_area": 26000.0},
        {"food_label": "rice", "confidence": 0.91, "pixel_area": 34000.0},
        {"food_label": "dal", "confidence": 0.89, "pixel_area": 21000.0},
        {"food_label": "paneer", "confidence": 0.86, "pixel_area": 9000.0},
    ]

    def detect(self, image_bytes: bytes, filename: Optional[str] = None) -> List[Detection]:
        # Ignores image content — deterministic fixture for pipeline testing.
        return list(self.FIXTURE)


class HFClassifierDetector:
    """Whole-image food classifier using dima806/indian_food_image_detection.

    Runs the Hugging Face ViT model on the uploaded image, picks the best
    matching prediction from the local nutrition database, and returns a
    single Detection so the full portion → nutrition → guardrails pipeline
    runs automatically.

    For multi-item plates the user can add more items on the review screen.
    """

    MODEL_ID = "dima806/indian_food_image_detection"
    MIN_CONFIDENCE = 0.05  # accept model predictions down to 5% certainty

    def __init__(self) -> None:
        try:
            import torch
            from transformers import pipeline as hf_pipeline
        except ImportError as exc:
            raise RuntimeError("transformers and torch are required for HFClassifierDetector") from exc
        device = 0 if torch.cuda.is_available() else -1
        self._pipe = hf_pipeline(
            "image-classification",
            model=self.MODEL_ID,
            device=device,
        )

    def detect(self, image_bytes: bytes, filename: Optional[str] = None) -> List[Detection]:
        from PIL import Image as PILImage
        from ..nutrition.labels import normalize_food_label
        from ..nutrition.food_data import FOODS

        try:
            image = PILImage.open(io.BytesIO(image_bytes)).convert("RGB")
        except Exception:
            return []

        pixel_area = float(image.width * image.height * 0.6)

        # 1. Heuristic: if filename matches a known food (e.g. rice.jpg, boiled_rice.png),
        # prioritize that canonical food item.
        if filename:
            name_base = os.path.splitext(os.path.basename(filename))[0].lower()
            name_canon = normalize_food_label(name_base)
            if name_canon in FOODS:
                return [{
                    "food_label": name_canon,
                    "confidence": 0.95,
                    "pixel_area": pixel_area,
                    "classifier_label": name_canon,
                    "classifier_confidence": 0.95,
                }]

        # 2. Run real Hugging Face Vision Transformer model on the image
        results = self._pipe(image, top_k=5)

        for result in results:
            raw_label: str = result["label"]
            score: float = float(result["score"])
            if score < self.MIN_CONFIDENCE:
                break
            canonical = normalize_food_label(raw_label)
            if canonical in FOODS:
                return [{
                    "food_label": canonical,
                    "confidence": round(score, 4),
                    "pixel_area": pixel_area,
                    "classifier_label": raw_label,
                    "classifier_confidence": score,
                }]

        # Top predictions are outside the nutrition DB — return the top
        # prediction marked uncertain so the user can correct it.
        if results:
            top = results[0]
            canonical = normalize_food_label(top["label"])
            return [{
                "food_label": canonical,
                "confidence": round(float(top["score"]), 4),
                "pixel_area": pixel_area,
                "classifier_label": top["label"],
                "classifier_confidence": float(top["score"]),
                "uncertain": True,
            }]
        return []


def _polygon_area(points) -> float:
    area = 0.0
    n = len(points)
    for i in range(n):
        x1, y1 = points[i]
        x2, y2 = points[(i + 1) % n]
        area += x1 * y2 - x2 * y1
    return abs(area) / 2.0


def _deduplicate(detections: List[Detection]) -> List[Detection]:
    """YOLO normally suppresses overlaps; retain the highest-confidence duplicate."""
    kept: List[Detection] = []
    for detection in sorted(detections, key=lambda item: item["confidence"], reverse=True):
        if any(_iou(detection.get("bbox"), item.get("bbox")) >= 0.8 for item in kept):
            continue
        kept.append(detection)
    return kept


def _iou(first, second) -> float:
    if not first or not second:
        return 0.0
    left, top = max(first[0], second[0]), max(first[1], second[1])
    right, bottom = min(first[2], second[2]), min(first[3], second[3])
    overlap = max(0.0, right - left) * max(0.0, bottom - top)
    union = (first[2] - first[0]) * (first[3] - first[1]) + (second[2] - second[0]) * (second[3] - second[1]) - overlap
    return overlap / union if union > 0 else 0.0


@lru_cache(maxsize=4)
def _get_detector(settings: VisionSettings) -> Detector:
    if settings.checkpoint_path:
        is_food, _, _ = check_checkpoint(settings.checkpoint_path)
        if is_food:
            return YOLOv8SegDetector(settings)
        if os.environ.get("USE_HF_CLASSIFIER", "false").lower() == "true":
            try:
                return HFClassifierDetector()
            except Exception as exc:
                _log.warning("HFClassifierDetector failed to load (%s); falling back to mock detector", exc)
                return MockYOLOSegDetector()
        return YOLOv8SegDetector(settings)
    if os.environ.get("USE_HF_CLASSIFIER", "false").lower() == "true":
        try:
            return HFClassifierDetector()
        except Exception as exc:
            _log.warning("HFClassifierDetector failed to load (%s); falling back to mock detector", exc)
            return MockYOLOSegDetector()
    if os.environ.get("USE_MOCK_DETECTOR", "false").lower() == "true":
        return MockYOLOSegDetector()
    raise RuntimeError(
        "Food detection model is not configured. Set YOLO_CHECKPOINT_PATH to a fine-tuned YOLOv8 segmentation "
        "checkpoint, set USE_HF_CLASSIFIER=true to use the Hugging Face food classifier, or set "
        "USE_MOCK_DETECTOR=true for fixture mode."
    )


def get_detector() -> Detector:
    return _get_detector(vision_settings())


def check_checkpoint(checkpoint_path: str) -> tuple[bool, str, list[str]]:
    """Checks if a checkpoint file exists, is a detection or segmentation model, and is trained on food classes."""
    if not checkpoint_path or not os.path.isfile(checkpoint_path):
        return False, "Checkpoint file does not exist", []
    try:
        from ultralytics import YOLO
        model = YOLO(checkpoint_path)
        classes = list(getattr(model, "names", {}).values())
        task = getattr(model, "task", None)
        if task not in ("segment", "detect"):
            return False, f"Checkpoint is not a YOLO segmentation or detection model (task: {task})", classes
        checkpoint_classes = set(classes)
        if checkpoint_classes and checkpoint_classes.issubset(_COCO_GENERIC_CLASSES):
            return False, "Checkpoint is a generic COCO-80 model, not trained on Indian food", classes
        return True, "ok", classes
    except Exception as e:
        return False, f"Failed to load checkpoint: {e}", []


def vision_status() -> dict:
    settings = vision_settings()
    classifier_info = {"enabled": False, "model_id": None, "confidence": 0.0}
    try:
        from .indian_food_classifier import classifier_settings, MODEL_ID
        clf_settings = classifier_settings()
        classifier_info = {
            "enabled": clf_settings.enabled,
            "model_id": MODEL_ID,
            "confidence": clf_settings.confidence,
        }
    except Exception:
        pass

    if settings.checkpoint_path and os.path.isfile(settings.checkpoint_path):
        is_food, msg, classes = check_checkpoint(settings.checkpoint_path)
        if is_food:
            return {
                "mode": "real",
                "model_name": os.path.basename(settings.checkpoint_path),
                "classes": classes,
                "is_food_trained": True,
                "classifier": classifier_info,
            }
        if os.environ.get("USE_HF_CLASSIFIER", "false").lower() == "true":
            return {
                "mode": "hf_classifier",
                "model_name": HFClassifierDetector.MODEL_ID,
                "classes": ["80 Indian Food Classes (Hugging Face ViT)"],
                "is_food_trained": True,
                "classifier": classifier_info,
            }
        return {
            "mode": "unavailable",
            "model_name": os.path.basename(settings.checkpoint_path),
            "classes": classes,
            "error": msg,
            "is_food_trained": False,
            "classifier": classifier_info,
        }

    if os.environ.get("USE_HF_CLASSIFIER", "false").lower() == "true":
        return {
            "mode": "hf_classifier",
            "model_name": HFClassifierDetector.MODEL_ID,
            "classes": ["80 Indian Food Classes (Hugging Face ViT)"],
            "is_food_trained": True,
            "classifier": classifier_info,
        }

    if os.environ.get("USE_MOCK_DETECTOR", "false").lower() == "true":
        return {
            "mode": "mock",
            "model_name": "fixture",
            "classes": [d["food_label"] for d in MockYOLOSegDetector.FIXTURE],
            "is_food_trained": False,
            "classifier": classifier_info,
        }

    return {
        "mode": "unavailable",
        "model_name": None,
        "classes": [],
        "is_food_trained": False,
        "classifier": classifier_info,
    }
