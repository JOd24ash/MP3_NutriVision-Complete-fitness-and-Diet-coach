"""
Deterministic, dependency-light embedding function so the RAG pipeline
runs end-to-end without a network call to an embedding model provider.

This is a stopgap, not a real embedding model — it's a hashed
bag-of-words vector, so it only picks up literal token overlap, not
semantic similarity. Before this touches real user-facing advice, swap
it for a proper sentence embedding model (e.g. a sentence-transformers
model, or an API-based embedder) via the same `EmbeddingFunction`
interface — nothing else in `retriever.py` needs to change.
"""

import hashlib
import math
import re

from chromadb import EmbeddingFunction

_TOKEN_RE = re.compile(r"[a-z0-9]+")


class HashingEmbeddingFunction(EmbeddingFunction):
    def __init__(self, dim: int = 256):
        self.dim = dim

    def _embed_one(self, text: str) -> list[float]:
        vec = [0.0] * self.dim
        for token in _TOKEN_RE.findall(text.lower()):
            idx = int(hashlib.md5(token.encode()).hexdigest(), 16) % self.dim
            vec[idx] += 1.0
        norm = math.sqrt(sum(v * v for v in vec)) or 1.0
        return [v / norm for v in vec]

    def __call__(self, input):
        return [self._embed_one(t) for t in input]
