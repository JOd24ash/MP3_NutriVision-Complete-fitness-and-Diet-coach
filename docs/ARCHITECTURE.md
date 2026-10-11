# Architecture

## High-Level Flow
```
[React + Vite Frontend]
   │  photo / voice
   ▼
[FastAPI Gateway]
   │
   ├─► Vision Service ──► local YOLO26n-Seg food checkpoint
   │                     └─► mask polygon area + class label + confidence
   │
   ├─► Portion Service ──► caller-supplied reference scale ──► area → grams
   │
   ├─► Speech Service ──► Whisper ASR ──► NLP parser ──► structured meal entry
   │
   ├─► Guardrail Layer ──► cross-check detected items vs user medical profile
   │                        (allergies, diabetes, renal conditions)
   │
   └─► RAG Chatbot ──► built-in retrieval/prompt flow ──► ChromaDB (ICMR guidelines)
                         └─► grounded response, no hallucinated claims
   │
   ▼
[SQLite by default / PostgreSQL optional]  ← meal logs, macros, user profile, health metrics
   │
   ▼
[Frontend] ← macros, warnings, chatbot advice
```

## Components

### 1. Frontend (React + Vite)
- Dashboard, meal-history, manual-food-entry, chat, profile, and voice-logger UI
- The current plate-scanner screen is presentation/mock data; it does not call `/meals/photo` yet

### 2. FastAPI Backend
- Single gateway serving all inference endpoints (see `API_SPEC.md`)
- Routes requests to vision, portion, speech, guardrail, and RAG modules
- Local development persists to SQLite; PostgreSQL is optional

### 3. Vision Pipeline
- **YOLO26n-Seg**: a local, mask-capable checkpoint loaded only when `YOLO_CHECKPOINT_PATH` points to an existing file
- The detector requires the Ultralytics `segment` task and returns `{food_label, confidence, pixel_area}` internally
- The official pretrained checkpoint is COCO-only. A custom checkpoint fine-tuned on annotated Indian-food polygons is required for nutrition labels such as chapati or dal
- Classification refinement and annotated-image output are not implemented

### 4. Portion Estimation
- Converts segmented area using `reference_object_px` and `reference_object_real_cm` supplied with the photo request
- Volume → grams via food-density lookup table
- Grams → calories/macros via the local nutrition reference data
- Depth-camera scaling is not implemented. Results are estimates, not measured values.

### 5. Guardrail Layer
- Runs inline between inference and response
- Cross-checks every detected item against the user's medical profile (allergies, diabetes, kidney conditions) before macros/advice reach the UI
- Blocks or warns on conflicts

### 6. RAG Chatbot
- ChromaDB vector store populated from curated ICMR guideline documents and nutrition texts
- The backend builds prompts and calls Anthropic directly when configured; it returns retrieved text when no LLM provider is enabled
- Restricts LLM responses to grounded context to avoid hallucinated medical claims

### 7. Speech / Code-Mixed Logging
- Whisper ASR transcribes code-mixed speech (e.g., Hindi + English)
- NLP parser extracts food items + quantities from the transcript
- Parsed entries feed into the same portion/macro pipeline as photo-based logging

### 8. Data Layer
- **SQLite by default**: user profiles, meal logs, macro history, and health metrics
- **PostgreSQL** is supported through `DATABASE_URL`; TimescaleDB hypertables are a production follow-up, not enabled by this repository
- **ChromaDB**: vector store for the RAG knowledge base, kept separate from relational data

## Design Principles
- **Safety-first**: recognized food items are checked against the user's profile before being stored. Unknown nutrition items remain flagged for review.
- **Grounded, not generative-only**: the chatbot never answers outside its retrieved context.
- **Multi-item by default**: single-dish assumption is treated as the exception, not the norm.
