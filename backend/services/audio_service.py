class AudioService:
    async def upload_audio(self, file_content: bytes, filename: str) -> str:
        # Placeholder for Cloudinary/S3 upload
        # Returns a mock URL
        return f"https://mock-storage.com/audio/{filename}"

audio_service = AudioService()
