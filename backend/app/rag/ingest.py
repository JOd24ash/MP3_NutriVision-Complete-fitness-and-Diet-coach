"""
Ingests curated knowledge-base documents into the ChromaDB collection
used by retriever.py. Mirrors SETUP.md's `python ingest.py --source
./knowledge_base/icmr_guidelines/` script.

Curated docs are plain .txt files under knowledge_base/icmr_guidelines/.
Each file is split into ~800-character chunks with a small overlap so
retrieval doesn't miss context that spans a chunk boundary. If no
curated docs are found, falls back to the illustrative SAMPLE_KB in
database.py so the pipeline is runnable before curation is done.
"""

import os
from typing import List, Tuple

from .database import SAMPLE_KB

CHUNK_SIZE = 800
CHUNK_OVERLAP = 100


def _chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
    text = text.strip()
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end].strip())
        start += chunk_size - overlap
    return [c for c in chunks if c]


def load_documents(kb_dir: str = "knowledge_base/icmr_guidelines") -> List[Tuple[str, str, str]]:
    """Returns a list of (chunk_id, source_title, chunk_text).

    Reads every .txt file under kb_dir. Falls back to SAMPLE_KB (already
    short enough to skip chunking) if the directory is missing or empty.
    """
    if os.path.isdir(kb_dir):
        filenames = [f for f in sorted(os.listdir(kb_dir)) if f.endswith(".txt")]
        if filenames:
            docs: List[Tuple[str, str, str]] = []
            for filename in filenames:
                path = os.path.join(kb_dir, filename)
                with open(path, "r", encoding="utf-8") as f:
                    raw = f.read()
                title = os.path.splitext(filename)[0].replace("_", " ").title()
                for i, chunk in enumerate(_chunk_text(raw)):
                    docs.append((f"{filename}::chunk{i}", title, chunk))
            return docs

    return [(doc["doc_id"], doc["source_title"], doc["text"]) for doc in SAMPLE_KB]
