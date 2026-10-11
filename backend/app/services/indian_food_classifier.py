```python
from functools import lru_cache

import torch
from PIL import Image
from transformers import pipeline

MODEL_ID = "dima806/indian_food_image_detection"


@lru_cache(maxsize=1)
def get_classifier():
    """Load the model once per Python process."""
    device = 0 if torch.cuda.is_available() else -1

    return pipeline(
        task="image-classification",
        model=MODEL_ID,
        device=device,
    )


def classify_food(image: Image.Image, top_k: int = 5) -> list[dict]:
    """
    Classify one food image or one crop from a detector.

    Returns ranked labels and model scores. These scores are not
    guaranteed to be calibrated probabilities.
    """
    if image is None:
        raise ValueError("An image is required.")

    image = image.convert("RGB")
    classifier = get_classifier()
    results = classifier(image, top_k=top_k)

    return [
        {
            "label": item["label"],
            "score": float(item["score"]),
        }
        for item in results
    ]
```