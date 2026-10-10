"""
Whisper ASR wrapper (ML_PIPELINE.md section 5). Real transcription needs
the `openai-whisper` package and a downloaded model checkpoint (set via
WHISPER_MODEL, per SETUP.md's .env). MockTranscriber lets the rest of the
voice pipeline (NLP parsing -> portion -> nutrition -> guardrails) be
built and tested without downloading a model or handling real audio.
"""

import os
import subprocess
import tempfile
from typing import Protocol


class Transcriber(Protocol):
    def transcribe(self, audio_bytes: bytes) -> str: ...


class WhisperTranscriber:
    def __init__(self, model_name: str = "base"):
        import whisper  # local import: optional dep until configured

        self.model = whisper.load_model(model_name)

    def transcribe(self, audio_bytes: bytes) -> str:
        with tempfile.TemporaryDirectory() as directory:
            source = os.path.join(directory, "recording.webm")
            target = os.path.join(directory, "recording.wav")
            with open(source, "wb") as file:
                file.write(audio_bytes)
            subprocess.run(["ffmpeg", "-y", "-i", source, "-ar", "16000", "-ac", "1", target], check=True, capture_output=True)
            result = self.model.transcribe(target, language=None)
        return result["text"].strip()


class MockTranscriber:
    """Fixture transcript — same interface, no model download required."""

    FIXTURE_TRANSCRIPT = "2 chapati and 1 bowl of dal with a piece of paneer"

    def transcribe(self, audio_bytes: bytes) -> str:
        return self.FIXTURE_TRANSCRIPT


def get_transcriber() -> Transcriber:
    model_name = os.environ.get("WHISPER_MODEL")
    if model_name:
        try:
            return WhisperTranscriber(model_name)
        except ImportError:
            pass
    if os.environ.get("USE_MOCK_TRANSCRIBER", "false").lower() == "true":
        return MockTranscriber()
    raise RuntimeError("Configure WHISPER_MODEL or set USE_MOCK_TRANSCRIBER=true for demo mode")
