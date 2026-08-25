"""
RAG chatbot orchestration for the `/chat` endpoint (API_SPEC.md).

Flow: retrieve top-k KB chunks for the question -> fold in any guardrail
flags from the user's medical profile / recent meal (ARCHITECTURE.md:
"Connect guardrail flags into chatbot context") -> build a prompt that
restricts the model to the retrieved context -> call the LLM -> return
answer + source citations + the guardrail flags that were surfaced.

The LLM call itself is intentionally pluggable (generate_answer). Swap
its body for whichever provider/SDK this deploys with; the retrieval,
prompt construction, and citation formatting around it don't change.
"""

import os
from typing import List, Optional

from ..guardrails.models import MealItemRow
from .models import ChatRequest, ChatResponse, RetrievedChunk, SourceCitation
from .retriever import retrieve

SYSTEM_PROMPT = (
    "You are a clinical nutrition assistant. Answer ONLY using the CONTEXT "
    "provided below — if the context doesn't cover the question, say so "
    "instead of guessing. Take the USER FLAGS into account: they describe "
    "real allergy/condition concerns already detected for this user's "
    "recent meal, and your advice must not contradict them."
)

# Swap for whichever Claude/LLM model + SDK this backend is configured to use.
DEFAULT_MODEL = os.environ.get("NUTRIVISION_LLM_MODEL", "claude-sonnet-4-5")


def guardrail_flags_from_meal_items(rows: List[MealItemRow]) -> List[str]:
    """Turns guardrail engine output into short flag strings for chat context,
    e.g. "blocked: chapati — Contains wheat...". Only non-"ok" items surface."""
    flags = []
    for row in rows:
        if row.guardrail_status != "ok":
            reason = f" — {row.guardrail_reason}" if row.guardrail_reason else ""
            flags.append(f"{row.guardrail_status}: {row.food_label}{reason}")
    return flags


def build_prompt(message: str, chunks: List[RetrievedChunk], guardrail_flags: List[str]) -> str:
    context_block = "\n\n".join(f"[{c.source_title}]\n{c.text}" for c in chunks) or "(no relevant context found)"
    flags_block = "\n".join(f"- {f}" for f in guardrail_flags) or "(none)"

    return (
        f"{SYSTEM_PROMPT}\n\n"
        f"CONTEXT:\n{context_block}\n\n"
        f"USER FLAGS:\n{flags_block}\n\n"
        f"QUESTION:\n{message}"
    )


def generate_answer(prompt: str, model: str = DEFAULT_MODEL) -> str:
    """Calls the configured LLM. Requires the `anthropic` package and
    ANTHROPIC_API_KEY (or swap this out for another provider's SDK)."""
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        raise RuntimeError(
            "ANTHROPIC_API_KEY is not set — configure it in .env (see SETUP.md) "
            "before calling generate_answer(), or swap in another LLM provider here."
        )

    import anthropic  # local import: keeps this an optional dependency until configured

    client = anthropic.Anthropic(api_key=api_key)
    response = client.messages.create(
        model=model,
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )
    return "".join(block.text for block in response.content if block.type == "text")


def answer_chat(
    request: ChatRequest,
    meal_items: Optional[List[MealItemRow]] = None,
    k: int = 3,
) -> ChatResponse:
    chunks = retrieve(request.message, k=k)
    guardrail_flags = guardrail_flags_from_meal_items(meal_items) if meal_items else []
    prompt = build_prompt(request.message, chunks, guardrail_flags)

    answer = generate_answer(prompt)

    sources = [SourceCitation(title=c.source_title, chunk_ref=c.chunk_id) for c in chunks]
    return ChatResponse(answer=answer, sources=sources, guardrail_flags=guardrail_flags)
