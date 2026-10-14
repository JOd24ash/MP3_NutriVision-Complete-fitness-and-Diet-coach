"""
RAG chatbot orchestration for the `/chat` endpoint.

Flow:
  1. Retrieve top-k KB chunks for the question.
  2. Fold in any guardrail flags from the user's medical profile / recent meal.
  3. Inject the user's personal profile (age, weight, goal, allergies, etc.)
     so the AI can answer questions like "how is my profile".
  4. Build a prompt that restricts the model to the retrieved context.
  5. Call Groq LLM → return answer + source citations + guardrail flags.
"""

import os
import httpx
from typing import Dict, List, Optional, Any

from ..guardrails.models import MealItemRow
from .models import ChatRequest, ChatResponse, RetrievedChunk, SourceCitation
from .retriever import retrieve

SYSTEM_PROMPT = (
    "You are NutriVision's helpful Indian nutrition and fitness coach. "
    "Answer questions about the user's meals, diet, fitness, profile, and this website clearly and practically. "
    "When a user asks about their profile, use the USER PROFILE section to give a detailed, personalised summary. "
    "Use the supplied CONTEXT and USER FLAGS when they are relevant. "
    "Do not contradict allergy or medical-condition flags. "
    "Do not diagnose, prescribe, or replace a clinician; recommend professional care for urgent, severe, or personalised medical questions."
)

DEFAULT_MODEL = os.environ.get("NUTRIVISION_LLM_MODEL", "llama-3.3-70b-versatile")
MAX_GROUNDING_DISTANCE = float(os.environ.get("RAG_MAX_DISTANCE", "1.2"))

# Goal/activity labels for human-readable output
_GOAL_LABELS = {
    "gain": "Gain weight / Build muscle",
    "lose": "Lose weight / Fat loss",
    "maintain": "Maintain weight",
    "fitness": "Improve fitness",
    "general_fitness": "General fitness",
}
_ACTIVITY_LABELS = {
    "sedentary": "Sedentary",
    "light": "Lightly active",
    "moderate": "Moderately active",
    "active": "Very active",
    "very_active": "Extremely active",
}


def guardrail_flags_from_meal_items(rows: List[MealItemRow]) -> List[str]:
    flags = []
    for row in rows:
        if row.guardrail_status != "ok":
            reason = f" — {row.guardrail_reason}" if row.guardrail_reason else ""
            flags.append(f"{row.guardrail_status}: {row.food_label}{reason}")
    return flags


def _format_profile(profile: Dict[str, Any]) -> str:
    """Render the user profile dict as a readable block for the LLM prompt."""
    if not profile:
        return "(No profile data available — user has not completed their profile yet.)"

    lines = []
    if profile.get("name"):
        lines.append(f"Name: {profile['name']}")
    if profile.get("age"):
        lines.append(f"Age: {profile['age']} years")
    if profile.get("sex"):
        lines.append(f"Sex: {profile['sex'].capitalize()}")
    if profile.get("weight_kg"):
        lines.append(f"Weight: {profile['weight_kg']} kg")
    if profile.get("height_cm"):
        lines.append(f"Height: {profile['height_cm']} cm")
    if profile.get("activity_level"):
        label = _ACTIVITY_LABELS.get(profile["activity_level"], profile["activity_level"])
        lines.append(f"Activity level: {label}")
    if profile.get("goal"):
        label = _GOAL_LABELS.get(profile["goal"], profile["goal"])
        lines.append(f"Health goal: {label}")
    if profile.get("diet_preference"):
        lines.append(f"Diet preference: {profile['diet_preference'].replace('_', ' ').capitalize()}")

    conditions = profile.get("conditions") or []
    allergies = profile.get("allergies") or []
    lines.append(f"Medical conditions: {', '.join(conditions) if conditions else 'None'}")
    lines.append(f"Food allergies: {', '.join(allergies) if allergies else 'None'}")

    return "\n".join(lines)


def build_prompt(
    message: str,
    chunks: List[RetrievedChunk],
    guardrail_flags: List[str],
    user_profile: Optional[Dict[str, Any]] = None,
) -> str:
    context_block = (
        "\n\n".join(f"[{c.source_title}]\n{c.text}" for c in chunks)
        or "(no relevant context found — answer from general nutrition knowledge)"
    )
    flags_block = "\n".join(f"- {f}" for f in guardrail_flags) or "(none)"
    profile_block = _format_profile(user_profile or {})

    return (
        f"CONTEXT:\n{context_block}\n\n"
        f"USER PROFILE:\n{profile_block}\n\n"
        f"USER FLAGS:\n{flags_block}\n\n"
        f"QUESTION:\n{message}"
    )


def generate_answer(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Calls Groq without exposing the server-side API key to the browser."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise RuntimeError(
            "GROQ_API_KEY is not set — add it to backend/.env before using chat."
        )

    response = httpx.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "model": model,
            "messages": [
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
            "temperature": 0.3,
            "max_completion_tokens": 700,
        },
        timeout=30.0,
    )
    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as error:
        raise RuntimeError(
            f"Groq could not complete the chat request (HTTP {error.response.status_code})."
        ) from error

    data = response.json()
    answer = data.get("choices", [{}])[0].get("message", {}).get("content", "")
    if not answer:
        raise RuntimeError("Groq returned an empty response.")
    return answer


def answer_chat(
    request: ChatRequest,
    meal_items: Optional[List[MealItemRow]] = None,
    user_profile: Optional[Dict[str, Any]] = None,
    k: int = 3,
) -> ChatResponse:
    chunks = retrieve(request.message, k=k)
    guardrail_flags = guardrail_flags_from_meal_items(meal_items) if meal_items else []
    prompt = build_prompt(request.message, chunks, guardrail_flags, user_profile)

    answer = generate_answer(prompt)

    sources = [SourceCitation(title=c.source_title, chunk_ref=c.chunk_id) for c in chunks]
    return ChatResponse(answer=answer, sources=sources, guardrail_flags=guardrail_flags)
