# Data Model

## Relational Store — SQLite by default; PostgreSQL optional

The SQLAlchemy models use string UUIDs and JSON arrays so local SQLite development and PostgreSQL deployments share the same schema. TimescaleDB hypertables are not configured by this repository.

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| name | text | |
| email | text unique | |
| created_at | timestamptz | |

### `medical_profiles`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| allergies | JSON array | e.g. `["peanuts", "shellfish"]` |
| conditions | JSON array | e.g. `["diabetes", "ckd"]` |
| updated_at | timestamptz | |

### `meal_logs`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| logged_at | datetime | timestamp; can become a TimescaleDB partition key in a PostgreSQL deployment |
| source | enum | `photo` \| `voice` \| `manual` |
| raw_image_url | text | nullable |
| raw_audio_url | text | nullable |

### `meal_items`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| meal_log_id | UUID FK → meal_logs | |
| food_label | text | |
| confidence | float nullable | detector confidence; no classifier refinement currently runs |
| est_grams | float nullable | estimated from segmentation area and the request's reference scale |
| calories | float | |
| protein_g | float | |
| carbs_g | float | |
| fat_g | float | |
| guardrail_status | enum | `ok` \| `warn` \| `blocked` \| `unknown` |
| guardrail_reason | text | nullable, e.g. "contains peanuts" |

### `health_metrics`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| user_id | UUID FK → users | |
| recorded_at | datetime | timestamp |
| metric_type | enum | `weight` \| `blood_sugar` \| `bp` etc. |
| value | float | |
| unit | text | |

### `nutrition_reference`
| Column | Type | Notes |
|---|---|---|
| id | UUID PK | |
| food_label | text unique | |
| density_g_per_cm3 | float | for volume→gram conversion |
| calories_per_100g | float | |
| protein_per_100g | float | |
| carbs_per_100g | float | |
| fat_per_100g | float | |
| common_allergens | JSON array | for guardrail cross-check |

## Vector Store — ChromaDB
Separate from the relational DB; holds the RAG knowledge base only.

| Field | Notes |
|---|---|
| `doc_id` | source document identifier |
| `chunk_text` | curated ICMR guideline / nutrition text chunk |
| `embedding` | vector embedding of `chunk_text` |
| `source_title` | for citation in chatbot responses |
| `source_url_or_ref` | provenance |

Ingestion is a manual/curated pipeline — only vetted ICMR/nutrition documents go in, since this is the entire hallucination-prevention mechanism.

## Relationships Summary
```
users 1───1 medical_profiles
users 1───N meal_logs
meal_logs 1───N meal_items
users 1───N health_metrics
meal_items ─ ─ ─ nutrition_reference (application lookup by food_label; no database foreign key)
```
