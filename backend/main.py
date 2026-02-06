from fastapi import FastAPI
from contextlib import asynccontextmanager
from db.mongo import db
from config import settings
from routers import capture, archive, agents

@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.connect_to_database()
    yield
    await db.close_database_connection()

app = FastAPI(title=settings.APP_NAME, lifespan=lifespan)

@app.get("/")
async def root():
    return {"message": "Welcome to Heritix API"}

app.include_router(capture.router, prefix="/capture", tags=["Capture"])
app.include_router(archive.router, prefix="/archive", tags=["Archive"])
app.include_router(agents.router, prefix="/agents", tags=["Agents"])
