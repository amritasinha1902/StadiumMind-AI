from typing import Any, Dict

from app.models.digital_twin import (
    IncidentActionRequest,
    IncidentModel,
    NavigationRequest,
    NavigationResponse,
    TwinStatusResponse,
    WeatherModel,
)
from app.services.digital_twin_service import DigitalTwinService

_service = DigitalTwinService()


async def get_status() -> TwinStatusResponse:
    return await _service.get_status()


async def get_navigation(request: NavigationRequest) -> NavigationResponse:
    return await _service.get_navigation(request)


async def inject_incident() -> IncidentModel:
    return await _service.inject_random_incident()


async def assign_responder(request: IncidentActionRequest) -> Dict[str, Any]:
    return await _service.assign_responder(request)


async def update_weather(status: str) -> WeatherModel:
    return await _service.update_weather(status)


async def set_simulation_speed(speed: float) -> Dict[str, Any]:
    _service.simulator.set_speed(speed)
    return {"status": "success", "speed_multiplier": speed}
