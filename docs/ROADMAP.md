# Build Roadmap

## Current baseline
- FastAPI backend, React + Vite frontend, SQLite local persistence, guardrails, RAG retrieval, voice parsing, and the photo-meal API are implemented.
- The photo API supports a local, mask-capable YOLO26 segmentation checkpoint or an explicit deterministic mock detector.
- PostgreSQL, TimescaleDB, ChromaDB service deployment, and model artifacts remain deployment choices; they are not bundled or started by default.

## Phase 1 — Custom food dataset
- Collect and polygon-annotate mixed Indian-meal images.
- Keep labels aligned with `backend/data/foods.json`.
- Create held-out validation images and manually weighed portion ground truth.

## Phase 2 — YOLO26 food segmentation
- Fine-tune `yolo26n-seg.pt` on the custom dataset and set `YOLO_CHECKPOINT_PATH` to the resulting local `best.pt`.
- Measure detection/segmentation precision, recall, and mAP on the held-out split.
- Do not use a COCO-only checkpoint to label Indian dishes for nutrition.

## Phase 3 — Portion-estimation validation
- The reference-object area-to-grams calculation is wired into `/meals/photo`.
- Validate density/height defaults against manually weighed test plates.
- Add depth input only after its capture and calibration workflow is defined.

## Phase 4 — Guardrail validation
- Exercise food/allergen and condition cases against dietitian-reviewed data.
- Keep unrecognized labels in manual-review flow rather than assigning nutrition.

## Phase 5 — RAG validation
- Add and vet ICMR source documents, then evaluate retrieval grounding and citations.
- Maintain the current direct prompt/Anthropic integration unless a framework solves a demonstrated need.

## Phase 6 — Voice validation
- Test Whisper transcription and the Hinglish parser against representative recordings.
- Confirm parsed quantities before using resulting nutrition estimates.

## Phase 7 — Frontend photo integration
- Wire the React scanner upload flow to `/api/v1/meals/photo`.
- Detected-items review/edit screen
- Macro summary, guardrail warnings, chatbot UI
- Meal history + health metrics views

## Phase 8 — Testing & deployment
- End-to-end accuracy validation (vision, portion, guardrail, RAG)
- Edge cases: low-confidence detections, unsupported languages, ambiguous items
- Performance/latency pass on inference endpoints

## Suggested Parallelization (3-person team)
- **Person A**: Dataset, YOLO26n-Seg training/evaluation, and portion validation
- **Person B**: RAG chatbot + guardrail layer + data model/backend
- **Person C**: React scanner integration and speech/voice pipeline validation
