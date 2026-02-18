from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime

class KnowledgeBase(BaseModel):
    title: str
    language: Optional[str] = "en"
    contributor: str
    consent: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class KnowledgeCreate(KnowledgeBase):
    pass

from enum import Enum

class ProcessingStatus(str, Enum):
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class KnowledgeMetadata(KnowledgeBase):
    id: str = Field(..., alias="_id")
    transcript: Optional[str] = None
    audio_url: Optional[str] = None
    original_filename: Optional[str] = None
    detected_language: Optional[str] = None
    category: Optional[str] = None # Kept in metadata for easy filtering
    
    processing_status: ProcessingStatus = Field(default=ProcessingStatus.UPLOADED)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True

class KnowledgeContent(BaseModel):
    knowledge_id: str
    extraction_data: Optional[Dict] = None
    context_data: Optional[Dict] = None
    education_data: Optional[Dict] = None
    translations: Optional[Dict[str, str]] = None
    processed_at: datetime = Field(default_factory=datetime.utcnow)

class ProcessingLog(BaseModel):
    knowledge_id: str
    stage: str # upload, stt, extraction, categorization, education, translation
    status: str # success, failed
    error_message: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

