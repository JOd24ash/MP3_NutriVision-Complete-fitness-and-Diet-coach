# ML Pipeline Details

## 1. Multi-Item Plate Segmentation
- **Model**: YOLOv8-Seg (instance segmentation)
- **Input**: single plate photo (RGB)
- **Output**: per-item mask + bounding box + class label + confidence score
- **Dataset needs**:
  - Base: Food-101 / similar for pretraining single-item recognition
  - Custom: annotated multi-item thali/plate images (bounding polygons per item) — likely the biggest data-collection lift for this project
- **Refinement pass**: ResNet/EfficientNet classifies each cropped mask independently to correct YOLO's coarse label when confidence is low (handles visually similar items like dal vs sambar)

## 2. Portion / Volume Estimation
- **Approach**: reference-object scaling (a plate of known diameter, or a coin placed in-frame) to convert pixel area → real-world area → estimated volume
- **Optional upgrade**: depth-camera input (if device supports it) for direct volume estimation, skipping the reference-object step
- **Volume → grams**: per-food-category density lookup table (e.g., g/cm³ for rice vs dal vs curry)
- **Grams → macros**: join against a nutrition database (calories, protein, carbs, fat per 100g)
- **Known limitation** (per literature survey): most portion-estimation research is lab-controlled — plan to validate accuracy against manually-weighed reference plates before trusting user-facing numbers

## 3. RAG Clinical Chatbot
- **Vector store**: ChromaDB
- **Orchestration**: LangChain or LlamaIndex
- **Knowledge base**: curated, verified ICMR dietary guidelines + nutrition texts (must be manually vetted — this is what keeps the bot from hallucinating)
- **Retrieval flow**: user query + relevant meal/health context → embed → retrieve top-k chunks from ChromaDB → LLM generates response constrained to retrieved context
- **Guardrail interplay**: chatbot responses are aware of the user's medical profile so advice is personalized, not generic

## 4. Allergen & Health Guardrails
- Not a separate ML model — a rules/lookup layer that runs after item detection
- Input: detected item list + user medical profile (allergies, diabetes, renal conditions)
- Output: pass / warn / block signal attached to each detected item, surfaced in the UI before the user logs the meal

## 5. Code-Mixed Speech Logging
- **ASR**: Whisper (handles code-mixed Hindi-English reasonably well per literature survey — validate on target language pairs)
- **NLP parsing**: extract `(food_item, quantity, unit)` tuples from the transcript
- **Fallback**: if parsing confidence is low, prompt user to confirm/edit extracted items in the app before logging

## Suggested Model Training Order
1. Get single-item classification working well first (Food-101 baseline) — validates the ResNet/EfficientNet refinement step in isolation
2. Fine-tune YOLOv8-Seg on custom multi-item plate data
3. Build/validate portion estimation against manually-measured ground truth
4. Stand up RAG chatbot against a small curated ICMR doc set before scaling the knowledge base
5. Integrate Whisper + NLP parsing last — it's the most independent module and can be developed in parallel
