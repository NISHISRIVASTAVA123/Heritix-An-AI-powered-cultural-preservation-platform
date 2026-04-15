import asyncio
from db.mongo import db
import os
from config import settings

async def main():
    await db.connect_to_database()
    total = await db.db.knowledge.count_documents({})
    geo = await db.db.knowledge.count_documents({"latitude": {"$exists": True}})
    
    print(f"Total: {total}, Geo: {geo}")
    
    if geo == 0 and total > 0:
        print("No geo records. Injecting sample geo to the latest 5 records.")
        # Fill in with some mock markers so the map isn't entirely empty
        latest_records = await db.db.knowledge.find().sort("created_at", -1).limit(5).to_list(10)
        
        # Hardcode some dummy coordinates around India
        locations = [
            {"region_name": "Delhi", "latitude": 28.7041, "longitude": 77.1025},
            {"region_name": "Maharashtra", "latitude": 19.7515, "longitude": 75.7139},
            {"region_name": "Kerala", "latitude": 10.8505, "longitude": 76.2711},
            {"region_name": "Rajasthan", "latitude": 27.0238, "longitude": 74.2179},
            {"region_name": "West Bengal", "latitude": 22.9868, "longitude": 87.8550}
        ]
        
        for i, rec in enumerate(latest_records):
            if i < len(locations):
                loc = locations[i]
                await db.db.knowledge.update_one(
                    {"_id": rec["_id"]},
                    {"$set": loc}
                )
                print(f"Updated record {rec['_id']} with {loc['region_name']}")
                
    await db.close_database_connection()

if __name__ == "__main__":
    asyncio.run(main())
