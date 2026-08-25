"""
Bootstrap-only fallback knowledge base.

These are illustrative, generically-written nutrition notes — NOT sourced
from or claiming to be actual ICMR guideline text. They exist purely so
`ingest.py` / `retriever.py` have something to embed and query while the
real, vetted `knowledge_base/icmr_guidelines/` folder (see readme.MD /
DATA_MODEL.md) is still being curated. Swap this out — don't ship it.
"""

from typing import TypedDict


class KBDoc(TypedDict):
    doc_id: str
    source_title: str
    text: str


SAMPLE_KB: list[KBDoc] = [
    {
        "doc_id": "diabetes_carbs_001",
        "source_title": "Sample note — diabetes & carbohydrate portions",
        "text": (
            "For a diabetic profile, meals built around refined-flour breads and "
            "large servings of white rice can raise blood sugar quickly because "
            "of their high glycemic load. Favoring smaller portions, pairing "
            "carbs with protein or fiber, and monitoring total carbohydrate "
            "grams per meal is generally recommended for a diabetic diet."
        ),
    },
    {
        "doc_id": "hypertension_sodium_001",
        "source_title": "Sample note — hypertension & sodium intake",
        "text": (
            "For hypertension, added salt in preparation is one of the largest "
            "contributors to daily sodium intake. Dairy-based items like paneer "
            "are often salted during preparation or serving, so portion and "
            "preparation style matter as much as the ingredient itself."
        ),
    },
    {
        "doc_id": "ckd_potassium_phosphorus_001",
        "source_title": "Sample note — kidney disease, potassium & phosphorus",
        "text": (
            "For chronic kidney disease (CKD), legumes such as dal and dairy "
            "products such as paneer tend to be relatively high in potassium "
            "and phosphorus respectively. Portion control and consulting a "
            "renal dietitian is recommended rather than full avoidance in most "
            "early-stage cases."
        ),
    },
    {
        "doc_id": "allergy_general_001",
        "source_title": "Sample note — food allergies & cross-contact",
        "text": (
            "When a declared allergy matches an ingredient in a detected dish, "
            "the safest default is to treat the item as unsafe to eat rather "
            "than assume a small amount is fine, since preparation methods and "
            "cross-contact can't be confirmed from a photo alone."
        ),
    },
    {
        "doc_id": "thali_balance_001",
        "source_title": "Sample note — balancing a mixed thali plate",
        "text": (
            "A balanced thali generally combines a grain (rice or chapati), a "
            "protein source (dal, paneer, or a non-veg item), a vegetable "
            "preparation, and a small amount of fat (ghee or oil). Portion "
            "balance across these groups matters more than eliminating any one "
            "group entirely."
        ),
    },
]
