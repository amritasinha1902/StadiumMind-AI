from fastapi import APIRouter

from app.api import fan_copilot as fan_copilot_api
from app.models.fan_copilot import (
    CopilotChatResponse,
    RecommendationRequest,
)

router = APIRouter()

router.add_api_route(
    "/chat",
    fan_copilot_api.chat,
    methods=["POST"],
    response_model=CopilotChatResponse,
    summary="Chat naturally with the Fan Co-pilot assistant",
)

router.add_api_route(
    "/translate",
    fan_copilot_api.translate,
    methods=["POST"],
    summary="Translate dialogue text between languages",
)

router.add_api_route(
    "/parking",
    fan_copilot_api.save_parking,
    methods=["POST"],
    summary="Persist / save user parking location spot",
)

router.add_api_route(
    "/preferences",
    fan_copilot_api.update_preferences,
    methods=["POST"],
    summary="Synchronize fan co-pilot user preferences context",
)

router.add_api_route(
    "/recommendations",
    fan_copilot_api.get_recommendations,
    methods=["POST"],
    summary="List smart personalized concessions or facilities",
)
