from fastapi import APIRouter
from app.api import venue as venue_api

router = APIRouter()

router.add_api_route(
    "/{venue_id}/facilities",
    venue_api.get_facilities,
    methods=["GET"],
    summary="Get facility statuses for a venue",
)

router.add_api_route(
    "/{venue_id}/status",
    venue_api.get_operational_status,
    methods=["GET"],
    summary="Get overall venue operational status",
)

router.add_api_route(
    "/{venue_id}/issues",
    venue_api.report_issue,
    methods=["POST"],
    summary="Report a venue facility issue",
    status_code=201,
)
