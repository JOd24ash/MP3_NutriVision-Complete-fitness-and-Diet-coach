# API Specification (FastAPI Backend)

Base URL: `/api/v1`

## Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/signup` | Create user account |
| POST | `/auth/login` | Return session/JWT token |

## User & Medical Profile
| Method | Path | Description |
|---|---|---|
| GET | `/users/{user_id}/profile` | Fetch user + medical profile |
| PUT | `/users/{user_id}/profile` | Update allergies/conditions |

## Meal Logging — Photo
| Method | Path | Description |
|---|---|---|
| POST | `/meals/photo` | Upload plate photo → runs vision + portion + guardrail pipeline → returns detected items with macros & warnings |

**Request**: `multipart/form-data` — `image`, `user_id`
**Response**:
```json
{
  "meal_log_id": "uuid",
  "items": [
    {
      "food_label": "chapati",
      "confidence": 0.94,
      "est_grams": 40,
      "calories": 120,
      "protein_g": 3.1,
      "carbs_g": 22,
      "fat_g": 1.2,
      "guardrail_status": "ok"
    }
  ],
  "total": { "calories": 640, "protein_g": 21, "carbs_g": 88, "fat_g": 14 }
}
```

## Meal Logging — Voice
| Method | Path | Description |
|---|---|---|
| POST | `/meals/voice` | Upload audio clip → Whisper transcription → NLP parse → same pipeline as photo |

**Request**: `multipart/form-data` — `audio`, `user_id`
**Response**: same shape as `/meals/photo`, plus `"transcript": "..."`

## Meal Logging — Manual Confirm/Edit
| Method | Path | Description |
|---|---|---|
| PATCH | `/meals/{meal_log_id}/items/{item_id}` | User edits a detected item (label/grams) before final save |
| POST | `/meals/{meal_log_id}/confirm` | Finalize and persist the meal log |

## History
| Method | Path | Description |
|---|---|---|
| GET | `/users/{user_id}/meals?from=&to=` | List meal logs in a date range |
| GET | `/users/{user_id}/health-metrics?type=&from=&to=` | Time-series health metrics |

## RAG Chatbot
| Method | Path | Description |
|---|---|---|
| POST | `/chat` | Send a question; returns grounded advice + cited source docs |

**Request**:
```json
{ "user_id": "uuid", "message": "Can I eat this thali given my sugar levels?" }
```
**Response**:
```json
{
  "answer": "...",
  "sources": [{ "title": "ICMR Dietary Guidelines 2024", "chunk_ref": "..." }],
  "guardrail_flags": ["high_carb_for_diabetic_profile"]
}
```

## Guardrail-only Check
| Method | Path | Description |
|---|---|---|
| POST | `/guardrails/check` | Given a list of food items + user_id, return pass/warn/block per item (used internally, exposed for testing) |

## Error Conventions
- `400` — malformed request (bad image, unsupported audio format)
- `404` — user/meal not found
- `422` — vision/speech pipeline couldn't confidently parse input (returns partial results + `needs_manual_review: true`)
- `500` — inference failure
