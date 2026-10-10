# Local Dev Setup

## Prerequisites
- Python 3.10+
- FFmpeg on PATH (required to convert browser WebM/Ogg recordings for Whisper)
- Node.js 18+
- Docker (optional)

## Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt

uvicorn app.main:app --reload
```

## Database

SQLite is the default (`sqlite:///./nutrivision.db`) and needs no service. PostgreSQL is optional; TimescaleDB is not required.
```bash
docker run -d --name nutrivision-pg \
  -e POSTGRES_PASSWORD=devpass \
  -e POSTGRES_DB=nutrivision \
  -p 5432:5432 timescale/timescaledb:latest-pg15

# run migrations (Alembic recommended)
alembic upgrade head
```

## ChromaDB (RAG vector store)
```bash
docker run -d --name nutrivision-chroma -p 8000:8000 chromadb/chroma
```

## Vision Model
```bash
# YOLOv8-Seg — start from a pretrained checkpoint, fine-tune on custom data
pip install ultralytics
yolo segment train data=plate_dataset.yaml model=yolov8n-seg.pt epochs=100
```

## Knowledge Base Ingestion (RAG)
```bash
cd backend/rag
python ingest.py --source ./knowledge_base/icmr_guidelines/
```

## Environment Variables (`.env`)
```
DATABASE_URL=sqlite:///./nutrivision.db
WHISPER_MODEL=base
YOLO_CHECKPOINT_PATH=/checkpoints/best.pt
ANTHROPIC_API_KEY=<optional chat-only key>
```

## Suggested Repo-Level Scripts
- `scripts/seed_nutrition_reference.py` — populate `nutrition_reference` table
- `scripts/eval_portion_accuracy.py` — compare estimated grams vs manually-weighed ground truth
- `scripts/eval_rag_grounding.py` — spot-check chatbot answers against source citations
