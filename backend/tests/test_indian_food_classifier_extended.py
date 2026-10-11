"""
Tests for the Indian food classifier, label-mapping, YOLO detector pipeline,
and portion/nutrition integration.

All tests use mocked inference — no network download or GPU is required.
The optional real-inference test is gated by the NUTRIVISION_TEST_IMAGE env var.
"""

import io
import os
import sys
import types

import pytest
from PIL import Image


# ─────────────────────────────────────────────────────────────────────────────
# 1. label normalisation & HF model → nutrition-DB mapping
# ─────────────────────────────────────────────────────────────────────────────

def _img_bytes(size=(8, 8)):
    buf = io.BytesIO()
    Image.new("RGB", size).save(buf, format="PNG")
    return buf.getvalue()


class TestNormalizeFoodLabel:
    def test_direct_label_passthrough(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("chapati") == "chapati"
        assert normalize_food_label("rice") == "rice"
        assert normalize_food_label("dal") == "dal"

    def test_alias_roti_to_chapati(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("roti") == "chapati"

    def test_hf_chana_masala_maps_to_chole(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("chana_masala") == "chole"

    def test_hf_dal_tadka_maps_to_dal(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("dal_tadka") == "dal"

    def test_hf_kadai_paneer_maps_to_paneer(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("kadai_paneer") == "paneer"

    def test_hf_paneer_butter_masala_maps_to_palak_paneer(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("paneer_butter_masala") == "palak_paneer"

    def test_hf_gajar_ka_halwa_maps_to_halwa(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("gajar_ka_halwa") == "halwa"

    def test_hf_bandar_laddu_maps_to_ladoo(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("bandar_laddu") == "ladoo"

    def test_hf_naan_maps_to_chapati(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("naan") == "chapati"

    def test_hf_butter_chicken_maps_to_chicken_curry(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("butter_chicken") == "chicken_curry"

    def test_hf_maach_jhol_maps_to_fish_curry(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("maach_jhol") == "fish_curry"

    def test_spaces_and_mixed_case_normalised(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("  Dal Tadka  ") == "dal"

    def test_unknown_label_passes_through_unchanged(self):
        from app.nutrition.labels import normalize_food_label
        # Unknown labels should NOT be aliased to anything — returns as-is so
        # the nutrition layer can return status="unknown" and ask the user.
        result = normalize_food_label("totally_unknown_food_xyz")
        assert result == "totally_unknown_food_xyz"

    def test_all_hf_model_labels_produce_a_result(self):
        """Every label the HF model can output should normalise without error."""
        from app.nutrition.labels import normalize_food_label
        hf_labels = [
            "adhirasam", "aloo_gobi", "aloo_matar", "aloo_methi",
            "aloo_shimla_mirch", "aloo_tikki", "anarsa", "ariselu",
            "bandar_laddu", "basundi", "bhatura", "bhindi_masala",
            "biryani", "boondi", "butter_chicken", "chak_hao_kheer",
            "cham_cham", "chana_masala", "chapati", "chhena_kheeri",
            "chicken_razala", "chicken_tikka", "chicken_tikka_masala",
            "chikki", "daal_baati_churma", "daal_puri", "dal_makhani",
            "dal_tadka", "dharwad_pedha", "doodhpak", "double_ka_meetha",
            "dum_aloo", "gajar_ka_halwa", "gavvalu", "ghevar", "gulab_jamun",
            "imarti", "jalebi", "kachori", "kadai_paneer", "kadhi_pakoda",
            "kajjikaya", "kakinada_khaja", "kalakand", "karela_bharta",
            "kofta", "kuzhi_paniyaram", "lassi", "ledikeni", "litti_chokha",
            "lyangcha", "maach_jhol", "makki_di_roti_sarson_da_saag",
            "malapua", "misi_roti", "misti_doi", "modak", "mysore_pak",
            "naan", "navrattan_korma", "palak_paneer", "paneer_butter_masala",
            "phirni", "pithe", "poha", "poornalu", "pootharekulu",
            "qubani_ka_meetha", "rabri", "ras_malai", "rasgulla", "sandesh",
            "shankarpali", "sheer_korma", "sheera", "shrikhand", "sohan_halwa",
            "sohan_papdi", "sutar_feni", "unni_appam",
        ]
        for label in hf_labels:
            result = normalize_food_label(label)
            assert isinstance(result, str) and result, f"normalize_food_label({label!r}) returned empty"


# ─────────────────────────────────────────────────────────────────────────────
# 2. Nutrition lookup — mapped labels must resolve to real DB entries
# ─────────────────────────────────────────────────────────────────────────────

class TestNutritionLookupForHFLabels:
    def test_chana_masala_resolves_to_chole_nutrition(self):
        from app.nutrition.database import get_nutrition_per_100g
        from app.nutrition.labels import normalize_food_label
        result = get_nutrition_per_100g(normalize_food_label("chana_masala"))
        assert result is not None
        assert result["kcal"] > 0

    def test_dal_tadka_resolves_to_dal_nutrition(self):
        from app.nutrition.database import get_nutrition_per_100g
        result = get_nutrition_per_100g("dal_tadka")
        assert result is not None

    def test_unknown_label_returns_none(self):
        from app.nutrition.database import get_nutrition_per_100g
        assert get_nutrition_per_100g("xyzzy_not_a_food") is None

    def test_compute_item_nutrition_unknown_label(self):
        from app.nutrition.calculator import compute_item_nutrition
        from app.nutrition.models import FoodItemInput
        result = compute_item_nutrition(FoodItemInput(food_label="xyzzy_not_a_food", estimated_grams=100))
        assert result.nutrition_status == "unknown"
        assert result.nutrition is None

    def test_compute_item_nutrition_palak_paneer_hf_label(self):
        """paneer_butter_masala (HF) → palak_paneer (DB) must yield real macros."""
        from app.nutrition.calculator import compute_item_nutrition
        from app.nutrition.models import FoodItemInput
        result = compute_item_nutrition(FoodItemInput(food_label="paneer_butter_masala", estimated_grams=150))
        assert result.nutrition_status == "ok"
        assert result.nutrition is not None
        assert result.nutrition.calories > 0

    def test_portion_recalculation_scales_linearly(self):
        from app.nutrition.calculator import compute_item_nutrition
        from app.nutrition.models import FoodItemInput
        r100 = compute_item_nutrition(FoodItemInput(food_label="rice", estimated_grams=100))
        r200 = compute_item_nutrition(FoodItemInput(food_label="rice", estimated_grams=200))
        assert r200.nutrition.calories == pytest.approx(r100.nutrition.calories * 2, abs=1)

    def test_zero_grams_returns_zero_nutrition(self):
        from app.nutrition.calculator import compute_item_nutrition
        from app.nutrition.models import FoodItemInput
        result = compute_item_nutrition(FoodItemInput(food_label="rice", estimated_grams=0))
        assert result.nutrition_status == "ok"
        assert result.nutrition.calories == 0

    def test_missing_grams_returns_missing_grams_status(self):
        from app.nutrition.calculator import compute_item_nutrition
        from app.nutrition.models import FoodItemInput
        result = compute_item_nutrition(FoodItemInput(food_label="rice", estimated_grams=None))
        assert result.nutrition_status == "missing_grams"


# ─────────────────────────────────────────────────────────────────────────────
# 3. YOLO detector — COCO checkpoint guard
# ─────────────────────────────────────────────────────────────────────────────

class TestYOLO26SegDetectorCOCOGuard:
    def test_coco_checkpoint_is_rejected(self, monkeypatch):
        """The resident backend/yolo26n-seg.pt is COCO-80; must raise RuntimeError."""
        import app.vision.detector as mod

        monkeypatch.setattr("app.vision.detector.os.path.isfile", lambda p: True)

        class COCOSegYOLO:
            task = "segment"
            names = {i: n for i, n in enumerate([
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
            ])}

            def __init__(self, path):
                pass

        monkeypatch.setitem(sys.modules, "ultralytics", types.SimpleNamespace(YOLO=COCOSegYOLO))

        with pytest.raises(RuntimeError, match="COCO-80"):
            mod.YOLO26SegDetector(mod.VisionSettings("fake.pt", 0.25, 640, None))

    def test_food_trained_checkpoint_is_accepted(self, monkeypatch):
        """A checkpoint whose classes are Indian food names should be accepted."""
        import app.vision.detector as mod

        monkeypatch.setattr("app.vision.detector.os.path.isfile", lambda p: True)

        class FoodSegYOLO:
            task = "segment"
            names = {0: "chapati", 1: "rice", 2: "dal", 3: "paneer"}
            boxes = []
            masks = None

            def __init__(self, path):
                pass

            def predict(self, *a, **kw):
                return [self]

        monkeypatch.setitem(sys.modules, "ultralytics", types.SimpleNamespace(YOLO=FoodSegYOLO))
        # Should not raise:
        detector = mod.YOLO26SegDetector(mod.VisionSettings("food.pt", 0.25, 640, None))
        assert detector is not None

    def test_mock_detector_requires_explicit_env_flag(self, monkeypatch):
        """USE_MOCK_DETECTOR must be explicitly set to 'true'; absent → RuntimeError."""
        import app.vision.detector as mod
        monkeypatch.delenv("USE_MOCK_DETECTOR", raising=False)
        monkeypatch.delenv("YOLO_CHECKPOINT_PATH", raising=False)
        mod._get_detector.cache_clear()
        with pytest.raises(RuntimeError, match="not configured"):
            mod.get_detector()
        mod._get_detector.cache_clear()


# ─────────────────────────────────────────────────────────────────────────────
# 4. Indian food classifier — mocked inference
# ─────────────────────────────────────────────────────────────────────────────

class TestIndianFoodClassifierMocked:
    def test_refine_detection_returns_detection_unchanged_when_classifier_disabled(self, monkeypatch):
        monkeypatch.setattr("app.vision.indian_food_classifier.get_classifier", lambda: None)
        from app.vision.indian_food_classifier import refine_detection
        detection = {"food_label": "bowl", "confidence": 0.8}
        result = refine_detection(Image.new("RGB", (10, 10)), detection)
        assert result is detection

    def test_refine_detection_no_bbox_skips_crop(self, monkeypatch):
        """Without a bbox the classifier cannot crop; detection returned unchanged."""
        class FakeClassifier:
            settings = __import__("app.vision.indian_food_classifier", fromlist=["ClassifierSettings"]).ClassifierSettings(True, 0.6, None)
            call_count = 0

            def classify(self, image):
                self.call_count += 1
                return "chapati", 0.9

        clf = FakeClassifier()
        monkeypatch.setattr("app.vision.indian_food_classifier.get_classifier", lambda: clf)
        from app.vision.indian_food_classifier import refine_detection
        detection = {"food_label": "bowl", "confidence": 0.8}  # no bbox
        result = refine_detection(Image.new("RGB", (10, 10)), detection)
        assert clf.call_count == 0
        assert result is detection

    def test_classifier_requires_transformers_and_torch(self, monkeypatch):
        """If transformers is missing, ClassifierSettings instantiation succeeds
        but IndianFoodClassifier.__init__ must raise RuntimeError."""
        monkeypatch.setitem(sys.modules, "transformers", None)
        monkeypatch.setitem(sys.modules, "torch", None)
        from app.vision.indian_food_classifier import ClassifierSettings, IndianFoodClassifier
        with pytest.raises(RuntimeError, match="transformers and torch"):
            IndianFoodClassifier(ClassifierSettings(True, 0.6, None))


# ─────────────────────────────────────────────────────────────────────────────
# 5. Portion estimation
# ─────────────────────────────────────────────────────────────────────────────

class TestPortionEstimator:
    def test_pixels_per_cm_basic(self):
        from app.portion.estimator import pixels_per_cm
        assert pixels_per_cm(100, 10) == pytest.approx(10.0)

    def test_pixels_per_cm_zero_denominator_raises(self):
        from app.portion.estimator import pixels_per_cm
        with pytest.raises(ValueError):
            pixels_per_cm(100, 0)

    def test_estimate_grams_from_area_known_food(self):
        from app.portion.estimator import estimate_grams_from_area
        from app.portion.database import DEFAULT_HEIGHT_CM, DEFAULT_DENSITY_G_PER_CM3
        # foods.json chapati record has no height_cm / density_g_per_cm3 columns,
        # so get_portion_defaults falls back to the module-level defaults.
        # pixel_area=100, px_per_cm=10 → area_cm2=1.0
        # grams = area_cm2 * DEFAULT_HEIGHT_CM * DEFAULT_DENSITY_G_PER_CM3
        expected = 1.0 * DEFAULT_HEIGHT_CM * DEFAULT_DENSITY_G_PER_CM3
        grams = estimate_grams_from_area(100.0, "chapati", 10.0)
        assert grams == pytest.approx(expected, abs=0.05)

    def test_estimate_grams_unknown_food_uses_defaults(self):
        from app.portion.estimator import estimate_grams_from_area
        # Falls back to DEFAULT_HEIGHT_CM=2.0, DEFAULT_DENSITY=0.85
        grams = estimate_grams_from_area(100.0, "totally_unknown_food", 10.0)
        assert grams == pytest.approx(2.0 * 0.85, abs=0.1)

    def test_estimate_meal_from_detections_produces_food_item_inputs(self):
        from app.portion.estimator import estimate_meal_from_detections
        detections = [
            {"food_label": "rice", "pixel_area": 10000.0, "confidence": 0.9},
            {"food_label": "dal",  "pixel_area":  5000.0, "confidence": 0.85},
        ]
        items = estimate_meal_from_detections(detections, 200, 10)
        assert len(items) == 2
        assert items[0].food_label == "rice"
        assert items[0].estimated_grams > 0
        assert items[1].food_label == "dal"


# ─────────────────────────────────────────────────────────────────────────────
# 6. Real-image integration test (optional — skipped in CI unless env var set)
# ─────────────────────────────────────────────────────────────────────────────

@pytest.mark.skipif(
    not os.environ.get("NUTRIVISION_TEST_IMAGE"),
    reason="Set NUTRIVISION_TEST_IMAGE=/path/to/image.jpg to run real HF inference",
)
def test_real_hf_inference_on_developer_image():
    """
    Runs dima806/indian_food_image_detection on a real image supplied by the
    developer.  Reports the predicted label and confidence score.

    Usage:
        NUTRIVISION_TEST_IMAGE=/path/to/thali.jpg \\
        INDIAN_FOOD_CLASSIFIER_ENABLED=true \\
        python -m pytest backend/tests/test_indian_food_classifier_extended.py \\
            -k test_real_hf_inference -s -v

    NOTE: This test makes no accuracy claims from a single image.  Its purpose
    is to confirm that the model loads, processes the image, and returns a
    genuine label — not a hardcoded or fabricated prediction.
    """
    image_path = os.environ["NUTRIVISION_TEST_IMAGE"]
    assert os.path.isfile(image_path), f"Image not found: {image_path}"

    from PIL import Image
    from app.vision.indian_food_classifier import ClassifierSettings, IndianFoodClassifier
    from app.nutrition.labels import normalize_food_label
    from app.nutrition.database import get_nutrition_per_100g

    settings = ClassifierSettings(enabled=True, confidence=0.0, device=None)
    clf = IndianFoodClassifier(settings)

    image = Image.open(image_path)
    label, score = clf.classify(image)

    canonical = normalize_food_label(label)
    nutrition = get_nutrition_per_100g(canonical)

    print(f"\n[REAL INFERENCE RESULT]")
    print(f"  Image       : {image_path}")
    print(f"  Raw label   : {label}")
    print(f"  Confidence  : {score:.4f}")
    print(f"  Canonical   : {canonical}")
    print(f"  Nutrition DB: {'FOUND — ' + str(nutrition) if nutrition else 'NOT FOUND (nutrition_status=unknown)'}")

    # Structural assertions — not accuracy assertions:
    assert isinstance(label, str) and label, "Model returned empty label"
    assert 0.0 <= score <= 1.0, f"Score out of range: {score}"
    assert isinstance(canonical, str) and canonical, "normalize_food_label returned empty"
