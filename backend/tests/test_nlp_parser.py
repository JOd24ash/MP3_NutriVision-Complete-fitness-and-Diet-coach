import pytest
from app.speech.nlp_parser import parse_transcript

@pytest.mark.parametrize("text,labels", [
    ("maine 3 idli aur ek katori sambar khayi", ["idli", "sambar"]),
    ("do roti, ek bowl dal aur thoda chawal", ["chapati", "dal", "rice"]),
    ("one paneer bowl", ["paneer"]), ("teen chapatti", ["chapati"]),
    ("aadha cup dahi", ["dahi"]), ("derh bowl rajma", ["rajma"]),
    ("dhai idli", ["idli"]), ("five spoon coconut chutney", ["coconut_chutney"]),
    ("ek plate chicken biryani", ["chicken_biryani"]), ("two dosa with sambar", ["dosa", "sambar"]),
    ("one glass lassi", ["lassi"]), ("do anda", ["boiled_egg"]),
    ("one bowl chole", ["chole"]), ("three phulka", ["chapati"]),
    ("one cup upma", ["upma"]), ("two samosa", ["samosa"]),
    ("one katori khichdi", ["khichdi"]), ("one bowl poha", ["poha"]),
    ("ek cup chai", ["masala_chai"]), ("two gulab jamun", ["gulab_jamun"]),
])
def test_hinglish_food_parser(text, labels):
    assert [item["food_label"] for item in parse_transcript(text)] == labels
