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
async def search_records(
    q: Optional[str] = None,
    category: Optional[str] = None,
    language: Optional[str] = None
):
    pipeline = []

    # 1. Match Stage (Filters)
    match_query = {}
    if category and category != "All":
        match_query["category"] = category
    if language:
        match_query["detected_language"] = language # Use detected_language

    if match_query:
        pipeline.append({"$match": match_query})

    # 2. Search Stage (Text - if q is provided)
    if q:
        # Simple regex for now (Text index is better but regex works for partial matches on small data)
        # Note: Text index search syntax is different {"$text": {"$search": q}}
        # But we want to search title and transcript.
        # Let's stick to regex on Metadata fields for simplicity and robustness without setup
        pipeline.append({
            "$match": {
                "$or": [
                    {"title": {"$regex": f".*{q}.*", "$options": "i"}},
                    {"transcript": {"$regex": f".*{q}.*", "$options": "i"}}
                ]
            }
        })

    # 3. Lookup Content (to get summary/translations)
    pipeline.append({
        "$lookup": {
            "from": "knowledge_content",
            "localField": "_id",
            "foreignField": "knowledge_id", # This is a string in content, but _id is ObjectId in knowledge?
            # knowledge.insert_one(metadata) -> _id is replaced by string record_id in processing.py!
            # so record_id is string in both.
            "as": "content"
        }
    })

    # 4. Unwind content (optional, but makes access easier)
    pipeline.append({"$unwind": {"path": "$content", "preserveNullAndEmptyArrays": True}})

    # 5. Sort and Limit
    pipeline.append({"$sort": {"created_at": -1}})
    pipeline.append({"$limit": 100})

    records = await db.db.knowledge.aggregate(pipeline).to_list(100)

    # Format results
    formatted_records = []
    for r in records:
        r["_id"] = str(r["_id"])
        # Flatten content structure for frontend if needed, or keeping it nested
        # Let's keep structure but ensure commonly used fields are accessible
        content = r.get("content", {})
        if content:
             # Add summary if available from education_data
             edu = content.get("education_data", {})
             if edu:
                 r["summary"] = edu.get("summary")
        formatted_records.append(r)

    return formatted_records
