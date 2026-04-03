# HERITIX – Autonomous Cultural Knowledge Preservation Platform

> *Preserving Voices, Stories, and Wisdom for Future Generations*

Heritix is an AI-powered, multi-agent cultural knowledge preservation platform. It allows users to record oral stories, folk medicine, traditions, and ancestral wisdom through voice or text, then automatically transcribes, categorises, contextualises, and transforms them into rich educational content — stored in a searchable digital archive.

---

## Table of Contents

1. [Features](#features)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [AI Agent Pipeline](#ai-agent-pipeline)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Environment Variables](#environment-variables)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
   - [Docker (All-in-One)](#docker-all-in-one)
7. [API Reference](#api-reference)
8. [Application Pages](#application-pages)
9. [Contributing](#contributing)
10. [License](#license)

---

## Features

- 🎙️ **Voice Recording** — In-browser audio capture with elder-friendly UI
- 🔊 **Speech-to-Text** — Automatic transcription via OpenAI Whisper, supporting multiple languages
- 🤖 **Multi-Agent AI Pipeline** — Five specialised LangChain agents process each recording end-to-end
- 🗂️ **Smart Categorisation** — Content auto-tagged into domains: *Folk Medicine, Agriculture, Folklore & Stories, Cultural Rituals, Life Advice & Ethics*
- 📚 **Educational Content Generation** — AI-generated summaries, lessons, morals, and quiz questions in English, Hindi, and the original language
- 🌐 **Multilingual Translation** — Non-English recordings are translated to English automatically
- 🔍 **Searchable Archive** — Full-text search and category/language filters across all preserved records
- 🔐 **Authentication** — Clerk-based user authentication and consent-gated uploads
- 🐳 **Docker Support** — Single-command deployment with Docker Compose

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                   Next.js Frontend                      │
│   Home │ /capture │ /archive │ /archive/[id] │ /dashboard │
└────────────────────────┬────────────────────────────────┘
                         │  HTTP / REST
┌────────────────────────▼────────────────────────────────┐
│                  FastAPI Backend                        │
│                                                         │
│  POST /api/upload-audio  →  Audio saved to /uploads     │
│  POST /api/process/{id}  →  Kicks off AI pipeline       │
│  GET  /api/status/{id}   →  Live processing status      │
│  GET  /archive/*         →  Archive queries             │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              AgentManager (LangChain)            │   │
│  │                                                  │   │
│  │  [Whisper STT] → [Extraction] → [Categorisation] │   │
│  │  → [Context] → [Education] → [Translation]       │   │
│  └──────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│              MongoDB Atlas                              │
│  Collections: knowledge │ knowledge_content │ processing_logs │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Auth** | Clerk |
| **Animations** | Framer Motion |
| **Backend** | FastAPI, Python 3.11, Uvicorn |
| **Database** | MongoDB Atlas, Motor (async driver) |
| **AI / LLM** | Groq – Llama 3.3 70B Versatile |
| **Orchestration** | LangChain, LangGraph |
| **Speech-to-Text** | OpenAI Whisper (local, via `openai-whisper`) |
| **Retry Logic** | Tenacity |
| **Deployment** | Docker Compose, Vercel (frontend) |

---

## AI Agent Pipeline

Each uploaded recording passes through a sequential five-stage pipeline managed by `AgentManager`:

| # | Agent | Model | Output |
|---|---|---|---|
| 1 | **ExtractionAgent** | Llama 3.3 70B | `title`, `knowledge_type`, `details`, `cultural_context` |
| 2 | **CategorizationAgent** | Llama 3.3 70B | `category` (Folk Medicine / Agriculture / etc.) |
| 3 | **ContextAgent** | Llama 3.3 70B | Deep cultural and historical context |
| 4 | **EducationAgent** | Llama 3.3 70B | `summary`, `lesson`, `moral`, `quiz_questions` (EN + HI + native) |
| 5 | **TranslationAgent** | Llama 3.3 70B | Full English translation (skipped if already English) |

All agents include automatic retry logic (up to 3 attempts with exponential back-off via Tenacity).

---

## Project Structure

```
Heritix/
├── backend/
│   ├── agents/
│   │   ├── agent_manager.py       # Orchestrates all agents
│   │   ├── base_agent.py          # Abstract base class
│   │   ├── extraction_agent.py
│   │   ├── categorization_agent.py
│   │   ├── context_agent.py
│   │   ├── education_agent.py
│   │   └── translation_agent.py
│   ├── db/
│   │   └── mongo.py               # MongoDB Motor connection
│   ├── models/
│   │   └── knowledge_model.py     # Pydantic models
│   ├── routers/
│   │   ├── processing.py          # Upload & AI pipeline routes
│   │   ├── archive.py             # Archive query routes
│   │   └── agents.py              # Direct agent routes
│   ├── services/
│   │   ├── audio_service.py       # File storage
│   │   └── stt_service.py         # Whisper transcription
│   ├── config.py                  # Pydantic settings
│   ├── main.py                    # FastAPI app entry point
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Landing / home page
│   │   ├── capture/page.tsx       # Voice recording page
│   │   ├── archive/
│   │   │   ├── page.tsx           # Archive listing & search
│   │   │   └── [id]/page.tsx      # Individual record detail
│   │   └── dashboard/page.tsx     # User dashboard
│   ├── components/                # Shared UI components
│   ├── middleware.ts               # Clerk auth middleware
│   ├── next.config.ts
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 and **npm**
- **Python** 3.11+
- **MongoDB** (Atlas or local instance)
- **ffmpeg** (required by Whisper for audio processing)
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `sudo apt install ffmpeg`
  - Windows: run `backend/install_ffmpeg.ps1` or `python backend/install_ffmpeg.py`
- A **Groq API key** (free tier available at [console.groq.com](https://console.groq.com))
- A **Clerk** account for authentication ([clerk.com](https://clerk.com))

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `MONGODB_URL` | MongoDB connection string (e.g. `mongodb://localhost:27017`) |
| `DB_NAME` | Database name (default: `heritix`) |
| `GROQ_API_KEY` | Groq API key for Llama 3.3 inference |
| `HUGGINGFACEHUB_API_TOKEN` | HuggingFace token (optional, for extended model support) |
| `OPENAI_API_KEY` | OpenAI key (optional, if switching from Groq) |
| `NEXT_PUBLIC_API_URL` | Backend URL visible to the browser (e.g. `http://localhost:8000`) |

For the frontend, also add your Clerk keys to `frontend/.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

### Backend Setup

```bash
cd backend

# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

### Docker (All-in-One)

The included `docker-compose.yml` starts the backend, frontend, and a local MongoDB instance together:

```bash
# From the repository root
docker compose up --build
```

| Service | Port |
|---|---|
| Frontend | `3000` |
| Backend API | `8000` |
| MongoDB | `27017` |

> **Note:** Set `MONGODB_URL=mongodb://mongo:27017` in your `.env` when using Docker Compose, as `mongo` is the internal service hostname.

---

## API Reference

All backend endpoints are served under `http://localhost:8000`.

### Processing

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload-audio` | Upload an audio file (multipart/form-data). Fields: `file`, `contributor`, `consent` (boolean, must be `true`). Returns `record_id`. |
| `POST` | `/api/process/{record_id}` | Trigger the AI pipeline for an uploaded record (runs as a background task). |
| `GET` | `/api/status/{record_id}` | Poll processing status and per-stage logs for a record. |

**Supported audio formats:** `audio/mpeg`, `audio/wav`, `audio/mp4`, `audio/webm`, `audio/ogg`  
**Max file size:** 25 MB

### Archive

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/archive/all` | List all completed records (latest 100). |
| `GET` | `/archive/search?q=&category=&language=` | Search/filter completed records by keyword, category, or detected language. |
| `GET` | `/archive/{record_id}` | Fetch full details of a single record including all AI-generated content. |

---

## Application Pages

| Route | Description |
|---|---|
| `/` | Landing page with hero, feature highlights, and CTA |
| `/capture` | In-browser voice recorder; uploads and triggers the AI pipeline |
| `/archive` | Searchable, filterable grid of all preserved cultural records |
| `/archive/[id]` | Full detail view: transcript, education content, quiz, and audio playback |
| `/dashboard` | Personal dashboard for the authenticated user |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to your fork: `git push origin feature/your-feature`
5. Open a Pull Request

Please ensure your code passes the existing linters before opening a PR:

```bash
# Backend
cd backend && python -m py_compile main.py

# Frontend
cd frontend && npm run lint
```

---

## License

This project is open source. See the repository for license details.