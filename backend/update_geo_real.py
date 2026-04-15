import asyncio
import sys
import os

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from db.mongo import db
from agents.agent_manager import AgentManager
from config import settings

async def reprocess_geo():
    await db.connect_to_database()
    agent_manager = AgentManager()
    
    # Get all completed records
    records_cursor = db.db.knowledge.find({"processing_status": "completed"})
    records = await records_cursor.to_list(length=None)
    
    print(f"Found {len(records)} completed records. Extracting real geographical insights for each...")
    
    updated_count = 0
    for record in records:
        transcript = record.get("transcript")
        
        if not transcript or len(transcript.strip()) < 10:
            print(f"Skipping {record['_id']}: No valid transcript.")
            continue
            
        print(f"Processing ID {record['_id']}: '{record.get('title', 'Untitled')}'")
        
        try:
            # Run extraction agent again to get real insights
            extraction_data = await agent_manager.process_extraction(transcript)
            
            region_name = extraction_data.get("region_name") if isinstance(extraction_data, dict) else None
            latitude = extraction_data.get("latitude") if isinstance(extraction_data, dict) else None
            longitude = extraction_data.get("longitude") if isinstance(extraction_data, dict) else None
            
            update_fields = {}
            if region_name:
                update_fields["region_name"] = region_name
            if latitude is not None and longitude is not None:
                try:
                    update_fields["latitude"] = float(latitude)
                    update_fields["longitude"] = float(longitude)
                except ValueError:
                    pass
            
            if update_fields:
                await db.db.knowledge.update_one(
                    {"_id": record["_id"]},
                    {"$set": update_fields}
                )
                print(f"  -> Extracted: {region_name} ({latitude}, {longitude})")
                updated_count += 1
            else:
                print("  -> Could not extract geographical data.")
                
        except Exception as e:
            print(f"  -> Error processing: {e}")
            
    print(f"Finished. Successfully extracted real insights for {updated_count} records.")
    await db.close_database_connection()

if __name__ == "__main__":
    asyncio.run(reprocess_geo())
