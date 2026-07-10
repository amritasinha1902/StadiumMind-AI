from typing import Any, Dict, List

from app.models.multi_agent import (
    IntentTestRequest,
    IntentTestResponse,
    MemoryModel,
    MultiAgentChatRequest,
    MultiAgentChatResponse,
    RoutePlanningRequest,
)
from app.prompts.agent_prompts import (
    ACCESSIBILITY_AGENT_PROMPT,
    EMERGENCY_AGENT_PROMPT,
    FAN_AGENT_PROMPT,
    NAVIGATION_AGENT_PROMPT,
    OPERATIONS_AGENT_PROMPT,
    SUPERVISOR_INTENT_PROMPT,
    SUPERVISOR_MERGE_PROMPT,
    SUSTAINABILITY_AGENT_PROMPT,
    TRANSLATION_AGENT_PROMPT,
)
from app.services.multi_agent_service import MultiAgentService

_service = MultiAgentService()


async def chat(request: MultiAgentChatRequest) -> MultiAgentChatResponse:
    return await _service.chat(request)


async def route_intent(request: RoutePlanningRequest) -> List[str]:
    return await _service.route_intent(request.message)


async def test_intent(request: IntentTestRequest) -> IntentTestResponse:
    intents = await _service.route_intent(request.message)
    return IntentTestResponse(intents=intents)


async def get_memory() -> MemoryModel:
    # Expose a default memory structure
    return MemoryModel()


async def get_prompts() -> Dict[str, str]:
    # Return dictionary of agent system prompts
    return {
        "SupervisorIntent": SUPERVISOR_INTENT_PROMPT,
        "SupervisorMerge": SUPERVISOR_MERGE_PROMPT,
        "FanAgent":         FAN_AGENT_PROMPT,
        "NavigationAgent":  NAVIGATION_AGENT_PROMPT,
        "Accessibility":   ACCESSIBILITY_AGENT_PROMPT,
        "Operations":      OPERATIONS_AGENT_PROMPT,
        "Emergency":       EMERGENCY_AGENT_PROMPT,
        "Translation":     TRANSLATION_AGENT_PROMPT,
        "Sustainability":  SUSTAINABILITY_AGENT_PROMPT,
    }
