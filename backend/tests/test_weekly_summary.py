from datetime import date, datetime
import pytest
from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.db.models import Base, User, FitnessGoal, MealLog, MealItem, MealSource
from app.main import weekly_summary


@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


def test_weekly_summary_requires_fitness_goal(test_db):
    user = User(id="user_1", email="test@nutrivision.ai", hashed_password="pw", name="Tester")
    test_db.add(user)
    test_db.commit()

    with pytest.raises(HTTPException) as exc:
        weekly_summary(user_id="user_1", anchor_date=date(2026, 10, 14), db=test_db, current_user=user)
    assert exc.value.status_code == 409
    assert "profile" in exc.value.detail.lower()


def test_weekly_summary_computes_7_days_and_aggregates(test_db):
    user = User(id="user_2", email="user2@nutrivision.ai", hashed_password="pw", name="Athletic User")
    test_db.add(user)
    goal = FitnessGoal(
        user_id="user_2",
        age=28,
        sex="male",
        height_cm=180.0,
        weight_kg=75.0,
        activity_level="moderate",
        goal="gain",
        diet_preference="veg"
    )
    test_db.add(goal)
    test_db.commit()

    anchor = date(2026, 10, 14)

    # Add a confirmed meal on anchor date (Oct 14)
    meal = MealLog(
        id="meal_1",
        user_id="user_2",
        logged_at=datetime(2026, 10, 14, 13, 0),
        meal_type="lunch",
        source=MealSource.manual,
        confirmed="true"
    )
    test_db.add(meal)
    # 150g paneer = ~390 kcal, ~27g protein, ~4.5g carbs, ~31.5g fat
    item = MealItem(
        id="item_1",
        meal_log_id="meal_1",
        food_label="paneer",
        calories=390.0,
        protein_g=27.0,
        carbs_g=4.5,
        fat_g=31.5,
        est_grams=150.0
    )
    test_db.add(item)
    test_db.commit()

    res = weekly_summary(user_id="user_2", anchor_date=anchor, db=test_db, current_user=user)

    assert res["week_start"] == "2026-10-08"
    assert res["week_end"] == "2026-10-14"
    assert len(res["days"]) == 7

    # The last day in the list is anchor date
    today_entry = res["days"][-1]
    assert today_entry["date"] == "2026-10-14"
    assert today_entry["has_data"] is True
    assert today_entry["consumed"]["protein_g"] == 27.0
    assert today_entry["consumed"]["calories"] == 390.0

    # Earlier days have 0
    earlier_entry = res["days"][0]
    assert earlier_entry["date"] == "2026-10-08"
    assert earlier_entry["has_data"] is False
    assert earlier_entry["consumed"]["protein_g"] == 0.0

    # Totals and averages
    assert res["totals_consumed"]["protein_g"] == 27.0
    assert res["totals_consumed"]["calories"] == 390.0
    assert res["avg_consumed"]["protein_g"] == round(27.0 / 7, 1)

    # Personalized targets are present
    assert res["target"]["protein_g"] > 0
    assert res["target"]["calories"] > 0
