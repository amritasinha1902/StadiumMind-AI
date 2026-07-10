from fastapi import APIRouter, Query

from app.api import digital_twin as digital_twin_api
from app.models.digital_twin import (
    IncidentModel,
    NavigationResponse,
    TwinStatusResponse,
    WeatherModel,
)

router = APIRouter()

router.add_api_route(
    "/status",
    digital_twin_api.get_status,
    methods=["GET"],
    response_model=TwinStatusResponse,
    summary="Get aggregated live stadium status metrics",
)

router.add_api_route(
    "/navigation",
    digital_twin_api.get_navigation,
    methods=["POST"],
    response_model=NavigationResponse,
    summary="Get stadium smart navigational pathing",
)

router.add_api_route(
    "/incident/inject",
    digital_twin_api.inject_incident,
    methods=["POST"],
    response_model=IncidentModel,
    summary="Simulate / inject a new incident report",
)

router.add_api_route(
    "/assign-responder",
    digital_twin_api.assign_responder,
    methods=["POST"],
    summary="Assign volunteer or medical team to incident",
)

router.add_api_route(
    "/weather/update",
    digital_twin_api.update_weather,
    methods=["POST"],
    response_model=WeatherModel,
    summary="Update weather state trigger recommendation changes",
)
