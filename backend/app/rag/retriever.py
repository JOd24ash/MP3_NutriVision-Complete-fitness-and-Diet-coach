"""
Wraps the ChromaDB collection: creates/loads it, ingests the knowledge
base on first use, and exposes top-k retrieval for chat.py.
"""

import os
from typing import List, Optional

import chromadb
from chromadb.api import ClientAPI

from .embeddings import LocalSentenceTransformerEmbeddingFunction
from .ingest import load_documents
from .models import RetrievedChunk

COLLECTION_NAME = "icmr_nutrition_kb"

# Resolve paths relative to this file so the server CWD doesn't matter
_HERE = os.path.dirname(os.path.abspath(__file__))
_BACKEND_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))
DEFAULT_PERSIST_DIR = os.path.join(_BACKEND_ROOT, "chroma_data")
DEFAULT_KB_DIR = os.path.join(_BACKEND_ROOT, "knowledge_base", "icmr_guidelines")

_client: Optional[ClientAPI] = None

# Cache the embedding function so the SentenceTransformer model is only
# loaded once per process, not on every chat request.
_embedding_fn: Optional[LocalSentenceTransformerEmbeddingFunction] = None


def _get_embedding_fn() -> LocalSentenceTransformerEmbeddingFunction:
    global _embedding_fn
    if _embedding_fn is None:
        _embedding_fn = LocalSentenceTransformerEmbeddingFunction()
    return _embedding_fn


def get_client(persist_dir: str = DEFAULT_PERSIST_DIR) -> ClientAPI:
    """Reuses a module-level client so repeated calls don't reopen storage."""
    global _client
    if _client is None:
        os.makedirs(persist_dir, exist_ok=True)
        _client = chromadb.PersistentClient(path=persist_dir)
    return _client


def get_or_build_collection(
    client: Optional[ClientAPI] = None,
    kb_dir: str = DEFAULT_KB_DIR,
):
    """Gets the KB collection, ingesting documents into it if it's empty."""
    client = client or get_client()
    ef = _get_embedding_fn()
    collection = client.get_or_create_collection(name=COLLECTION_NAME, embedding_function=ef)

    if collection.count() == 0:
        docs = load_documents(kb_dir)
        if docs:
            collection.add(
                ids=[d[0] for d in docs],
                documents=[d[2] for d in docs],
                metadatas=[{"source_title": d[1]} for d in docs],
            )

    return collection


def retrieve(query: str, k: int = 3, client: Optional[ClientAPI] = None) -> List[RetrievedChunk]:
    collection = get_or_build_collection(client=client)

    count = collection.count()
    if count == 0:
        # Knowledge base is empty — return no chunks rather than crashing
        return []

    # Never request more results than documents in the collection
    n = min(k, count)

    result = collection.query(query_texts=[query], n_results=n)

    chunks: List[RetrievedChunk] = []
    ids = result.get("ids", [[]])[0]
    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = (result.get("distances") or [[]])[0]

    for i in range(len(ids)):
        metadata = metadatas[i] or {}
        chunks.append(
            RetrievedChunk(
                chunk_id=ids[i],
                text=documents[i],
                source_title=metadata.get("source_title", "Unknown source"),
                distance=distances[i] if i < len(distances) else None,
            )
        )
    return chunks
