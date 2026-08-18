# Build Roadmap

## Phase 0 — Setup (Week 1)
- Repo scaffolding, tech stack finalized
- PostgreSQL + TimescaleDB instance up
- ChromaDB instance up
- Collect/curate initial ICMR guideline docs for RAG

## Phase 1 — Core Data & Single-Item Baseline (Weeks 2–3)
- `users`, `medical_profiles`, `meal_logs`, `meal_items`, `nutrition_reference` tables live
- Baseline food classifier working on Food-101 (validates the classification-refinement step before tackling segmentation)
- Basic FastAPI skeleton with `/auth`, `/users/{id}/profile`

## Phase 2 — Multi-Item Vision Pipeline (Weeks 4–6)
- Collect/annotate custom multi-item plate dataset (biggest data lift — start early)
- Fine-tune YOLOv8-Seg for plate segmentation
- Integrate ResNet/EfficientNet refinement pass
- `/meals/photo` endpoint returns raw detections (portion estimation not yet wired in)

## Phase 3 — Portion Estimation (Weeks 6–7, overlaps Phase 2)
- Reference-object scaling implementation
- Density lookup table for common thali items
- Validate against manually-weighed test plates
- Wire into `/meals/photo` for full macro output

## Phase 4 — Guardrail Layer (Week 8)
- Allergen/condition cross-check logic
- `/guardrails/check` endpoint
- Wire into `/meals/photo` and `/meals/voice` inline

## Phase 5 — RAG Chatbot (Weeks 8–9, overlaps Phase 4)
- Ingest curated ICMR docs into ChromaDB
- LangChain/LlamaIndex retrieval + prompt pipeline
- `/chat` endpoint with source citations
- Connect guardrail flags into chatbot context

## Phase 6 — Voice / Code-Mixed Logging (Weeks 9–10)
- Whisper ASR integration
- NLP parser for `(item, quantity, unit)` extraction
- `/meals/voice` endpoint, reuse existing macro/guardrail pipeline

## Phase 7 — Mobile App Integration (Weeks 10–12)
- Camera capture + voice recording UI
- Detected-items review/edit screen
- Macro summary, guardrail warnings, chatbot UI
- Meal history + health metrics views

## Phase 8 — Testing & Polish (Weeks 12–13)
- End-to-end accuracy validation (vision, portion, guardrail, RAG)
- Edge cases: low-confidence detections, unsupported languages, ambiguous items
- Performance/latency pass on inference endpoints

## Suggested Parallelization (3-person team)
- **Person A**: Vision pipeline (YOLOv8-Seg, refinement, portion estimation)
- **Person B**: RAG chatbot + guardrail layer + data model/backend
- **Person C**: Mobile app + speech/voice pipeline integration
