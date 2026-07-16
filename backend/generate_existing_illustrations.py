import asyncio
import os
import urllib.parse
import httpx
from motor.motor_asyncio import AsyncIOMotorClient

async def generate_illustration(record_id: str, title: str, category: str) -> str | None:
    try:
        prompt = f"A beautiful illustration of {title}, in traditional Indian folk art style, warm colors, detailed cultural elements, {category}"
        encoded_prompt = urllib.parse.quote(prompt)
        url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=512&height=512&nologo=true&private=true"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url)
            if response.status_code == 200 and len(response.content) > 1000:
                os.makedirs("uploads", exist_ok=True)
                filename = f"{record_id}_illustration.jpg"
                file_path = os.path.join("uploads", filename)
                with open(file_path, "wb") as f:
                    f.write(response.content)
                print(f"Generated illustration for {title} ({record_id})")
                return f"http://localhost:8000/uploads/{filename}"
    except Exception as e:
        print(f"Error generating illustration for {record_id}: {e}")
    return None

async def main():
    client = AsyncIOMotorClient("mongodb+srv://bhavya14:bhavya142004@clusterdatastorage.rbg6wjr.mongodb.net/")
    db = client["heritix"]
    print("Connected to DB")
    
    # Find records with completed status that don't have illustration_url
    cursor = db.knowledge.find({
        "processing_status": "completed",
        "illustration_url": {"$exists": False}
    })
    
    records = await cursor.to_list(None)
    print(f"Found {len(records)} records without illustrations.")
    
    for record in records:
        record_id = record["_id"]
        title = record.get("title", "Cultural Heritage")
        category = record.get("category", "Heritage")
        
        url = await generate_illustration(record_id, title, category)
        if url:
            await db.knowledge.update_one(
                {"_id": record_id},
                {"$set": {"illustration_url": url}}
            )
            # Sleep slightly to avoid overwhelming the server
            await asyncio.sleep(1.0)
            
    print("Migration finished!")

if __name__ == "__main__":
    asyncio.run(main())
