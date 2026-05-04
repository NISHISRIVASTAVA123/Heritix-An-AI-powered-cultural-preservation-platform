import asyncio
import random
from db.mongo import db

async def assign_locations():
    await db.connect_to_database()
    
    # Find records with processing_status="completed" and no location
    cursor = db.db.knowledge.find({
        "processing_status": "completed",
        "location": {"$exists": False}
    })
    
    records = await cursor.to_list(length=None)
    print(f"Found {len(records)} records without location.")
    
    updates = 0
    for record in records:
        # India bounds approx
        lat = random.uniform(15.0, 28.0)
        lng = random.uniform(72.0, 85.0)
        
        await db.db.knowledge.update_one(
            {"_id": record["_id"]},
            {"$set": {
                "location": {
                    "type": "Point",
                    "coordinates": [lng, lat]
                },
                "region": "Randomly Assigned (India)"
            }}
        )
        updates += 1
        
    print(f"Updated {updates} records with random locations.")
    await db.close_database_connection()

if __name__ == "__main__":
    asyncio.run(assign_locations())
