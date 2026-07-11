from fastapi import APIRouter, Query

from app.api import command_center as command_center_api
from app.models.command_center import (
    CommandCenterStatusResponse,
    ReportGenerationResponse,
)

router = APIRouter()

router.add_api_route(
    "/status",
    command_center_api.get_status,
    methods=["GET"],
    response_model=CommandCenterStatusResponse,
    summary="Get aggregated live operational stadium status metrics",
)

router.add_api_route(
    "/incident/resolve",
    command_center_api.resolve_incident,
    methods=["POST"],
    summary="Resolve active stadium incident",
)

router.add_api_route(
    "/report",
    command_center_api.generate_report,
    methods=["POST"],
    response_model=ReportGenerationResponse,
    summary="Request Gemini report generation",
)
