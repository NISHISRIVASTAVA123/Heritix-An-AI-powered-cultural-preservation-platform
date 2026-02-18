import asyncio
from db.mongo import db
from config import settings
import sys

async def test_connection():
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    print(f"Testing connection to: {settings.MONGODB_URL}")
    print(f"Database: {settings.DB_NAME}")
    
    try:
        await db.connect_to_database()
        
        collection = db.db.test_collection
        sample_data = {"name": "Connection Test", "status": "Success"}
        result = await collection.insert_one(sample_data)
        print(f"Inserted document ID: {result.inserted_id}")
        
        doc = await collection.find_one({"_id": result.inserted_id})
        print(f"Retrieved document: {doc}")
        
        if doc and doc["name"] == "Connection Test":
            print("\n[OK] MongoDB Connection Successful!")
        else:
            print("\n[FAIL] Verification Failed: Document mismatch.")
            
        await collection.delete_one({"_id": result.inserted_id})
        
    except Exception as e:
        print(f"\n[ERROR] Connection Error: {e}")
    finally:
        if db.client:
            db.client.close()

if __name__ == "__main__":
    asyncio.run(test_connection())
