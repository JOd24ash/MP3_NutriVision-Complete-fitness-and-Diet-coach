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
import os
from dataclasses import dataclass
from functools import lru_cache
from typing import List, Optional, Protocol, TypedDict

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
    def detect(self, image_bytes: bytes) -> List[Detection]: ...


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
    checkpoint_path = os.environ.get("YOLO_CHECKPOINT_PATH")
    return VisionSettings(
        checkpoint_path=checkpoint_path,
        confidence=confidence,
        image_size=image_size,
        device=os.environ.get("YOLO_DEVICE") or None,
    )


class YOLO26SegDetector:
    """YOLO26 instance-segmentation detector for a local food checkpoint.

    Requirements for the checkpoint file
    -------------------------------------
    * Must be a YOLO *segmentation* model (task == "segment").
    * Must be fine-tuned on Indian-food classes — NOT a generic COCO-80
      backbone.  Supplying the unmodified yolo26n-seg.pt that ships with
      Ultralytics will raise RuntimeError because every class name in that
      file is a COCO generic label (person, car, …).

    How to get a compatible checkpoint
    -----------------------------------
    Fine-tune YOLO26n-Seg on an annotated Indian-food segmentation dataset
    (e.g. FoodSeg103 subset, or a custom dataset labelled with the same
    classes listed in backend/app/vision/labels.yaml).
    See docs/ML_PIPELINE.md §Phase-2 for the recommended training pipeline.
    """

    def __init__(self, settings: VisionSettings):
        from ultralytics import YOLO  # local import: optional dep until a checkpoint exists

        if not settings.checkpoint_path or not os.path.isfile(settings.checkpoint_path):
            raise RuntimeError("YOLO26 segmentation checkpoint is missing; set YOLO_CHECKPOINT_PATH to a local .pt file")
        self.settings = settings
        self.model = YOLO(settings.checkpoint_path)
        if getattr(self.model, "task", None) != "segment":
            raise RuntimeError(
                "YOLO_CHECKPOINT_PATH must point to a YOLO26 segmentation checkpoint "
                "(for example yolo26n-seg.pt or its fine-tuned best.pt), not detection-only yolo26n.pt"
            )
        # Guard: reject an unmodified COCO-backbone checkpoint that has never
        # been fine-tuned on Indian food.  If every class name in the checkpoint
        # is a COCO generic label the model will never produce a useful food label.
        checkpoint_classes: set[str] = set(getattr(self.model, "names", {}).values())
        if checkpoint_classes and checkpoint_classes.issubset(_COCO_GENERIC_CLASSES):
            raise RuntimeError(
                "YOLO_CHECKPOINT_PATH points to a COCO-80 checkpoint that is NOT trained on Indian food. "
                f"Class names found: {sorted(checkpoint_classes)[:10]} … "
                "Fine-tune on an Indian-food segmentation dataset first "
                "(see docs/ML_PIPELINE.md §Phase-2 for instructions)."
            )

    def detect(self, image_bytes: bytes) -> List[Detection]:
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
            if result.masks is None:
                continue
            for box, mask in zip(result.boxes, result.masks):
                label = result.names[int(box.cls[0])]
                confidence = float(box.conf[0])
                # mask.xy gives polygon points; pixel area via the shoelace formula
                pixel_area = _polygon_area(mask.xy[0]) if mask.xy else 0.0
                detection: Detection = {"food_label": label, "confidence": confidence, "pixel_area": pixel_area}
                if hasattr(box, "xyxy"):
                    detection["bbox"] = [float(value) for value in box.xyxy[0].tolist()]
                detections.append(detection)
        if detections:
            from .indian_food_classifier import refine_detection
            detections = [refine_detection(image, detection) for detection in detections]
        return _deduplicate(detections)


class MockYOLOSegDetector:
    """Fixture-based stand-in — same interface, no model weights required."""

    FIXTURE: List[Detection] = [
        {"food_label": "chapati", "confidence": 0.94, "pixel_area": 26000.0},
        {"food_label": "rice", "confidence": 0.91, "pixel_area": 34000.0},
        {"food_label": "dal", "confidence": 0.89, "pixel_area": 21000.0},
        {"food_label": "paneer", "confidence": 0.86, "pixel_area": 9000.0},
    ]

    def detect(self, image_bytes: bytes) -> List[Detection]:
        # Ignores image content — deterministic fixture for pipeline testing.
        return list(self.FIXTURE)


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
        return YOLO26SegDetector(settings)
    if os.environ.get("USE_MOCK_DETECTOR", "false").lower() == "true":
        return MockYOLOSegDetector()
    raise RuntimeError("Food detection model is not configured. Set YOLO_CHECKPOINT_PATH to a fine-tuned YOLO26 segmentation checkpoint or enable explicit demo mode with USE_MOCK_DETECTOR=true.")


def get_detector() -> Detector:
    return _get_detector(vision_settings())


def vision_status() -> dict:
    settings = vision_settings()
    if settings.checkpoint_path and os.path.isfile(settings.checkpoint_path):
        # Report actual class names from the checkpoint when ultralytics is
        # available, so operators can verify the model is food-trained.
        classes: list[str] = []
        try:
            from ultralytics import YOLO
            model = YOLO(settings.checkpoint_path)
            classes = list(getattr(model, "names", {}).values())
        except Exception:  # ultralytics not installed, or file unreadable
            pass
        return {"mode": "yolo26-seg", "model_name": os.path.basename(settings.checkpoint_path), "classes": classes}
    if os.environ.get("USE_MOCK_DETECTOR", "false").lower() == "true":
        return {"mode": "mock", "model_name": "fixture", "classes": [d["food_label"] for d in MockYOLOSegDetector.FIXTURE]}
    return {"mode": "unavailable", "model_name": None, "classes": []}
