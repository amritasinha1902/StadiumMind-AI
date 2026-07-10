from fastapi import APIRouter
from app.api import fans as fans_api

router = APIRouter()

router.add_api_route(
    "/matches/{match_id}",
    fans_api.get_match_info,
    methods=["GET"],
    summary="Get live match information",
)

router.add_api_route(
    "/navigation",
    fans_api.get_navigation,
    methods=["POST"],
    summary="Get AI stadium navigation directions",
)

router.add_api_route(
    "/concessions",
    fans_api.get_concessions,
    methods=["GET"],
    summary="Get concession stall availability and wait times",
)

router.add_api_route(
    "/ask",
    fans_api.ask_fan_question,
    methods=["POST"],
    summary="Ask the AI a question as a fan",
)
