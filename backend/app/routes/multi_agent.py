from typing import Dict, List

from fastapi import APIRouter

from app.api import multi_agent as multi_agent_api
from app.models.multi_agent import (
    IntentTestResponse,
    MemoryModel,
    MultiAgentChatResponse,
)

router = APIRouter()

router.add_api_route(
    "/chat",
    multi_agent_api.chat,
    methods=["POST"],
    response_model=MultiAgentChatResponse,
    summary="Chat session run via supervisor and sub-agents",
)

router.add_api_route(
    "/route",
    multi_agent_api.route_intent,
    methods=["POST"],
    response_model=List[str],
    summary="Route intent detection explicitly",
)

router.add_api_route(
    "/intent",
    multi_agent_api.test_intent,
    methods=["POST"],
    response_model=IntentTestResponse,
    summary="Expose intent logging metrics",
)

router.add_api_route(
    "/memory",
    multi_agent_api.get_memory,
    methods=["GET"],
    response_model=MemoryModel,
    summary="Query active parsed chat memory model structure",
)

router.add_api_route(
    "/prompts",
    multi_agent_api.get_prompts,
    methods=["GET"],
    response_model=Dict[str, str],
    summary="Query full prompt templates list",
)
