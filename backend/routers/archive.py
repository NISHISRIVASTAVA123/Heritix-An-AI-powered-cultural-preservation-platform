from fastapi import APIRouter, Depends, HTTPException
from db.mongo import db
from typing import List, Optional

router = APIRouter()

@router.get("/all")
async def get_all_records() -> List[dict]:
    """
    Retrieve all processed records from the database.

    Returns:
        List[dict]: A list of aggregated records with metadata and summary content.
    """
    # Use aggregation to join with content and get summary
    pipeline = [
        {
            "$match": {
                "processing_status": "completed",
                "title": {"$exists": True, "$ne": None},
                "transcript": {"$exists": True, "$ne": None},
                "category": {"$exists": True, "$ne": None}
            }
        },
        {"$sort": {"created_at": -1}},
        {"$limit": 100},
        {
            "$lookup": {
                "from": "knowledge_content",
                "localField": "_id",
                "foreignField": "knowledge_id",
                "as": "content"
            }
        },
        {"$unwind": {"path": "$content", "preserveNullAndEmptyArrays": True}}
    ]
    
    records = await db.db.knowledge.aggregate(pipeline).to_list(100)
    
    # Format and flattening
    formatted_records = []
    for r in records:
        r["_id"] = str(r["_id"])
        
        # Ensure default values for required frontend fields
        if "category" not in r: r["category"] = "Uncategorized"
        if "transcript" not in r: r["transcript"] = ""
        if "title" not in r: r["title"] = "Untitled Recording"
        if "contributor" not in r: r["contributor"] = "Anonymous"
        
        # Flatten summary
        content = r.get("content", {})
        if content:
             edu = content.get("education_data", {})
             if edu:
                 r["summary"] = edu.get("summary")
        
        # Remove content object to keep response light if not needed, 
        # but ArchivePage doesn't use it except for summary.
        if "content" in r: del r["content"]
        
        formatted_records.append(r)
        
    return formatted_records

@router.get("/search")
async def search_records(
    q: Optional[str] = None,
    category: Optional[str] = None,
    language: Optional[str] = None
) -> List[dict]:
    """
    Search and stream completed records based on query, category, and language.

    Args:
        q (Optional[str]): The broad search query matching the title or transcript.
        category (Optional[str]): Filters records explicitly mapped to this category.
        language (Optional[str]): Filters records matching the STT detected language code.

    Returns:
        List[dict]: A list of flat metadata dictionaries fulfilling the search criteria.
    """
    pipeline = []

    # 1. Match Stage (Filters)
    match_query = {
        "processing_status": "completed",
        "title": {"$exists": True, "$ne": None},
        "transcript": {"$exists": True, "$ne": None},
        "category": {"$exists": True, "$ne": None}
    }
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

@router.get("/{record_id}")
async def get_record_by_id(record_id: str) -> dict:
    """
    Fetch a detailed record overview by its unique identifier.

    Args:
        record_id (str): The unique ID of the specific record to query.

    Returns:
        dict: A fully combined structure of record metadata and specific nested agent content arrays.

    Raises:
        HTTPException: If the record could not be found via `record_id`.
    """
    # 1. Fetch Metadata
    metadata = await db.db.knowledge.find_one({"_id": record_id})
    if not metadata:
        raise HTTPException(status_code=404, detail="Record not found")

    # 2. Fetch Content
    content = await db.db.knowledge_content.find_one({"knowledge_id": record_id})
    
    # 3. Merge & Format
    result = {
        "_id": record_id,
        "title": metadata.get("title"),
        "category": metadata.get("category"),
        "contributor": metadata.get("contributor"),
        "transcript": metadata.get("transcript"),
        "audio_url": metadata.get("audio_url"),
        "created_at": metadata.get("created_at"),
        "processing_status": metadata.get("processing_status"),
        # Content fields
        "education_data": content.get("education_data") if content else None,
        "translations": content.get("translations") if content else None,
        "extraction_data": content.get("extraction_data") if content else None,
        "context_data": content.get("context_data") if content else None
    }
    
    return result
