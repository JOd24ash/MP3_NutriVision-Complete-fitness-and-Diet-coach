# ML Pipeline Details

## 1. Multi-Item Plate Segmentation
- **Model**: YOLO26n-Seg (instance segmentation)
- **Runtime contract**: `YOLO_CHECKPOINT_PATH` must point to an existing local segmentation `.pt` file. The service does not download weights at startup and rejects detection-only `yolo26n.pt`.
- **Inference controls**: `YOLO_CONFIDENCE` (default `0.25`), `YOLO_IMAGE_SIZE` (default `640`), and optional `YOLO_DEVICE` are passed to Ultralytics.
- **Input**: single plate photo (RGB)
- **Output**: per-item mask + bounding box + class label + confidence score
- **Dataset needs**:
  - Base: Food-101 / similar for pretraining single-item recognition
  - Custom: annotated multi-item thali/plate images (bounding polygons per item) — likely the biggest data-collection lift for this project
- **Refinement pass**: not implemented in this repository. A future ResNet/EfficientNet pass could classify each cropped mask independently to correct coarse labels such as dal vs sambar.
- **Class limitation**: official `yolo26n-seg.pt` is COCO-pretrained, not an Indian-food model. Do not use it to assign chapati, dal, roti, poha, idli, dosa, rice, or sabzi nutrition without a tested custom checkpoint.

## 2. Portion / Volume Estimation
- **Approach**: reference-object scaling (a plate of known diameter, or a coin placed in-frame) to convert pixel area → real-world area → estimated volume
- **Optional upgrade**: depth-camera input is not implemented; it would allow direct volume estimation instead of the reference-object step.
- **Volume → grams**: per-food-category density lookup table (e.g., g/cm³ for rice vs dal vs curry)
- **Grams → macros**: join against a nutrition database (calories, protein, carbs, fat per 100g)
- **Known limitation**: most portion-estimation research is lab-controlled. Validate against manually weighed plates before trusting user-facing numbers; this repository has no benchmark images or measurements.

## 3. RAG Clinical Chatbot
- **Vector store**: ChromaDB
- **Orchestration**: built-in retrieval and prompt construction; no LangChain/LlamaIndex dependency is used
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
1. Annotate multi-item Indian-food plates with instance polygons and labels that match `backend/data/foods.json`.
2. Fine-tune and validate YOLO26n-Seg on held-out mixed-meal images.
3. Measure portion estimates against manually weighed reference plates.
4. Add a classification refiner only if validation shows it improves ambiguous food labels.
