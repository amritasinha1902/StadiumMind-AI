from typing import Any, Dict

from app.models.command_center import (
    CommandCenterStatusResponse,
    IncidentResolveRequest,
    ReportGenerationRequest,
    ReportGenerationResponse,
)
from app.services.command_center_service import CommandCenterService

_service = CommandCenterService()


async def get_status(role: str) -> CommandCenterStatusResponse:
    return await _service.get_status(role)


async def resolve_incident(request: IncidentResolveRequest) -> Dict[str, Any]:
    return await _service.resolve_incident(request.incident_id)


async def generate_report(request: ReportGenerationRequest) -> ReportGenerationResponse:
    return await _service.generate_report(request.type)
