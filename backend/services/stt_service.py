class STTService:
    async def transcribe(self, audio_content: bytes) -> str:
        # Placeholder for Whisper/Vosk
        # In production this would call OpenAI Whisper API or run local model
        return "This is a simulated transcription of the audio content. The user is describing a traditional wedding ceremony involving turmeric paste."

stt_service = STTService()
