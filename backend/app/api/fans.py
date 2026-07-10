from typing import List
from fastapi import Query
from app.models.fan import (
    FanQuestion, FanQuestionResponse, MatchInfo,
    NavigationRequest, NavigationResponse, ConcessionInfo,
)
from app.services.fan_service import FanService

_service = FanService()


async def get_match_info(match_id: str) -> MatchInfo:
    return await _service.get_match_info(match_id)


async def get_navigation(request: NavigationRequest) -> NavigationResponse:
    return await _service.get_navigation(request)


async def get_concessions(
    section: str = Query(..., description="Stadium section identifier, e.g. 'A', 'B', '14'"),
) -> List[ConcessionInfo]:
    return await _service.get_concessions(section)


async def ask_fan_question(request: FanQuestion) -> FanQuestionResponse:
    return await _service.answer_fan_question(request)
