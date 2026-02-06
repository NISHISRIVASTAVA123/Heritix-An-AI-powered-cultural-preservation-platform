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

class KnowledgeRecord(KnowledgeBase):
    id: str = Field(..., alias="_id")
    transcript: str
    audio_url: Optional[str] = None
    category: Optional[str] = None
    extraction_data: Optional[Dict] = None
    context_data: Optional[Dict] = None
    education_data: Optional[Dict] = None

    class Config:
        populate_by_name = True
