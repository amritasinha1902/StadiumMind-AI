from typing import Any, Dict, List

from app.models.fan_copilot import (
    CopilotChatRequest,
    CopilotChatResponse,
    CopilotTranslateRequest,
    ParkingSaveRequest,
    PreferencesUpdateRequest,
    RecommendationRequest,
)
from app.services.fan_copilot_service import FanCopilotService

_service = FanCopilotService()


async def chat(request: CopilotChatRequest) -> CopilotChatResponse:
    return await _service.chat(request)


async def translate(request: CopilotTranslateRequest) -> Dict[str, str]:
    translated_text = await _service.translate(request)
    return {
        "translated_text": translated_text,
        "target_language": request.target_language,
    }


async def save_parking(request: ParkingSaveRequest) -> Dict[str, str]:
    return {
        "status": "success",
        "message": f"Parking location successfully saved to: {request.location}",
        "saved_location": request.location,
    }


async def update_preferences(request: PreferencesUpdateRequest) -> Dict[str, Any]:
    return {
        "status": "success",
        "message": "User preferences updated in co-pilot context.",
        "preferences": request.preferences,
    }


async def get_recommendations(request: RecommendationRequest) -> List[Dict[str, Any]]:
    return await _service.get_recommendations(request)
