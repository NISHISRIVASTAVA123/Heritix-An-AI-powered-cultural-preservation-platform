from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException
from services.audio_service import audio_service
from services.stt_service import stt_service
from agents.agent_manager import AgentManager
from db.mongo import db
from models.knowledge_model import KnowledgeRecord
from datetime import datetime
import uuid

router = APIRouter()
agent_manager = AgentManager()

@router.post("/audio")
async def capture_audio(file: UploadFile = File(...), contributor: str = "Anonymous", consent: bool = False):
    # 1. Upload Audio
    audio_content = await file.read()
    audio_url = await audio_service.upload_audio(audio_content, file.filename)
    
    # 2. Transcribe
    transcript = await stt_service.transcribe(audio_content)
    
    # 3. Process with Agents
    pipeline_results = await agent_manager.run_pipeline(transcript)
    
    # 4. Save to DB
    record = {
        "_id": str(uuid.uuid4()),
        "title": f"Recording {datetime.utcnow().isoformat()}",
        "transcript": transcript,
        "audio_url": audio_url,
        "contributor": contributor,
        "consent": consent,
        "created_at": datetime.utcnow(),
        "category": pipeline_results.get("categorization", {}).get("category"),
        "extraction_data": pipeline_results.get("extraction"),
        "context_data": pipeline_results.get("context"),
        "education_data": pipeline_results.get("education")
    }
    
    await db.db.knowledge.insert_one(record)
    
    return {"message": "Captured and processed successfully", "id": record["_id"]}
