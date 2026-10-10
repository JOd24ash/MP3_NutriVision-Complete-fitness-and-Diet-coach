"""Build the local Chroma collection from backend/knowledge_base."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parents[1]))
from app.rag.retriever import get_or_build_collection
collection = get_or_build_collection()
print(f"Ingested {collection.count()} knowledge chunks")
