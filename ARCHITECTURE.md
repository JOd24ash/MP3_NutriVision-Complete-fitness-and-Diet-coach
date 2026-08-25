# Architecture

## High-Level Flow
```
[Mobile App]
   │  photo / voice
   ▼
[FastAPI Gateway]
   │
   ├─► Vision Service ──► YOLOv8-Seg (item detection + masks)
   │                     └─► ResNet/EfficientNet (classification refinement)
   │
   ├─► Portion Service ──► reference-object / depth scaling ──► area → grams
   │
   ├─► Speech Service ──► Whisper ASR ──► NLP parser ──► structured meal entry
   │
   ├─► Guardrail Layer ──► cross-check detected items vs user medical profile
   │                        (allergies, diabetes, renal conditions)
   │
   └─► RAG Chatbot ──► LangChain/LlamaIndex ──► ChromaDB (ICMR guidelines)
                         └─► grounded response, no hallucinated claims
   │
   ▼
[PostgreSQL / TimescaleDB]  ← meal logs, macros, user profile, time-series health metrics
   │
   ▼
[Mobile App] ← macros, warnings, chatbot advice
```

## Components

### 1. Mobile App (React Native / Flutter)
- Camera capture for plate photos
- Voice recording for code-mixed meal logging
- Displays segmented plate, macro breakdown, guardrail warnings, chatbot advice

### 2. FastAPI Backend
- Single gateway serving all inference endpoints (see `API_SPEC.md`)
- Routes requests to vision, portion, speech, guardrail, and RAG modules
- Stateless request handling; persistence delegated to PostgreSQL

### 3. Vision Pipeline
- **YOLOv8-Seg**: instance segmentation — detects each food item + pixel mask on the plate
- **ResNet/EfficientNet**: secondary classification pass to refine ambiguous item labels
- Output: list of `{item_label, mask, bounding_box, confidence}`

### 4. Portion Estimation
- Converts segmented area → real-world volume using a reference object (e.g., a plate/coin of known size) or depth-camera data where available
- Volume → grams via food-density lookup table
- Grams → calories/macros via a nutrition database join

### 5. Guardrail Layer
- Runs inline between inference and response
- Cross-checks every detected item against the user's medical profile (allergies, diabetes, kidney conditions) before macros/advice reach the UI
- Blocks or warns on conflicts

### 6. RAG Chatbot
- ChromaDB vector store populated from curated, verified ICMR guideline documents and nutrition texts
- LangChain/LlamaIndex handles retrieval + prompt orchestration
- Restricts LLM responses to grounded context to avoid hallucinated medical claims

### 7. Speech / Code-Mixed Logging
- Whisper ASR transcribes code-mixed speech (e.g., Hindi + English)
- NLP parser extracts food items + quantities from the transcript
- Parsed entries feed into the same portion/macro pipeline as photo-based logging

### 8. Data Layer
- **PostgreSQL**: user profiles, meal logs, macro history
- **TimescaleDB** (extension on Postgres): time-series health metrics (weight, blood sugar, etc.)
- **ChromaDB**: vector store for the RAG knowledge base, kept separate from relational data

## Design Principles
- **Safety-first**: the guardrail layer sits inline, not as an afterthought — nothing reaches the UI unchecked.
- **Grounded, not generative-only**: the chatbot never answers outside its retrieved context.
- **Multi-item by default**: single-dish assumption is treated as the exception, not the norm.
