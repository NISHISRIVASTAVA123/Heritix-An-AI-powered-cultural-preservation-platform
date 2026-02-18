from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Form
from services.audio_service import audio_service
from services.stt_service import stt_service
from agents.agent_manager import AgentManager
from db.mongo import db
from models.knowledge_model import KnowledgeMetadata, KnowledgeContent, ProcessingLog, ProcessingStatus
from datetime import datetime
import uuid
from werkzeug.utils import secure_filename
import aiofiles
import os

router = APIRouter()
agent_manager = AgentManager()

MAX_FILE_SIZE = 25 * 1024 * 1024 # 25MB
ALLOWED_TYPES = ["audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/webm", "audio/ogg"]

async def log_stage(knowledge_id: str, stage: str, status: str, error: str = None):
    """Helper to write to processing_logs collection"""
    log_entry = {
        "knowledge_id": knowledge_id,
        "stage": stage,
        "status": status,
        "error_message": error,
        "timestamp": datetime.utcnow()
    }
    await db.db.processing_logs.insert_one(log_entry)

@router.post("/upload-audio")
async def upload_audio(
    file: UploadFile = File(...), 
    contributor: str = Form("Anonymous"), 
    consent: bool = Form(False)
):
    # 1. Consent Check (Hardened)
    if not consent:
        raise HTTPException(status_code=400, detail="User consent is required to process audio.")

    # 2. Validation
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed: {ALLOWED_TYPES}")
    
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Limit: {MAX_FILE_SIZE/1024/1024}MB")

    # 3. Save file (Sanitized)
    safe_filename = secure_filename(file.filename)
    filename = f"{uuid.uuid4()}_{safe_filename}"
    audio_url = await audio_service.upload_audio(content, filename)
    
    # 4. Create Metadata Record
    record_id = str(uuid.uuid4())
    metadata = {
        "_id": record_id,
        "title": f"Recording {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        "processing_status": ProcessingStatus.UPLOADED,
        "audio_url": audio_url,
        "original_filename": safe_filename,
        "contributor": contributor,
        "consent": consent,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    await db.db.knowledge.insert_one(metadata)
    
    # 5. Initialize Content Record
    await db.db.knowledge_content.insert_one({"knowledge_id": record_id, "processed_at": datetime.utcnow()})
    
    await log_stage(record_id, "upload", "success")

    return {
        "message": "Upload successful", 
        "record_id": record_id,
        "status": "uploaded"
    }

async def process_record_task(record_id: str, audio_url: str):
    try:
        print(f"Starting pipeline for {record_id}")
        await log_stage(record_id, "pipeline_start", "success")
        
        # 1. Retrieve Audio
        filename = audio_url.split("/")[-1]
        file_path = os.path.join("uploads", filename)
        async with aiofiles.open(file_path, "rb") as f:
            audio_content = await f.read()

        # 2. STT
        await log_stage(record_id, "stt", "started")
        stt_result = await stt_service.transcribe(audio_content)
        transcript = stt_result["text"]
        language = stt_result["language"]
        
        await db.db.knowledge.update_one(
            {"_id": record_id},
            {"$set": {"transcript": transcript, "detected_language": language}}
        )
        await log_stage(record_id, "stt", "success")
        
        # 3. Extraction
        await log_stage(record_id, "extraction", "started")
        extraction_data = await agent_manager.process_extraction(transcript)
        await db.db.knowledge_content.update_one(
            {"knowledge_id": record_id},
            {"$set": {"extraction_data": extraction_data}}
        )
        await log_stage(record_id, "extraction", "success")

        # 4. Categorization
        await log_stage(record_id, "categorization", "started")
        cat_data = await agent_manager.process_categorization(transcript)
        category = cat_data.get("category", "Uncategorized")
        
        # Update both metadata (for filtering) and content
        await db.db.knowledge.update_one({"_id": record_id}, {"$set": {"category": category}})
        await db.db.knowledge_content.update_one(
            {"knowledge_id": record_id},
            {"$set": {"categorization": cat_data}} 
        )
        await log_stage(record_id, "categorization", "success")

        # 5. Context
        await log_stage(record_id, "context", "started")
        context_data = await agent_manager.process_context(transcript)
        await db.db.knowledge_content.update_one(
            {"knowledge_id": record_id},
            {"$set": {"context_data": context_data}}
        )
        await log_stage(record_id, "context", "success")

        # 6. Education
        await log_stage(record_id, "education", "started")
        edu_data = await agent_manager.process_education(transcript)
        await db.db.knowledge_content.update_one(
            {"knowledge_id": record_id},
            {"$set": {"education_data": edu_data}}
        )
        await log_stage(record_id, "education", "success")

        # 7. Translation (Smart Optimization)
        if language == "en":
            print(f"Skipping translation for English content (record {record_id})")
            await log_stage(record_id, "translation", "skipped_en")
        else:
            await log_stage(record_id, "translation", "started")
            trans_data = await agent_manager.process_translation(transcript)
            await db.db.knowledge_content.update_one(
                {"knowledge_id": record_id},
                {"$set": {"translations": trans_data}}
            )
            await log_stage(record_id, "translation", "success")

        # 8. Completion
        await db.db.knowledge.update_one(
            {"_id": record_id},
            {"$set": {
                "processing_status": ProcessingStatus.COMPLETED,
                "updated_at": datetime.utcnow()
            }}
        )
        await log_stage(record_id, "pipeline", "completed")
        print(f"Pipeline finished for {record_id}")

    except Exception as e:
        print(f"Pipeline failed for {record_id}: {e}")
        await db.db.knowledge.update_one(
            {"_id": record_id},
            {"$set": {
                "processing_status": ProcessingStatus.FAILED,
                "updated_at": datetime.utcnow()
            }}
        )
        await log_stage(record_id, "pipeline", "failed", str(e))

@router.post("/process/{record_id}")
async def start_processing(record_id: str, background_tasks: BackgroundTasks):
    doc = await db.db.knowledge.find_one({"_id": record_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Record not found")
        
    await db.db.knowledge.update_one(
        {"_id": record_id},
        {"$set": {
            "processing_status": ProcessingStatus.PROCESSING,
            "updated_at": datetime.utcnow()
        }}
    )
    
    background_tasks.add_task(process_record_task, record_id, doc["audio_url"])
    
    return {"message": "Processing started", "record_id": record_id, "status": "processing"}

@router.get("/status/{record_id}")
async def get_status(record_id: str):
    # Aggregate data
    metadata = await db.db.knowledge.find_one({"_id": record_id})
    if not metadata:
        raise HTTPException(status_code=404, detail="Record not found")
        
    content = await db.db.knowledge_content.find_one({"knowledge_id": record_id})
    logs_cursor = db.db.processing_logs.find({"knowledge_id": record_id}).sort("timestamp", -1)
    logs = await logs_cursor.to_list(length=20)
    
    response = {
        "record_id": record_id,
        "status": metadata.get("processing_status"),
        "metadata": {
            "title": metadata.get("title"),
            "language": metadata.get("detected_language"),
            "category": metadata.get("category"),
            "transcript_preview": (metadata.get("transcript") or "")[:100]
        },
        "logs": [
            {
                "stage": log["stage"], 
                "status": log["status"], 
                "timestamp": log["timestamp"],
                "error": log.get("error_message")
            } for log in logs
        ]
    }
    
    if content:
        response["content_preview"] = {
            "has_extraction": bool(content.get("extraction_data")),
            "has_education": bool(content.get("education_data")),
            "translations": list(content.get("translations", {}).keys()) if content.get("translations") else []
        }
        
    return response
