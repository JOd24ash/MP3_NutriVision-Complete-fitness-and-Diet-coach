import io
import sys
import types

import pytest
from PIL import Image

from app.vision.detector import VisionSettings, YOLO26SegDetector, vision_settings


def test_vision_settings_reads_inference_controls(monkeypatch):
    monkeypatch.delenv("YOLO_CHECKPOINT_PATH", raising=False)
    monkeypatch.setenv("YOLO_CONFIDENCE", "0.4")
    monkeypatch.setenv("YOLO_IMAGE_SIZE", "512")
    monkeypatch.setenv("YOLO_DEVICE", "cpu")

    assert vision_settings() == VisionSettings(None, 0.4, 512, "cpu")


def test_yolo26_detector_requires_segmentation_checkpoint(monkeypatch):
    checkpoint = "yolo26n.pt"
    monkeypatch.setattr("app.vision.detector.os.path.isfile", lambda path: path == checkpoint)

    class DetectionOnlyYOLO:
        task = "detect"

        def __init__(self, path):
            assert path == checkpoint

    monkeypatch.setitem(sys.modules, "ultralytics", types.SimpleNamespace(YOLO=DetectionOnlyYOLO))

    with pytest.raises(RuntimeError, match="segmentation checkpoint"):
        YOLO26SegDetector(VisionSettings(checkpoint, 0.25, 640, None))


def test_yolo26_detector_parses_mask_area(monkeypatch):
    checkpoint = "best.pt"
    monkeypatch.setattr("app.vision.detector.os.path.isfile", lambda path: path == checkpoint)
    captured = {}

    class Mask:
        xy = [[[0, 0], [4, 0], [4, 3], [0, 3]]]

    class Box:
        cls = [0]
        conf = [0.9]

    class Result:
        names = {0: "rice"}
        boxes = [Box()]
        masks = [Mask()]

    class SegmentYOLO:
        task = "segment"

        def __init__(self, path):
            assert path == checkpoint

        def predict(self, image, **kwargs):
            captured.update(kwargs)
            return [Result()]

    monkeypatch.setitem(sys.modules, "ultralytics", types.SimpleNamespace(YOLO=SegmentYOLO))
    image_bytes = io.BytesIO()
    Image.new("RGB", (8, 8)).save(image_bytes, format="PNG")

    detector = YOLO26SegDetector(VisionSettings(checkpoint, 0.4, 512, "cpu"))
    assert detector.detect(image_bytes.getvalue()) == [{"food_label": "rice", "confidence": 0.9, "pixel_area": 12.0}]
    assert captured == {"conf": 0.4, "imgsz": 512, "verbose": False, "device": "cpu"}
