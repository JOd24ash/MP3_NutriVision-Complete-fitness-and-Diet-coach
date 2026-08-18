# Local Dev Setup

## Prerequisites
- Python 3.10+
- Node.js 18+ (for React Native/Flutter tooling as applicable)
- PostgreSQL 15+ with TimescaleDB extension
- Docker (recommended for ChromaDB + Postgres)

## Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn sqlalchemy psycopg2-binary \
  ultralytics torch torchvision \
  langchain chromadb openai-whisper \
  python-multipart pydantic

uvicorn main:app --reload
```

## Database
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

## Mobile App
```bash
cd mobile
npm install
npx react-native run-android   # or run-ios
```

## Environment Variables (`.env`)
```
DATABASE_URL=postgresql://postgres:devpass@localhost:5432/nutrivision
CHROMA_HOST=localhost
CHROMA_PORT=8000
WHISPER_MODEL=base
LLM_API_KEY=<your key>
```

## Suggested Repo-Level Scripts
- `scripts/seed_nutrition_reference.py` — populate `nutrition_reference` table
- `scripts/eval_portion_accuracy.py` — compare estimated grams vs manually-weighed ground truth
- `scripts/eval_rag_grounding.py` — spot-check chatbot answers against source citations
