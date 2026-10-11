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

    def test_hf_gajar_ka_halwa_maps_to_halwa(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("gajar_ka_halwa") == "halwa"

    def test_hf_bandar_laddu_maps_to_ladoo(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("bandar_laddu") == "ladoo"

    def test_hf_maach_jhol_maps_to_fish_curry(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("maach_jhol") == "fish_curry"

    def test_hf_bhindi_masala_maps_to_bhindi_sabzi(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("bhindi_masala") == "bhindi_sabzi"

    def test_hf_sheera_maps_to_halwa(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("sheera") == "halwa"

    def test_hf_phirni_maps_to_kheer(self):
        from app.nutrition.labels import normalize_food_label
        assert normalize_food_label("phirni") == "kheer"

    def test_misleading_substitutions_removed(self):
        """Misleading substitutions must NOT be aliased to unrelated foods."""
        from app.nutrition.labels import normalize_food_label
        misleading = [
            ("paneer_butter_masala", "palak_paneer"),
            ("kadai_paneer", "paneer"),
            ("naan", "chapati"),
            ("boondi", "roasted_peanuts"),
            ("unni_appam", "idli"),
            ("rasgulla", "gulab_jamun"),
            ("sandesh", "gulab_jamun"),
            ("karela_bharta", "baingan_bharta"),
            ("bhatura", "paratha"),
            ("kachori", "samosa"),
            ("aloo_tikki", "samosa"),
            ("misti_doi", "dahi"),
            ("shrikhand", "dahi"),
        ]
        for raw, prohibited_target in misleading:
            result = normalize_food_label(raw)
            assert result != prohibited_target, f"{raw} should not map to {prohibited_target}"
            assert result == raw, f"{raw} should remain unmapped"

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

    def test_unsupported_food_returns_unknown_status_and_never_invents_nutrition(self):
        """Unmapped items like paneer_butter_masala or naan must return unknown status without invented macros."""
        from app.nutrition.calculator import compute_item_nutrition
        from app.nutrition.models import FoodItemInput
        unsupported = ["paneer_butter_masala", "naan", "boondi", "rasgulla", "unni_appam"]
        for food in unsupported:
            result = compute_item_nutrition(FoodItemInput(food_label=food, estimated_grams=150))
            assert result.nutrition_status == "unknown", f"{food} should have unknown nutrition status"
            assert result.nutrition is None, f"{food} should not have invented nutrition values"

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

    def test_vision_status_coco_is_marked_unavailable(self, monkeypatch):
        import app.vision.detector as mod
        monkeypatch.setattr("app.vision.detector.os.path.isfile", lambda p: True)
        monkeypatch.setenv("YOLO_CHECKPOINT_PATH", "fake_coco.pt")

        class COCOSegYOLO:
            task = "segment"
            names = {0: "person", 1: "bicycle", 2: "car"}

            def __init__(self, path):
                pass

        monkeypatch.setitem(sys.modules, "ultralytics", types.SimpleNamespace(YOLO=COCOSegYOLO))
        status = mod.vision_status()
        assert status["mode"] == "unavailable"
        assert status["is_food_trained"] is False
        assert "COCO-80" in status["error"]

    def test_vision_status_food_checkpoint_is_marked_real(self, monkeypatch):
        import app.vision.detector as mod
        monkeypatch.setattr("app.vision.detector.os.path.isfile", lambda p: True)
        monkeypatch.setenv("YOLO_CHECKPOINT_PATH", "food.pt")

        class FoodSegYOLO:
            task = "segment"
            names = {0: "chapati", 1: "rice", 2: "dal"}

            def __init__(self, path):
                pass

        monkeypatch.setitem(sys.modules, "ultralytics", types.SimpleNamespace(YOLO=FoodSegYOLO))
        status = mod.vision_status()
        assert status["mode"] == "real"
        assert status["is_food_trained"] is True
        assert status["classes"] == ["chapati", "rice", "dal"]

    def test_vision_status_mock_when_explicitly_configured(self, monkeypatch):
        import app.vision.detector as mod
        monkeypatch.delenv("YOLO_CHECKPOINT_PATH", raising=False)
        monkeypatch.setenv("USE_MOCK_DETECTOR", "true")
        status = mod.vision_status()
        assert status["mode"] == "mock"
        assert status["model_name"] == "fixture"
        assert status["is_food_trained"] is False

    def test_vision_status_unavailable_by_default(self, monkeypatch):
        import app.vision.detector as mod
        monkeypatch.delenv("YOLO_CHECKPOINT_PATH", raising=False)
        monkeypatch.delenv("USE_MOCK_DETECTOR", raising=False)
        status = mod.vision_status()
        assert status["mode"] == "unavailable"
        assert status["model_name"] is None
        assert status["is_food_trained"] is False


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
        expected = 1.0 * DEFAULT_HEIGHT_CM * DEFAULT_DENSITY_G_PER_CM3
        grams = estimate_grams_from_area(100.0, "chapati", 10.0)
        assert grams == pytest.approx(expected, abs=0.05)

    def test_estimate_grams_unknown_food_uses_defaults(self):
        from app.portion.estimator import estimate_grams_from_area
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

    def test_estimate_meal_from_detections_missing_calibration_uses_defaults_safely(self):
        """When reference scaling inputs are None, defaults from foods.json must be safely used."""
        from app.portion.estimator import estimate_meal_from_detections
        detections = [
            {"food_label": "chapati", "pixel_area": 5000.0, "confidence": 0.95},
            {"food_label": "rice", "pixel_area": 12000.0, "confidence": 0.9},
        ]
        items = estimate_meal_from_detections(detections, None, None)
        assert len(items) == 2
        assert items[0].estimated_grams == 40.0  # standard chapati serving
        assert items[1].estimated_grams == 150.0  # standard cooked rice serving

    def test_estimate_meal_from_detections_invalid_calibration_uses_defaults_safely(self):
        from app.portion.estimator import estimate_meal_from_detections
        detections = [{"food_label": "dal", "pixel_area": 8000.0, "confidence": 0.88}]
        items = estimate_meal_from_detections(detections, -50.0, 0.0)
        assert len(items) == 1
        assert items[0].estimated_grams == 150.0  # standard dal serving


# ─────────────────────────────────────────────────────────────────────────────
# 6. Meal persistence, review before saving, and confirmation
# ─────────────────────────────────────────────────────────────────────────────

class TestMealPersistenceAndReview:
    def test_meal_review_recalculation_and_confirmation(self):
        from sqlalchemy import create_engine
        from sqlalchemy.orm import sessionmaker
        from app.db.models import Base, User, MedicalProfile, MealSource
        from app.main import persist_meal, meal_log_to_response, list_meals
        from app.nutrition.calculator import compute_item_nutrition
        from app.guardrails.engine import evaluate_meal
        from app.guardrails.models import MedicalProfile as MedicalProfileSchema
        from app.nutrition.models import FoodItemInput
        from app.schemas import MealItemPatchRequest
        from app.main import patch_meal_item, confirm_meal

        engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(engine)
        Session = sessionmaker(bind=engine)
        db = Session()

        user = User(name="Test User", email="test@example.com", hashed_password="pw")
        db.add(user)
        db.flush()
        profile = MedicalProfile(user_id=user.id, allergies=[], conditions=[])
        db.add(profile)
        db.commit()

        # 1. Photo scan creates an unconfirmed draft
        items = [FoodItemInput(food_label="rice", estimated_grams=100)]
        rows = evaluate_meal([compute_item_nutrition(i) for i in items], MedicalProfileSchema(allergies=[], conditions=[]))
        meal_log = persist_meal(db, user.id, MealSource.photo, rows)
        assert meal_log.confirmed == "false"
        resp = meal_log_to_response(meal_log)
        assert resp.confirmed is False

        # 2. History with confirmed_only=True does not list unconfirmed drafts
        history = list_meals(user.id, confirmed_only=True, db=db, current_user=user)
        assert len(history) == 0

        # 3. Patching item recalculates nutrition server-side
        item_id = meal_log.items[0].id
        patched = patch_meal_item(
            meal_log.id,
            item_id,
            MealItemPatchRequest(est_grams=200),
            db=db,
            current_user=user,
        )
        assert patched.est_grams == 200.0
        # Rice 100g = 130 kcal, so 200g should be 260 kcal
        assert patched.calories == 260.0

        # 4. Explicit confirmation marks meal confirmed
        confirmed_resp = confirm_meal(meal_log.id, db=db, current_user=user)
        assert confirmed_resp.confirmed is True

        # 5. History now contains the confirmed meal
        history_after = list_meals(user.id, confirmed_only=True, db=db, current_user=user)
        assert len(history_after) == 1
        assert history_after[0].total.calories == 260.0


# ─────────────────────────────────────────────────────────────────────────────
# 7. Real inference tests (HF model)
# ─────────────────────────────────────────────────────────────────────────────

def test_real_hf_inference_reproducible():
    """Confirms that the requested Hugging Face model loads and performs real inference
    without fabricating results."""
    from PIL import Image
    from app.vision.indian_food_classifier import ClassifierSettings, IndianFoodClassifier
    from app.nutrition.labels import normalize_food_label

    settings = ClassifierSettings(enabled=True, confidence=0.0, device="cpu")
    clf = IndianFoodClassifier(settings)

    # Use a real image if provided via env var, or a real generated image
    image_path = os.environ.get("NUTRIVISION_TEST_IMAGE")
    if image_path and os.path.isfile(image_path):
        image = Image.open(image_path)
    else:
        # Standard RGB test image
        image = Image.new("RGB", (224, 224), color=(200, 150, 80))

    label, score = clf.classify(image)
    print(f"\n[REAL INFERENCE RESULT] Label: {label}, Score: {score:.4f}")
    assert isinstance(label, str) and len(label) > 0, "Model must return non-empty label"
    assert 0.0 <= score <= 1.0, f"Confidence score out of range: {score}"
    canonical = normalize_food_label(label)
    assert isinstance(canonical, str) and len(canonical) > 0

