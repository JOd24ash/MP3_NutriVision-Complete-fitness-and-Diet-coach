# NutriVision

AI-driven nutrition assistant for multi-item Indian meals.

## Architecture
- Mobile: React Native / Expo-ready structure
- Backend: FastAPI
- Vision: YOLOv8-Seg + classification refinement
- Portion: reference-object/depth scaling + food density
- Nutrition: reference database
- Guardrails: allergen/health rule engine
- RAG: ChromaDB + retrieval orchestration
- Speech: Whisper + meal parser
- Database: PostgreSQL + TimescaleDB

## Quick start

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

This repository is a production-oriented scaffold. ML checkpoints and curated medical knowledge are intentionally not bundled.
