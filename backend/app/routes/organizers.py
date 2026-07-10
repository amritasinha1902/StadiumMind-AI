from fastapi import APIRouter
from app.api import organizers as organizers_api

router = APIRouter()

router.add_api_route(
    "/dashboard",
    organizers_api.get_dashboard,
    methods=["GET"],
    summary="Get organizer dashboard metrics",
)

router.add_api_route(
    "/reports",
    organizers_api.get_reports,
    methods=["GET"],
    summary="List AI-generated reports",
)

router.add_api_route(
    "/insights",
    organizers_api.generate_insight,
    methods=["POST"],
    summary="Generate an AI insight from provided data",
)
