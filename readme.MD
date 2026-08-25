# NutriVision — Complete Fitness & Diet Coach

AI-driven nutrition assistant that sees, measures, and understands a meal the way a dietitian would — built for real, mixed plates (like a full Indian Thali), not single-dish photos.

## Team
- Pruthviraj Deshmukh — C14
- Yash Gaikwad — C17
- Yash Gurav — C20

## Core Idea
Traditional calorie trackers rely on manual entry + generic food databases and break down on multi-item plates. NutriVision instead:
1. **Sees** — segments every item on a plate (not just one dish)
2. **Measures** — estimates real portions in grams, not generic serving sizes
3. **Understands** — gives clinically-grounded advice (ICMR-based RAG), checked against the user's allergy/health profile
4. **Listens** — lets users log meals by speaking, in English + code-mixed regional languages

## Problem Being Solved
| # | Problem | NutriVision's Fix |
|---|---------|-------------------|
| 1 | Single-item blindness (thali → 1 wrong guess) | YOLOv8-Seg multi-item detection |
| 2 | Guessed portions from generic serving sizes | Reference-object/depth-based volume→gram estimation |
| 3 | Hallucinated diet advice from generic chatbots | ChromaDB RAG grounded in ICMR guidelines |
| 4 | No cross-check against medical profile | Inline allergen/health guardrail layer |
| 5 | English-only logging | Whisper ASR + NLP for code-mixed speech |

## Repo Structure (proposed)
```
nutrivision/
├── mobile/              # React Native / Flutter app
├── backend/             # FastAPI inference + API server
│   ├── vision/          # YOLOv8-Seg, ResNet/EfficientNet refinement
│   ├── portion/         # volume/area → gram estimation
│   ├── rag/             # LangChain/LlamaIndex + ChromaDB RAG chatbot
│   ├── guardrails/       # allergen/health cross-check layer
│   ├── speech/           # Whisper ASR + NLP parsing
│   └── db/                # PostgreSQL/TimescaleDB models & migrations
├── ml/                    # training notebooks, datasets, model checkpoints
├── knowledge_base/       # curated ICMR guideline docs for RAG ingestion
└── docs/                  # this documentation set
```

## Docs in This Set
- `ARCHITECTURE.md` — system architecture, tech stack, request lifecycle
- `ML_PIPELINE.md` — vision, portion estimation, RAG, speech pipelines in detail
- `DATA_MODEL.md` — database schema (PostgreSQL/TimescaleDB) + vector store layout
- `API_SPEC.md` — REST API contract between mobile app and FastAPI backend
- `ROADMAP.md` — phased build plan / sprint breakdown
- `SETUP.md` — local dev environment setup

## Tech Stack Summary
| Layer | Choice |
|---|---|
| Frontend | React Native / Flutter |
| Backend / Inference | FastAPI |
| Vision | YOLOv8-Seg + ResNet/EfficientNet |
| Portion Estimation | Reference-object scaling / depth camera |
| RAG Orchestration | LangChain or LlamaIndex |
| Vector Store | ChromaDB |
| Relational DB | PostgreSQL (+ TimescaleDB for health time-series) |
| Speech | Whisper ASR + NLP parsing |
| Training | PyTorch / TensorFlow |
