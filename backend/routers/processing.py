from fastapi import APIRouter, UploadFile, File, BackgroundTasks, HTTPException, Form, Depends, Request
from services.audio_service import audio_service
from services.stt_service import stt_service
from agents.agent_manager import AgentManager
from db.mongo import db
from models.knowledge_model import KnowledgeMetadata, KnowledgeContent, ProcessingLog, ProcessingStatus
from datetime import datetime
import asyncio
import uuid
import os

from agents.verification import execute_with_fallback
from agents.verification.safety_agent import SafetyAgent
from auth import verify_token
from limiter import limiter
from agents.verification.authenticity_agent import AuthenticityAgent
from agents.verification.sensitivity_agent import SensitivityAgent
from agents.verification.completeness_agent import CompletenessAgent
from agents.verification.duplication_agent import DuplicationAgent
from agents.verification.score_aggregator_agent import ScoreAggregatorAgent
from agents.verification.decision_router_agent import DecisionRouterAgent

router = APIRouter()
agent_manager = AgentManager()

safety_agent = SafetyAgent()
authenticity_agent = AuthenticityAgent()
sensitivity_agent = SensitivityAgent()
completeness_agent = CompletenessAgent()
duplication_agent = DuplicationAgent()
score_aggregator_agent = ScoreAggregatorAgent()
decision_router_agent = DecisionRouterAgent()

MIN_FILE_SIZE = 1024
MAX_FILE_SIZE = 25 * 1024 * 1024 # 25MB
MIN_TRANSCRIPT_WORDS = 3

# Base MIME types (strip codec suffix like ';codecs=opus' before checking)
ALLOWED_BASE_TYPES = {"audio/mpeg", "audio/wav", "audio/x-wav", "audio/mp4", "audio/webm", "audio/ogg"}

# Map base MIME to a safe file extension for Whisper/ffmpeg
MIME_TO_EXT = {
    "audio/webm": "webm",
    "audio/ogg":  "ogg",
    "audio/mpeg": "mp3",
    "audio/mp4":  "mp4",
    "audio/wav":  "wav",
    "audio/x-wav":"wav",
}

async def log_stage(knowledge_id: str, stage: str, status: str, error: str = None) -> None:
    """
    Helper to asynchronously write logging states to the processing_logs collection.

    Args:
        knowledge_id (str): The specific ID of the recording being processed.
        stage (str): Processing stage identifier (e.g., 'stt', 'extraction').
        status (str): The current status to log ('started', 'success', 'failed').
        error (str, optional): A text error message to document failures, defaults to None.
    """
    log_entry = {
        "knowledge_id": knowledge_id,
        "stage": stage,
        "status": status,
        "error_message": error,
        "timestamp": datetime.utcnow()
    }
    await db.db.processing_logs.insert_one(log_entry)

