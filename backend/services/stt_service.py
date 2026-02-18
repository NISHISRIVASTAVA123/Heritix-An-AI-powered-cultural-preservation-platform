import whisper
import os
import aiofiles

class STTService:
    def __init__(self):
        # Load the model on startup - this might take a moment
        print("Loading Whisper model (small)...")
        self.model = whisper.load_model("small")
        print("Whisper model loaded.")

    async def transcribe(self, audio_content: bytes) -> dict:
        """
        Transcribes audio content using local Whisper model.
        Returns: {"text": str, "language": str}
        """
        try:
            # Whisper requires a file path, so we'll save it temporarily
            temp_filename = "temp_audio_for_stt.wav"
            async with aiofiles.open(temp_filename, 'wb') as f:
                await f.write(audio_content)
            
            # Transcribe
            # result = self.model.transcribe(temp_filename)
            # To get language, we can access it from the result if available, 
            # OR use the lower-level decode which gives more info.
            # But model.transcribe returns a dict with 'text' and 'language' keys in recent versions?
            # Actually, standard whisper.transcribe returns a dict: {"text": "...", "segments": [...], "language": "en"}
            
            result = self.model.transcribe(temp_filename)
            transcript = result["text"]
            language = result.get("language", "unknown")
            
            # Cleanup
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
                
            return {"text": transcript.strip(), "language": language}

        except Exception as e:
            print(f"Error in STT: {e}")
            if os.path.exists("temp_audio_for_stt.wav"):
                 os.remove("temp_audio_for_stt.wav")
            return f"Error transcribing audio: {str(e)}"

stt_service = STTService()

