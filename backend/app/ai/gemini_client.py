from typing import Any, Dict, List, Optional

import google.generativeai as genai

from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class GeminiClient:
    """Singleton-safe Google Gemini API client for FIFA Nexus AI."""

    model: str

    def __init__(self) -> None:
        self.model = settings.gemini_model
        genai.configure(api_key=settings.gemini_api_key)
        self._gen_config = genai.types.GenerationConfig(
            temperature=settings.temperature,
            max_output_tokens=settings.max_tokens,
        )

    def _build_model(self, system_instruction: Optional[str] = None) -> genai.GenerativeModel:
        kwargs: Dict[str, Any] = {
            "model_name": self.model,
            "generation_config": self._gen_config,
        }
        if system_instruction:
            kwargs["system_instruction"] = system_instruction
        return genai.GenerativeModel(**kwargs)

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> str:
        """Generate a single-turn text response."""
        try:
            model    = self._build_model(system_instruction)
            response = await model.generate_content_async(prompt)
            return response.text
        except Exception as exc:
            logger.error("Gemini generate error: %s", exc)
            raise

    async def chat(
        self,
        message: str,
        history: Optional[List[Dict[str, Any]]] = None,
        system_instruction: Optional[str] = None,
    ) -> str:
        """Send a message in a multi-turn chat session."""
        try:
            model   = self._build_model(system_instruction)
            session = model.start_chat(history=history or [])
            response = await session.send_message_async(message)
            return response.text
        except Exception as exc:
            logger.error("Gemini chat error: %s", exc)
            raise

    async def summarize(
        self,
        data: Dict[str, Any],
        summary_type: str,
        language: str = "en",
    ) -> str:
        """Generate a structured summary from a data dict."""
        prompt = (
            f"Generate a concise {summary_type} summary in language code '{language}' "
            f"for the following data:\n\n{data}"
        )
        return await self.generate(prompt)

    async def translate(self, text: str, target_language: str) -> str:
        """Translate text to the specified target language."""
        prompt = (
            f"Translate the following text to {target_language}. "
            f"Return only the translated text, no explanations:\n\n{text}"
        )
        return await self.generate(prompt)
