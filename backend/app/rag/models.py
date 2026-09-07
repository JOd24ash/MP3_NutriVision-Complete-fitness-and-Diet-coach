from typing import List, Optional

from pydantic import BaseModel


class ChatRequest(BaseModel):
    user_id: str
    message: str


class SourceCitation(BaseModel):
    title: str
    chunk_ref: str


class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]
    guardrail_flags: List[str] = []


class RetrievedChunk(BaseModel):
    chunk_id: str
    text: str
    source_title: str
    distance: Optional[float] = None
