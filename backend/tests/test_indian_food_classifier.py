from PIL import Image

from app.vision.indian_food_classifier import ClassifierSettings, refine_detection


def test_refine_detection_uses_confident_catalog_label(monkeypatch):
    class Classifier:
        settings = ClassifierSettings(True, 0.6, None)

        def classify(self, image):
            assert image.size == (4, 4)
            return "chana_masala", 0.9

    monkeypatch.setattr("app.vision.indian_food_classifier.get_classifier", lambda: Classifier())
    result = refine_detection(Image.new("RGB", (10, 10)), {"food_label": "bowl", "confidence": 0.8, "bbox": [1, 1, 5, 5]})
    assert result["food_label"] == "chole"
    assert result["detection_confidence"] == 0.8
    assert result["classifier_confidence"] == 0.9


def test_refine_detection_marks_low_confidence_result_uncertain(monkeypatch):
    class Classifier:
        settings = ClassifierSettings(True, 0.8, None)

        def classify(self, image):
            return "chapati", 0.4

    monkeypatch.setattr("app.vision.indian_food_classifier.get_classifier", lambda: Classifier())
    result = refine_detection(Image.new("RGB", (10, 10)), {"food_label": "bowl", "confidence": 0.8, "bbox": [1, 1, 5, 5]})
    assert result["food_label"] == "bowl"
    assert result["uncertain"] is True
