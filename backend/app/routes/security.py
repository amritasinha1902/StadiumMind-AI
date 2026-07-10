from fastapi import APIRouter
from app.api import security as security_api

router = APIRouter()

router.add_api_route(
    "/incidents",
    security_api.get_incidents,
    methods=["GET"],
    summary="List security incidents (filterable by status and zone)",
)

router.add_api_route(
    "/incidents",
    security_api.create_incident,
    methods=["POST"],
    summary="Report a new security incident",
    status_code=201,
)

router.add_api_route(
    "/incidents/{incident_id}",
    security_api.update_incident,
    methods=["PUT"],
    summary="Update an existing incident",
)

router.add_api_route(
    "/crowd",
    security_api.get_crowd_status,
    methods=["GET"],
    summary="Get crowd density status by zone",
)

router.add_api_route(
    "/alerts",
    security_api.get_alerts,
    methods=["GET"],
    summary="Get active security alerts",
)
