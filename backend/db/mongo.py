from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    async def connect_to_database(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.client[settings.DB_NAME]
        print("Connected to MongoDB")
        
        # Create Indices
        try:
            # Knowledge Metadata Indices
            await self.db.knowledge.create_index([("transcript", "text")])
            await self.db.knowledge.create_index("category")
            await self.db.knowledge.create_index("detected_language")
            await self.db.knowledge.create_index("processing_status")
            
            # Knowledge Content Indices
            await self.db.knowledge_content.create_index("knowledge_id", unique=True)
            
            # Processing Log Indices
            await self.db.processing_logs.create_index("knowledge_id")
            await self.db.processing_logs.create_index("stage")
            
            print("MongoDB indices created successfully")
        except Exception as e:
            print(f"Error creating indices: {e}")

    async def close_database_connection(self):
        self.client.close()
        print("Closed MongoDB connection")

db = MongoDB()
