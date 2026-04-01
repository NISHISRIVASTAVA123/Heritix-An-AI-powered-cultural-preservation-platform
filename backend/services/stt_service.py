import os

ffmpeg_path = r"C:\ffmpeg\bin"
if ffmpeg_path not in os.environ["PATH"]:
    os.environ["PATH"] += os.pathsep + ffmpeg_path

import whisper

class STTService:
    def __init__(self):
        print("Loading Whisper model (small)...")
        self.model = whisper.load_model("small")
        print("Whisper model loaded.")

    async def transcribe(self, file_path: str) -> dict:
        """
        Transcribes audio from a file path using the local Whisper model.
        Accepts the actual file path so Whisper/ffmpeg can detect the format
        from the file extension correctly (webm, ogg, mp4, wav, etc.)

        Returns: {"text": str, "language": str}
        """
        if not os.path.exists(file_path):
            raise RuntimeError(f"Audio file not found: {file_path}")

        try:
            result = self.model.transcribe(
                file_path,
                fp16=False,                        # Required on CPU / Windows
                task="transcribe",
                condition_on_previous_text=False,  # Prevents hallucination loops on long audio
                verbose=False,
            )
            transcript = result["text"]
            language = result.get("language", "unknown")
            return {"text": transcript.strip(), "language": language}

        except Exception as e:
            print(f"Error in STT for file '{file_path}': {e}")
            raise RuntimeError(f"Transcription failed: {str(e)}") from e

stt_service = STTService()
