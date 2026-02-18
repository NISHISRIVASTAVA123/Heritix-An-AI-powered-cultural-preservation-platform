import os
import aiofiles

class AudioService:
    async def upload_audio(self, file_content: bytes, filename: str) -> str:
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        file_path = os.path.join(upload_dir, filename)
        
        async with aiofiles.open(file_path, 'wb') as out_file:
            await out_file.write(file_content)
            
        # Return URL accessible via static mount
        return f"http://localhost:8000/uploads/{filename}"

audio_service = AudioService()

