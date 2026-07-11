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

    def _format_system_prompt(self, template: str, context: Dict[str, Any]) -> str:
        """Replace placeholders in prompt template with dynamic context values safely."""
        gate_val = context.get("gate") or "None detected"
        seat_val = context.get("seat") or "None detected"
        parking_val = context.get("parking") or "None detected"
        accessibility_val = context.get("accessibility") or "Standard Route"
        food_val = context.get("food") or "No preference"
        transit_val = context.get("transit") or "Standard Transit"
        language_val = context.get("language") or "English"

        res = template
        res = res.replace("{gate}", str(gate_val))
        res = res.replace("{seat}", str(seat_val))
        res = res.replace("{parking}", str(parking_val))
        res = res.replace("{accessibility}", str(accessibility_val))
        res = res.replace("{food}", str(food_val))
        res = res.replace("{transit}", str(transit_val))
        res = res.replace("{language}", str(language_val))
        return res

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        """Generate response via Gemini using the agent's system prompt context. Overridable."""
        # 1. Dynamic Context Injection into the system instruction
        system_instruction = self._format_system_prompt(self.system_prompt, context)

        # 2. Conversation Memory formatting
        history_str = ""
        chat_history = context.get("history") or []
        if chat_history:
            history_str += "Conversation History:\n"
            for h in chat_history:
                # h could be a Pydantic object or a dict
                role = getattr(h, "role", None) or h.get("role")
                content = getattr(h, "content", None) or h.get("content")
                role_label = "User" if role == "user" else "Assistant"
                history_str += f"{role_label}: {content}\n"
            history_str += "\n"

        # 3. Clean query construction
        clean_context = {k: v for k, v in context.items() if k != "history"}
        prompt = f"{history_str}User Question: {message}\n"
        if clean_context:
            prompt += f"Context Metadata: {clean_context}\n"

        try:
            return await self._gemini.generate(
                prompt=prompt,
                system_instruction=system_instruction,
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
