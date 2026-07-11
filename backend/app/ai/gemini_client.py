import asyncio
from typing import Any, Dict, List, Optional

import google.generativeai as genai

from app.config.settings import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class GeminiClient:
    """Singleton-safe Google Gemini API client for StadiumMind AI."""

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

    async def _call_with_retry(self, func: Any, *args: Any, **kwargs: Any) -> Any:
        """Call async function with exponential backoff retries."""
        max_retries = 3
        initial_delay = 1.0
        backoff_factor = 2.0
        delay = initial_delay

        for attempt in range(1, max_retries + 1):
            try:
                return await func(*args, **kwargs)
            except Exception as exc:
                logger.warning(
                    "Gemini API call failed (attempt %d/%d). Retrying in %.2f seconds... Error: %s",
                    attempt, max_retries, delay, exc
                )
                if attempt == max_retries:
                    logger.error("Gemini API call failed after %d retries.", max_retries)
                    raise
                await asyncio.sleep(delay)
                delay *= backoff_factor

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
    ) -> str:
        """Generate a single-turn text response."""
        try:
            model = self._build_model(system_instruction)
            response = await self._call_with_retry(model.generate_content_async, prompt)
            return response.text
        except Exception as exc:
            logger.error("Gemini generate error after retries: %s", exc)
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
            response = await self._call_with_retry(session.send_message_async, message)
            return response.text
        except Exception as exc:
            logger.error("Gemini chat error after retries: %s", exc)
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
