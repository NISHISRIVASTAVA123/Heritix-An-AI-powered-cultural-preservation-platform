from fastapi import APIRouter, Depends
from db.mongo import db
from typing import List, Optional

router = APIRouter()

@router.get("/all")
async def get_all_records():
    records = await db.db.knowledge.find().to_list(100)
    # Convert _id to string for JSON serialization if needed
    for r in records:
        r["_id"] = str(r["_id"])
    return records

@router.get("/search")
async def search_records(q: str):
    # Simple regex search for now
    records = await db.db.knowledge.find({"transcript": {"$regex": q, "$options": "i"}}).to_list(100)
    for r in records:
        r["_id"] = str(r["_id"])
    return records
