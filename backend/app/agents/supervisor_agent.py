import time
from typing import Any, Dict, List

from app.ai.gemini_client import GeminiClient
from app.agents.specialized_agents import (
    AccessibilityAgent,
    EmergencyAgent,
    FanAgent,
    NavigationAgent,
    OperationsAgent,
    SustainabilityAgent,
    TranslationAgent,
)
from app.prompts.agent_prompts import SUPERVISOR_INTENT_PROMPT, SUPERVISOR_MERGE_PROMPT
from app.utils.logger import get_logger

logger = get_logger(__name__)


class SupervisorAgent:
    """Orchestrates intent classification, routes requests to specialized agents, and merges responses."""

    def __init__(self) -> None:
        self._gemini = GeminiClient()

        # Instantiate sub-agents
        self.agents = {
            "fan":            FanAgent(),
            "navigation":     NavigationAgent(),
            "accessibility":  AccessibilityAgent(),
            "operations":     OperationsAgent(),
            "emergency":      EmergencyAgent(),
            "translation":    TranslationAgent(),
            "sustainability": SustainabilityAgent(),
        }

    def _fallback_classify(self, message: str) -> List[str]:
        q = message.lower()
        intents = []
        if any(w in q for w in ["help", "emergency", "medical", "faint", "fire", "hurt", "security"]):
            intents.append("emergency")
        if any(w in q for w in ["wheelchair", "elderly", "visually", "ramp", "elevator", "tactile"]):
            intents.append("accessibility")
        if any(w in q for w in ["seat", "gate", "food", "eat", "drink", "concession", "atm", "merchandise", "toilet", "washroom"]):
            intents.append("food")  # Maps to FanAgent
        if any(w in q for w in ["navigate", "guide", "route", "how to reach", "directions"]):
            intents.append("navigation")
        if any(w in q for w in ["metro", "shuttle", "bus", "taxi", "delay", "weather", "rain", "storm"]):
            intents.append("operations")
        if any(w in q for w in ["translate", "spanish", "arabic", "french", "language"]):
            intents.append("translation")
        if any(w in q for w in ["recycle", "green", "carbon", "water refill"]):
            intents.append("sustainability")

        if not intents:
            intents.append("food")  # General FanAgent fallback

        return intents

    async def classify_intents(self, message: str) -> List[str]:
        """Classify user intent into one or more categories."""
        try:
            res = await self._gemini.generate(
                prompt=f"Classify intent: {message}",
                system_instruction=SUPERVISOR_INTENT_PROMPT,
            )
            # Parse comma-separated response
            detected = [i.strip().lower() for i in res.split(",") if i.strip()]
            if not detected:
                raise ValueError("No intents parsed.")
            return detected
        except Exception as exc:
            logger.warning("Supervisor intent classification failed: %s. Using keyword fallback.", exc)
            return self._fallback_classify(message)

    async def orchestrate(self, message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """Classify intents, dispatch sub-agents, and merge responses."""
        start_time = time.time()

        # 1. Classify Intents
        intents = await self.classify_intents(message)
        logger.info("Supervisor detected intents: %s", intents)

        # 2. Select sub-agents
        agents_to_run = []
        # Mapping intents to agents
        if "emergency" in intents:
            agents_to_run.append("emergency")
        if "accessibility" in intents:
            agents_to_run.append("accessibility")
        if "food" in intents or "facilities" in intents or "parking" in intents:
            agents_to_run.append("fan")
        if "navigation" in intents:
            agents_to_run.append("navigation")
        if "operations" in intents or "weather" in intents or "transport" in intents:
            agents_to_run.append("operations")
        if "translation" in intents:
            agents_to_run.append("translation")
        if "sustainability" in intents:
            agents_to_run.append("sustainability")

        # De-duplicate and default
        agents_to_run = list(set(agents_to_run))
        if not agents_to_run:
            agents_to_run = ["fan"]

        # Emergency override: if emergency is one of the intents, prioritize it first
        if "emergency" in intents and "emergency" not in agents_to_run:
            agents_to_run.insert(0, "emergency")

        # 3. Execute sub-agents
        agent_responses = []
        telemetry = []

        for agent_key in agents_to_run:
            agent = self.agents[agent_key]
            res = await agent.execute(message, context)
            agent_responses.append(res["response"])
            telemetry.append({
                "agent_name": agent.name,
                "execution_time_ms": res["execution_time_ms"],
                "success": res["success"],
            })

        # 4. Merge responses
        if len(agent_responses) == 1:
            merged_response = agent_responses[0]
        else:
            try:
                merge_prompt = f"User Question: {message}\nCollected Agent Responses:\n"
                for i, r in enumerate(agent_responses):
                    merge_prompt += f"Response {i+1}: {r}\n"

                merged_response = await self._gemini.generate(
                    prompt=merge_prompt,
                    system_instruction=SUPERVISOR_MERGE_PROMPT,
                )
            except Exception:
                # Basic string merging if Gemini fail
                merged_response = "\n\n".join(agent_responses)

        total_execution_time_ms = int((time.time() - start_time) * 1000)

        return {
            "response":          merged_response,
            "intents":           intents,
            "chosen_agents":     [self.agents[ak].name for ak in agents_to_run],
            "telemetry":         telemetry,
            "total_time_ms":     total_execution_time_ms,
            "confidence_score":  0.95 if "emergency" not in intents else 0.99,
        }
