"""
FastAPI gateway (ARCHITECTURE.md component 2) implementing the routes in
API_SPEC.md. Wires together the modules built in earlier phases:
nutrition (calories/macros), guardrails (allergy/condition checks), rag
(chatbot), plus vision/speech (mock-backed until real checkpoints exist)
and portion estimation.

Run with: uvicorn app.main:app --reload   (see SETUP.md)
"""

from datetime import datetime
from typing import List, Optional

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from .auth.security import create_access_token, decode_access_token, hash_password, verify_password
from .db.models import GuardrailStatus as DBGuardrailStatus
from .db.models import MealItem, MealLog, MealSource, MedicalProfile, User
from .db.session import get_db, init_db
from .guardrails.engine import check_meal, evaluate_meal
from .guardrails.models import GuardrailCheckInput, GuardrailCheckResponse, MealItemRow, MedicalProfile as MedicalProfileSchema
from .nutrition.calculator import compute_item_nutrition
from .portion.estimator import estimate_meal_from_detections, estimate_meal_from_voice
from .rag.chat import answer_chat
from .rag.models import ChatRequest, ChatResponse
from .schemas import (
    HealthMetricIn,
    HealthMetricOut,
    LoginRequest,
    MealItemOut,
    MealItemPatchRequest,
    MealLogSummary,
    MealResponse,
    MealTotalOut,
    ProfileResponse,
    ProfileUpdateRequest,
    SignupRequest,
    TokenResponse,
)
from .speech.nlp_parser import parse_transcript
from .speech.transcriber import get_transcriber
from .vision.detector import get_detector

app = FastAPI(title="NutriVision API", version="0.1.0")

API_PREFIX = "/api/v1"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{API_PREFIX}/auth/login")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


# ---------------------------------------------------------------- helpers

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_self(user_id: str, current_user: User) -> None:
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized for this user")


def profile_to_schema(profile: Optional[MedicalProfile]) -> MedicalProfileSchema:
    if profile is None:
        return MedicalProfileSchema(allergies=[], conditions=[])
    return MedicalProfileSchema(allergies=profile.allergies or [], conditions=profile.conditions or [])


def row_to_out(row_id: str, row: MealItemRow) -> MealItemOut:
    return MealItemOut(
        id=row_id,
        food_label=row.food_label,
        confidence=row.confidence,
        est_grams=row.est_grams,
        calories=row.calories,
        protein_g=row.protein_g,
        carbs_g=row.carbs_g,
        fat_g=row.fat_g,
        guardrail_status=row.guardrail_status,
        guardrail_reason=row.guardrail_reason,
    )


def compute_total(rows: List[MealItemRow]) -> MealTotalOut:
    ok_rows = [r for r in rows if r.nutrition_status == "ok"]
    return MealTotalOut(
        calories=round(sum(r.calories or 0 for r in ok_rows)),
        protein_g=round(sum(r.protein_g or 0 for r in ok_rows), 1),
        carbs_g=round(sum(r.carbs_g or 0 for r in ok_rows), 1),
        fat_g=round(sum(r.fat_g or 0 for r in ok_rows), 1),
    )


def persist_meal(db: Session, user_id: str, source: MealSource, rows: List[MealItemRow]) -> MealLog:
    meal_log = MealLog(user_id=user_id, source=source)
    db.add(meal_log)
    db.flush()  # assigns meal_log.id

    for row in rows:
        db.add(
            MealItem(
                meal_log_id=meal_log.id,
                food_label=row.food_label,
                confidence=row.confidence,
                est_grams=row.est_grams,
                calories=row.calories,
                protein_g=row.protein_g,
                carbs_g=row.carbs_g,
                fat_g=row.fat_g,
                guardrail_status=DBGuardrailStatus(row.guardrail_status),
                guardrail_reason=row.guardrail_reason,
            )
        )
    db.commit()
    db.refresh(meal_log)
    return meal_log


def meal_log_to_response(meal_log: MealLog, transcript: Optional[str] = None) -> MealResponse:
    items_out = [
        MealItemOut(
            id=item.id,
            food_label=item.food_label,
            confidence=item.confidence,
            est_grams=item.est_grams,
            calories=item.calories,
            protein_g=item.protein_g,
            carbs_g=item.carbs_g,
            fat_g=item.fat_g,
            guardrail_status=item.guardrail_status.value,
            guardrail_reason=item.guardrail_reason,
        )
        for item in meal_log.items
    ]
    ok_items = [i for i in meal_log.items if i.calories is not None]
    total = MealTotalOut(
        calories=round(sum(i.calories or 0 for i in ok_items)),
        protein_g=round(sum(i.protein_g or 0 for i in ok_items), 1),
        carbs_g=round(sum(i.carbs_g or 0 for i in ok_items), 1),
        fat_g=round(sum(i.fat_g or 0 for i in ok_items), 1),
    )
    needs_review = any(i.guardrail_status.value == "unknown" for i in meal_log.items)
    return MealResponse(
        meal_log_id=meal_log.id,
        items=items_out,
        total=total,
        transcript=transcript,
        needs_manual_review=needs_review,
    )