@router.post("/upload-audio")
@limiter.limit("5/minute")
async def upload_audio(
    request: Request,
    file: UploadFile = File(...), 
    contributor: str = Form("Anonymous"), 
    consent: bool = Form(False),
    user_payload: dict = Depends(verify_token)
) -> dict:
    """
    Handle initial audio upload, construct preliminary metadata objects, and register them into DB.

    Args:
        request (Request): Framework request object.
        file (UploadFile): Injected multipart file byte-streaming.
        contributor (str, optional): Supplied author alias.
        consent (bool, optional): Checked requirement verifying processing agreements.
        user_payload (dict, optional): Resolves and authenticates from Depends injection.

    Returns:
        dict: Standardized payload affirming an initiated tracking ID and operational message.

    Raises:
        HTTPException: For invalid mime-types, file sizes out of boundaries, or missing consent.
    """
    # 1. Consent Check
    if not consent:
        raise HTTPException(status_code=400, detail="User consent is required to process audio.")

    # 2. Validation — strip codec suffix (e.g. 'audio/webm;codecs=opus' -> 'audio/webm')
    base_type = (file.content_type or "").split(";")[0].strip().lower()
    if base_type not in ALLOWED_BASE_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid file type '{file.content_type}'. Allowed base types: {sorted(ALLOWED_BASE_TYPES)}")

    content = await file.read()
    if len(content) < MIN_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Audio recording is too short or empty. Please record a longer clip and try again.")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail=f"File too large. Limit: {MAX_FILE_SIZE/1024/1024}MB")

    # 3. Save file with the correct extension derived from MIME type (not the client filename)
    #    This is critical so ffmpeg / Whisper can detect the container format.
    ext = MIME_TO_EXT.get(base_type, "webm")
    filename = f"{uuid.uuid4()}_recording.{ext}"
    audio_url = await audio_service.upload_audio(content, filename)
    
    # 4. Create Metadata Record
    record_id = str(uuid.uuid4())
    metadata = {
        "_id": record_id,
        "title": f"Recording {datetime.utcnow().strftime('%Y-%m-%d %H:%M')}",
        "processing_status": ProcessingStatus.UPLOADED,
        "audio_url": audio_url,
        "original_filename": filename,
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

async def process_record_task(record_id: str, audio_url: str) -> dict | None:
    """
    Background Task executing the standard pipeline and updating status iteratively,
    orchestrating extraction, contexts, translated models, and agent verification.

    Args:
        record_id (str): Reference string correlating to the uploaded blob ID.
        audio_url (str): Derived logical routing indicating the filesystem endpoint.
        
    Returns:
        dict | None: For quarantined pipelines early return dictionary with summary, None for success paths.
    """
    try:
        print(f"Starting pipeline for {record_id}")
        await log_stage(record_id, "pipeline_start", "success")
        
        # 1. Locate audio file
        filename = audio_url.split("/")[-1]
        file_path = os.path.join("uploads", filename)

        # 2. STT — pass the file path directly so Whisper/ffmpeg reads the
        #    correct container format from the file extension (.webm, .ogg ...)
        await log_stage(record_id, "stt", "started")
        stt_result = await stt_service.transcribe(file_path)
        transcript = stt_result["text"].strip()
        transcript_word_count = len(transcript.split())

        if not transcript:
            raise ValueError("No speech detected in the recording. Please speak clearly and try again.")
        if transcript_word_count < MIN_TRANSCRIPT_WORDS:
            raise ValueError("The recording was too short to understand. Please record at least a short sentence and try again.")
            
        language = stt_result["language"]
        
        await db.db.knowledge.update_one(
            {"_id": record_id},
            {"$set": {"transcript": transcript, "detected_language": language}}
        )
        await log_stage(record_id, "stt", "success")
        
        # Stage 1: Extraction
        await log_stage(record_id, "extraction", "started")
        extraction_data = await agent_manager.process_extraction(transcript)
        
        # Extract title from extraction_data
        generated_title = extraction_data.get("title") if isinstance(extraction_data, dict) else None
        
        # Update metadata title if generated
        if generated_title:
            await db.db.knowledge.update_one(
                {"_id": record_id},
                {"$set": {"title": generated_title}}
            )
            
        await log_stage(record_id, "extraction", "success")

        # Stage 2: Categorization and Context (Parallelized)
        await log_stage(record_id, "categorization", "started")
        await log_stage(record_id, "context", "started")
        
        cat_data, context_data = await asyncio.gather(
            agent_manager.process_categorization(transcript),
            agent_manager.process_context(transcript)
        )
        category = cat_data.get("category", "Uncategorized")
        
        # Update metadata (for filtering)
        await db.db.knowledge.update_one({"_id": record_id}, {"$set": {"category": category}})
        
        await log_stage(record_id, "categorization", "success")
        await log_stage(record_id, "context", "success")

        # --- VERIFICATION LAYER ---
        verification_input = {
            "transcript": transcript,
            "extraction_data": extraction_data,
            "category": category,
            "context_analysis": context_data,
            "region": "unknown", 
            "language": language,
            "knowledge_id": record_id
        }

        await log_stage(record_id, "verification_started", "in_progress")

        safety_r, auth_r, sens_r, comp_r, dup_r = await asyncio.gather(
            execute_with_fallback(safety_agent, verification_input),
            execute_with_fallback(authenticity_agent, verification_input),
            execute_with_fallback(sensitivity_agent, verification_input),
            execute_with_fallback(completeness_agent, verification_input),
            execute_with_fallback(duplication_agent, verification_input)
        )
        
        await log_stage(record_id, "verification_safety_complete", "success")
        await log_stage(record_id, "verification_authenticity_complete", "success")
        await log_stage(record_id, "verification_sensitivity_complete", "success")
        await log_stage(record_id, "verification_completeness_complete", "success")
        await log_stage(record_id, "verification_duplication_complete", "success")

        aggregation = await score_aggregator_agent.process({
            "agent_results": [safety_r, auth_r, sens_r, comp_r, dup_r],
            "transcript": transcript,
            "category": category
        })
        
        await log_stage(record_id, "verification_aggregated", "success")

        routing = await decision_router_agent.process({
            **aggregation,
            "knowledge_id": record_id
        })

        # Early exit for quarantined entries
        if not routing["continue_pipeline"]:
            print(f"Pipeline quarantined at verification for {record_id}")
            return {
                "status": "quarantined",
                "knowledge_id": record_id,
                "risk_level": aggregation["risk_level"],
                "composite_score": aggregation["composite_score"]
            }
        # --------------------------

        # Stage 3: Education and Translation (Parallelized)
        await log_stage(record_id, "education", "started")
        edu_coro = agent_manager.process_education(transcript, language)
        
        if language == "en":
            print(f"Skipping translation for English content (record {record_id})")
            edu_result = await edu_coro
            trans_result = {}
            await log_stage(record_id, "translation", "skipped_en")
        else:
            await log_stage(record_id, "translation", "started")
            edu_result, trans_result = await asyncio.gather(
                edu_coro,
                agent_manager.process_translation(transcript)
            )
            await log_stage(record_id, "translation", "success")
            
        await log_stage(record_id, "education", "success")

        # Save all outputs to knowledge_content
        await db.db.knowledge_content.update_one(
            {"knowledge_id": record_id},
            {"$set": {
                "extraction_data": extraction_data,
                "categorization": cat_data,
                "context_data": context_data,
                "education_data": edu_result,
                "translations": trans_result,
                "verification_summary": {
                    "risk_level": aggregation["risk_level"],
                    "composite_score": aggregation["composite_score"],
                    "disclaimer": routing.get("disclaimer"),
                    "agent_scores": aggregation["agent_scores"]
                }
            }}
        )

        # Completion Status
        status_action = routing.get("action", "approve")
        final_status = {"approve": "verified", "flag": "flagged", "quarantine": "quarantined"}.get(status_action, "verified")

        # 8. Completion
        await db.db.knowledge.update_one(
            {"_id": record_id},
            {"$set": {
                "processing_status": ProcessingStatus.COMPLETED,
                "verification_status": final_status,
                "disclaimer": routing.get("disclaimer"),
                "processing_error": None,
                "updated_at": datetime.utcnow()
            }}
        )
        
        if final_status == "flagged":
            await log_stage(record_id, "verification_flagged", "completed")
        else:
            await log_stage(record_id, "verification_complete", "completed")
            
        await log_stage(record_id, "pipeline", "completed")
        print(f"Pipeline finished for {record_id}")

    except Exception as e:
        error_message = str(e)
        print(f"Pipeline failed for {record_id}: {e}")
        await db.db.knowledge.update_one(
            {"_id": record_id},
            {"$set": {
                "processing_status": ProcessingStatus.FAILED,
                "processing_error": error_message,
                "updated_at": datetime.utcnow()
            }}
        )
        await log_stage(record_id, "pipeline", "failed", error_message)

@router.post("/process/{record_id}")
@limiter.limit("5/minute")
async def start_processing(
    request: Request,
    record_id: str, 
    background_tasks: BackgroundTasks,
    user_payload: dict = Depends(verify_token)
) -> dict:
    """
    Initiate parallelized background AI processing on a pre-uploaded recorded blob ID.

    Args:
        request (Request): The request entity context.
        record_id (str): The valid mapped knowledge document ID requested to be processed.
        background_tasks (BackgroundTasks): Native router structure allowing offloaded processing.
        user_payload (dict, optional): Injection resolution verifying active Clerk Auth sessions.

    Returns:
        dict: Confirms successful enqueuing against background handlers.
    """
    doc = await db.db.knowledge.find_one({"_id": record_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Record not found")
        
    await db.db.knowledge.update_one(
        {"_id": record_id},
        {"$set": {
            "processing_status": ProcessingStatus.PROCESSING,
            "processing_error": None,
            "updated_at": datetime.utcnow()
        }}
    )
    
    background_tasks.add_task(process_record_task, record_id, doc["audio_url"])
    
    return {"message": "Processing started", "record_id": record_id, "status": "processing"}

@router.get("/status/{record_id}")
async def get_status(record_id: str) -> dict:
    """
    Query real-time metadata status structures or operational error messages on an active processing run.

    Args:
        record_id (str): The designated instance processing ID being queried.

    Returns:
        dict: Comprehensive aggregation describing progress, statuses, metadata summaries, and errors.
    """
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
            "transcript_preview": (metadata.get("transcript") or "")[:100],
            "processing_error": metadata.get("processing_error"),
            "verification_status": metadata.get("verification_status"),
            "disclaimer": metadata.get("disclaimer")
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
            "translations": list(content.get("translations", {}).keys()) if content.get("translations") else [],
            "verification_summary": content.get("verification_summary")
        }
        
    return response
