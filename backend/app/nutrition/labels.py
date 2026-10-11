"""Canonical food labels shared by every food-entry path.

Mapping strategy
----------------
Every output label produced by dima806/indian_food_image_detection (80 classes)
is mapped here to the nearest canonical key in foods.json.  Where there is no
close match the label is left unmapped so compute_item_nutrition returns
nutrition_status="unknown" and the frontend prompts the user to correct it —
nutrition values are never invented for missing entries.

Alias keys must be the *normalised* form of the raw label
(re.sub(r"[^a-z0-9]+", "_", raw.strip().lower()).strip("_")), which is
exactly what normalize_food_label() produces before the dict lookup.
"""

import re

# Maps normalised raw labels → canonical nutrition-DB keys (foods.json "label").
ALIASES: dict[str, str] = {
    # ── common synonyms (voice / manual entry) ───────────────────────────────
    "roti": "chapati",
    "whole_wheat_roti": "chapati",
    "wheat_roti": "chapati",
    "phulka": "chapati",
    "chapatti": "chapati",
    "chawal": "rice",
    "plain_rice": "rice",
    "steamed_idli": "idli",
    "steamed_idly": "idli",
    "dal_fry": "dal",
    "curd": "dahi",
    "fresh_curd": "dahi",
    "yogurt": "dahi",
    "chana_masala": "chole",
    "kidney_beans": "rajma",
    "chai": "masala_chai",
    "anda": "boiled_egg",
    "egg": "boiled_egg",
    "chicken_tikka_masala": "chicken_curry",
    "gajar_ka_halwa": "halwa",
    "bandar_laddu": "ladoo",

    # ── dima806/indian_food_image_detection HF model → nutrition DB ───────────
    # Labels already present in foods.json are listed but need no alias;
    # they are included here only for the labels that differ slightly.

    # Lentil/curry dishes
    "dal_tadka": "dal",
    "daal_baati_churma": "dal",
    "kadhi_pakoda": "dal",

    # Paneer dishes
    "kadai_paneer": "paneer",
    "paneer_butter_masala": "palak_paneer",   # closest DB entry; user can correct

    # Vegetable dishes
    "bhindi_masala": "bhindi_sabzi",
    "aloo_matar": "aloo_gobi",
    "aloo_methi": "aloo_gobi",
    "aloo_shimla_mirch": "aloo_gobi",
    "dum_aloo": "aloo_gobi",
    "karela_bharta": "baingan_bharta",
    "litti_chokha": "baingan_bharta",
    "navrattan_korma": "mixed_vegetable_sabzi",
    "kofta": "mixed_vegetable_sabzi",

    # Breads / fried snacks
    "naan": "chapati",
    "misi_roti": "chapati",
    "makki_di_roti_sarson_da_saag": "chapati",
    "bhatura": "paratha",
    "daal_puri": "paratha",
    "kachori": "samosa",
    "aloo_tikki": "samosa",

    # Non-veg
    "butter_chicken": "chicken_curry",
    "chicken_tikka": "chicken_curry",
    "chicken_razala": "chicken_curry",
    "maach_jhol": "fish_curry",

    # Sweets / desserts
    "cham_cham": "gulab_jamun",
    "chikki": "roasted_peanuts",
    "dharwad_pedha": "gulab_jamun",
    "doodhpak": "kheer",
    "double_ka_meetha": "halwa",
    "gavvalu": "gulab_jamun",
    "ghevar": "jalebi",
    "imarti": "jalebi",
    "kajjikaya": "gulab_jamun",
    "kakinada_khaja": "jalebi",
    "kalakand": "kheer",
    "ledikeni": "gulab_jamun",
    "lyangcha": "gulab_jamun",
    "malapua": "halwa",
    "misti_doi": "dahi",
    "modak": "ladoo",
    "mysore_pak": "ladoo",
    "phirni": "kheer",
    "pithe": "kheer",
    "qubani_ka_meetha": "halwa",
    "rabri": "kheer",
    "ras_malai": "kheer",
    "rasgulla": "gulab_jamun",
    "sandesh": "gulab_jamun",
    "shankarpali": "gulab_jamun",
    "sheer_korma": "kheer",
    "sheera": "halwa",
    "shrikhand": "dahi",
    "sohan_halwa": "halwa",
    "sohan_papdi": "gulab_jamun",
    "sutar_feni": "jalebi",
    "chak_hao_kheer": "kheer",
    "chhena_kheeri": "kheer",
    "adhirasam": "gulab_jamun",
    "anarsa": "gulab_jamun",
    "ariselu": "gulab_jamun",
    "basundi": "kheer",
    "boondi": "roasted_peanuts",
    "kuzhi_paniyaram": "idli",
    "poornalu": "gulab_jamun",
    "pootharekulu": "gulab_jamun",
    "unni_appam": "idli",
}


def normalize_food_label(label: str) -> str:
    """Normalise and alias a raw food label to its canonical nutrition-DB key."""
    key = re.sub(r"[^a-z0-9]+", "_", (label or "").strip().lower()).strip("_")
    return ALIASES.get(key, key)