# -------------------------------------------------------------------- auth

@app.post(f"{API_PREFIX}/auth/signup", response_model=TokenResponse)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(name=payload.name, email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.flush()
    db.add(MedicalProfile(user_id=user.id, allergies=[], conditions=[]))
    db.commit()
    db.refresh(user)

    return TokenResponse(access_token=create_access_token(user.id))


@app.post(f"{API_PREFIX}/auth/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    return TokenResponse(access_token=create_access_token(user.id))


# ------------------------------------------------------------- user/profile

@app.get(f"{API_PREFIX}/users/{{user_id}}/profile", response_model=ProfileResponse)
def get_profile(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    require_self(user_id, current_user)
    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == user_id).first()
    return ProfileResponse(
        user_id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        allergies=(profile.allergies if profile else []) or [],
        conditions=(profile.conditions if profile else []) or [],
    )


@app.put(f"{API_PREFIX}/users/{{user_id}}/profile", response_model=ProfileResponse)
def update_profile(
    user_id: str,
    payload: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_self(user_id, current_user)
    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == user_id).first()
    if profile is None:
        profile = MedicalProfile(user_id=user_id)
        db.add(profile)
    profile.allergies = payload.allergies
    profile.conditions = payload.conditions
    db.commit()

    return ProfileResponse(
        user_id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        allergies=profile.allergies,
        conditions=profile.conditions,
    )


# ------------------------------------------------------------ meal logging

@app.post(f"{API_PREFIX}/meals/photo", response_model=MealResponse)
async def log_meal_photo(
    user_id: str = Form(...),
    reference_object_px: float = Form(...),
    reference_object_real_cm: float = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_self(user_id, current_user)
    image_bytes = await image.read()

    detections = get_detector().detect(image_bytes)
    if not detections:
        raise HTTPException(status_code=422, detail="No items detected in image")

    food_items = estimate_meal_from_detections(detections, reference_object_px, reference_object_real_cm)
    nutrition_results = [compute_item_nutrition(i) for i in food_items]

    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == user_id).first()
    rows = evaluate_meal(nutrition_results, profile_to_schema(profile))

    meal_log = persist_meal(db, user_id, MealSource.photo, rows)
    return meal_log_to_response(meal_log)


@app.post(f"{API_PREFIX}/meals/voice", response_model=MealResponse)
async def log_meal_voice(
    user_id: str = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_self(user_id, current_user)
    audio_bytes = await audio.read()

    transcript = get_transcriber().transcribe(audio_bytes)
    parsed = parse_transcript(transcript)
    if not parsed:
        raise HTTPException(
            status_code=422,
            detail={"message": "Could not confidently parse any food items", "transcript": transcript},
        )

    food_items = estimate_meal_from_voice(parsed)
    nutrition_results = [compute_item_nutrition(i) for i in food_items]

    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == user_id).first()
    rows = evaluate_meal(nutrition_results, profile_to_schema(profile))

    meal_log = persist_meal(db, user_id, MealSource.voice, rows)
    return meal_log_to_response(meal_log, transcript=transcript)


@app.patch(f"{API_PREFIX}/meals/{{meal_log_id}}/items/{{item_id}}", response_model=MealItemOut)
def patch_meal_item(
    meal_log_id: str,
    item_id: str,
    payload: MealItemPatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = db.get(MealItem, item_id)
    if item is None or item.meal_log_id != meal_log_id:
        raise HTTPException(status_code=404, detail="Meal item not found")
    require_self(item.meal_log.user_id, current_user)

    food_label = payload.food_label or item.food_label
    est_grams = payload.est_grams if payload.est_grams is not None else item.est_grams

    from .nutrition.models import FoodItemInput

    nutrition_result = compute_item_nutrition(
        FoodItemInput(food_label=food_label, estimated_grams=est_grams, confidence=item.confidence)
    )
    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == item.meal_log.user_id).first()
    [row] = evaluate_meal([nutrition_result], profile_to_schema(profile))

    item.food_label = row.food_label
    item.est_grams = row.est_grams
    item.calories = row.calories
    item.protein_g = row.protein_g
    item.carbs_g = row.carbs_g
    item.fat_g = row.fat_g
    item.guardrail_status = DBGuardrailStatus(row.guardrail_status)
    item.guardrail_reason = row.guardrail_reason
    db.commit()
    db.refresh(item)

    return row_to_out(item.id, row)


@app.post(f"{API_PREFIX}/meals/{{meal_log_id}}/confirm", response_model=MealResponse)
def confirm_meal(
    meal_log_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    meal_log = db.get(MealLog, meal_log_id)
    if meal_log is None:
        raise HTTPException(status_code=404, detail="Meal log not found")
    require_self(meal_log.user_id, current_user)

    meal_log.confirmed = "true"
    db.commit()
    db.refresh(meal_log)
    return meal_log_to_response(meal_log)


# ---------------------------------------------------------------- history

@app.get(f"{API_PREFIX}/users/{{user_id}}/meals", response_model=List[MealLogSummary])
def list_meals(
    user_id: str,
    from_: Optional[datetime] = None,
    to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_self(user_id, current_user)
    query = db.query(MealLog).filter(MealLog.user_id == user_id)
    if from_:
        query = query.filter(MealLog.logged_at >= from_)
    if to:
        query = query.filter(MealLog.logged_at <= to)

    summaries = []
    for meal_log in query.order_by(MealLog.logged_at.desc()).all():
        response = meal_log_to_response(meal_log)
        summaries.append(
            MealLogSummary(
                meal_log_id=meal_log.id,
                logged_at=meal_log.logged_at,
                source=meal_log.source.value,
                items=response.items,
                total=response.total,
            )
        )
    return summaries


@app.get(f"{API_PREFIX}/users/{{user_id}}/health-metrics", response_model=List[HealthMetricOut])
def list_health_metrics(
    user_id: str,
    type: Optional[str] = None,
    from_: Optional[datetime] = None,
    to: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_self(user_id, current_user)
    from .db.models import HealthMetric

    query = db.query(HealthMetric).filter(HealthMetric.user_id == user_id)
    if type:
        query = query.filter(HealthMetric.metric_type == type)
    if from_:
        query = query.filter(HealthMetric.recorded_at >= from_)
    if to:
        query = query.filter(HealthMetric.recorded_at <= to)

    return [
        HealthMetricOut(
            id=m.id, metric_type=m.metric_type.value, value=m.value, unit=m.unit, recorded_at=m.recorded_at
        )
        for m in query.order_by(HealthMetric.recorded_at.desc()).all()
    ]


@app.post(f"{API_PREFIX}/users/{{user_id}}/health-metrics", response_model=HealthMetricOut)
def add_health_metric(
    user_id: str,
    payload: HealthMetricIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_self(user_id, current_user)
    from .db.models import HealthMetric

    metric = HealthMetric(user_id=user_id, metric_type=payload.metric_type, value=payload.value, unit=payload.unit)
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return HealthMetricOut(
        id=metric.id,
        metric_type=metric.metric_type.value,
        value=metric.value,
        unit=metric.unit,
        recorded_at=metric.recorded_at,
    )


# ------------------------------------------------------------- guardrails

@app.post(f"{API_PREFIX}/guardrails/check", response_model=GuardrailCheckResponse)
def guardrails_check(
    user_id: str,
    items: List[GuardrailCheckInput],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_self(user_id, current_user)
    profile = db.query(MedicalProfile).filter(MedicalProfile.user_id == user_id).first()
    return check_meal(items, profile_to_schema(profile))


# -------------------------------------------------------------------- chat

@app.post(f"{API_PREFIX}/chat", response_model=ChatResponse)
def chat(
    payload: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    require_self(payload.user_id, current_user)

    latest_meal = (
        db.query(MealLog)
        .filter(MealLog.user_id == payload.user_id)
        .order_by(MealLog.logged_at.desc())
        .first()
    )
    meal_rows: List[MealItemRow] = []
    if latest_meal:
        for item in latest_meal.items:
            meal_rows.append(
                MealItemRow(
                    food_label=item.food_label,
                    confidence=item.confidence,
                    est_grams=item.est_grams,
                    calories=item.calories,
                    protein_g=item.protein_g,
                    carbs_g=item.carbs_g,
                    fat_g=item.fat_g,
                    nutrition_status="ok" if item.calories is not None else "unknown",
                    guardrail_status=item.guardrail_status.value,
                    guardrail_reason=item.guardrail_reason,
                )
            )

    try:
        return answer_chat(payload, meal_items=meal_rows)
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
