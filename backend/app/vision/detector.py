"""
YOLOv8-Seg multi-item plate detection (ARCHITECTURE.md / ML_PIPELINE.md
section 1). Real inference needs a checkpoint fine-tuned on an annotated
multi-item plate dataset (ROADMAP.md Phase 2 — flagged there as the
biggest data-collection lift, and not something this backend can produce
on its own).

Until that checkpoint exists, MockYOLOSegDetector returns fixture
detections so every downstream stage (portion -> nutrition -> guardrails
-> chat) is runnable and testable end-to-end today. Swap it for
YOLOSegDetector once YOLO_CHECKPOINT_PATH points at a real fine-tuned
`.pt` file — nothing downstream needs to change, both implement the same
`detect(image_bytes) -> List[Detection]` interface.
"""

import os
from typing import List, Optional, Protocol, TypedDict


class Detection(TypedDict):
    food_label: str
    confidence: float
    pixel_area: float


class Detector(Protocol):
    def detect(self, image_bytes: bytes) -> List[Detection]: ...


class YOLOSegDetector:
    """Real detector — requires `ultralytics` and a fine-tuned checkpoint."""

    def __init__(self, checkpoint_path: str):
        from ultralytics import YOLO  # local import: optional dep until a checkpoint exists

        self.model = YOLO(checkpoint_path)

    def detect(self, image_bytes: bytes) -> List[Detection]:
        import io

        from PIL import Image

        image = Image.open(io.BytesIO(image_bytes))
        results = self.model.predict(image, verbose=False)

        detections: List[Detection] = []
        for result in results:
            if result.masks is None:
                continue
            for box, mask in zip(result.boxes, result.masks):
                label = result.names[int(box.cls[0])]
                confidence = float(box.conf[0])
                # mask.xy gives polygon points; pixel area via the shoelace formula
                pixel_area = _polygon_area(mask.xy[0]) if mask.xy else 0.0
                detections.append(
                    {"food_label": label, "confidence": confidence, "pixel_area": pixel_area}
                )
        return detections


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


def get_detector() -> Detector:
    checkpoint_path = os.environ.get("YOLO_CHECKPOINT_PATH")
    if checkpoint_path and os.path.isfile(checkpoint_path):
        return YOLOSegDetector(checkpoint_path)
    return MockYOLOSegDetector()
