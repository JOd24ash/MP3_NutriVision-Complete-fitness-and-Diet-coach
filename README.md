# NutriVision 🥗

AI-driven nutrition assistant for multi-item Indian meals — with food detection, calorie tracking, voice logging, RAG-powered diet coaching, and health guardrails.

---

## 🏗️ Architecture

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + Lucide Icons |
| Backend | FastAPI (Python) |
| Vision | YOLOv8-Seg + classification refinement |
| Portion Estimation | Reference-object / depth scaling + food density |
| Nutrition DB | Curated reference database |
| Guardrails | Allergen / health rule engine |
| RAG / Chat | ChromaDB + Anthropic Claude |
| Speech | Whisper + meal parser |
| Database | PostgreSQL + TimescaleDB (SQLite for dev) |

---

## 🚀 How to Run

### Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- **Python** ≥ 3.10
- **Git**

---

### 🖥️ Frontend (React + Vite)

The frontend runs on **http://localhost:5173** and proxies all `/api` requests to the backend at `http://localhost:8000`.

```bash
# 1. Navigate to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

#### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server at http://localhost:5173 |
| `npm run build` | Build production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run oxlint for code quality checks |

---

### ⚙️ Backend (FastAPI)

The backend runs on **http://localhost:8000**.  
Interactive API docs are available at **http://localhost:8000/docs**.

```bash
# 1. Navigate to the backend folder
cd backend

# 2. Create a virtual environment
python -m venv .venv

# 3. Activate the virtual environment
# Windows (PowerShell):
.venv\Scripts\activate
# Windows (CMD):
.venv\Scripts\activate.bat
# Linux / macOS:
source .venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Set up environment variables
cp .env.example .env
# Then open .env and fill in your API keys (see Environment Variables below)

# 6. Start the development server
uvicorn app.main:app --reload
```

#### Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `DATABASE_URL` | DB connection string (default: `sqlite:///./nutrivision.db`) |
| `JWT_SECRET_KEY` | Secret key for JWT auth — **change in production** |
| `YOLO_CHECKPOINT_PATH` | Path to YOLOv8 model checkpoint (optional) |
| `WHISPER_MODEL` | Whisper model size e.g. `base`, `small` (optional) |
| `ANTHROPIC_API_KEY` | Anthropic API key for RAG/chat features |
| `NUTRIVISION_LLM_MODEL` | LLM model name (default: `claude-sonnet-4-5`) |

> **Note:** Vision (YOLO) and Speech (Whisper) features gracefully fall back to mock implementations if their dependencies or checkpoints are not configured.

---

### 🔄 Running Both Together

Open **two terminals** side by side:

**Terminal 1 — Backend:**
```bash
cd backend
.venv\Scripts\activate   # Windows
uvicorn app.main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser. The frontend will automatically proxy API calls to the backend.

---

## 📁 Project Structure

```
MP3_NutriVision/
├── frontend/          # React + Vite app
│   ├── src/
│   │   ├── components/   # UI components (dashboard, voice-logger, guardrails…)
│   │   ├── api/          # API client & mock data
│   │   └── context/      # Global app state (AppContext)
│   ├── index.html
│   └── vite.config.js    # Dev server + proxy config
├── backend/           # FastAPI app
│   ├── app/           # Routes, models, services
│   ├── requirements.txt
│   └── .env.example
├── API_SPEC.md
├── ARCHITECTURE.md
├── DATA_MODEL.md
├── ML_PIPELINE.md
├── ROADMAP.md
└── SETUP.md
```

---

> This repository is a production-oriented scaffold. ML checkpoints and curated medical knowledge are intentionally not bundled.
