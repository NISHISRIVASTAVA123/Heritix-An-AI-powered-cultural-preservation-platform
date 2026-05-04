from fastapi import FastAPI
from contextlib import asynccontextmanager
from db.mongo import db
from config import settings
from routers import processing, archive, agents
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from limiter import limiter
import os

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect_to_database()
    yield
    await db.close_database_connection()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://192.168.56.1:3000"
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to Heritix API"}

app.include_router(processing.router, prefix="/api", tags=["Processing"])
app.include_router(archive.router, prefix="/archive", tags=["Archive"])
app.include_router(agents.router, prefix="/agents", tags=["Agents"])

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

