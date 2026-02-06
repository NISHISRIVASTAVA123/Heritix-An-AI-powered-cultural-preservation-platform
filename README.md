# HERITIX – Autonomous Cultural Knowledge Preservation Platform

Heritix is an AI-powered multi-agent cultural knowledge preservation platform that allows users to record oral stories, folk knowledge, traditions, and practices using voice or text.

## Modules

- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: FastAPI (Python 3.11), MongoDB Atlas
- **Agents**: LangChain, OpenAI/Gemini
- **Deployment**: Docker, Vercel

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```