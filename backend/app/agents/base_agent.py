import time
from typing import Any, Dict

from app.ai.gemini_client import GeminiClient
from app.utils.logger import get_logger

logger = get_logger(__name__)


class BaseAgent:
    """Abstract Base Agent class defining interface for specialized sub-agents."""

    name:          str
    system_prompt: str

    def __init__(self, name: str, system_prompt: str) -> None:
        self.name = name
        self.system_prompt = system_prompt
        self._gemini = GeminiClient()

    def validate_input(self, message: str) -> bool:
        """Validate input message safety and length constraints. Overridable."""
        if not message.strip():
            return False
        if len(message) > 2000:
            return False
        return True

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        """Generate response via Gemini using the agent's system prompt context. Overridable."""
        # Standard query format combining user message and context history details
        prompt = f"User Question: {message}\n"
        if context:
            prompt += f"Context Metadata: {context}\n"

        try:
            return await self._gemini.generate(
                prompt=prompt,
                system_instruction=self.system_prompt,
            )
        except Exception as exc:
            logger.error("Agent %s failed response generation: %s", self.name, exc)
            return f"[Agent {self.name} Fallback]: I received your request and am processing it, but am currently in fallback mode."

    async def execute(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Execute input validation, response generation, and measure performance latency."""
        start_time = time.time()
        is_valid   = self.validate_input(message)

        if not is_valid:
            return {
                "agent": self.name,
                "response": "Input validation failed. Message was empty or exceeded size constraints.",
                "execution_time_ms": int((time.time() - start_time) * 1000),
                "success": False,
            }

        response = await self.generate_response(message, context)
        execution_time_ms = int((time.time() - start_time) * 1000)

        logger.info("Executed agent %s in %d ms", self.name, execution_time_ms)

        return {
            "agent": self.name,
            "response": response,
            "execution_time_ms": execution_time_ms,
            "success": True,
        }
