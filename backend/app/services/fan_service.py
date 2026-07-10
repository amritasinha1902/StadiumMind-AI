from datetime import datetime
from typing import List
from app.ai.gemini_client import GeminiClient
from app.models.fan import (
    ConcessionInfo, ConcessionStatus, FanQuestion, FanQuestionResponse,
    MatchInfo, NavigationRequest, NavigationResponse,
)
from app.prompts.fan_prompts import FAN_ASSISTANT_PROMPT


class FanService:
    def __init__(self) -> None:
        self._gemini = GeminiClient()

    async def get_match_info(self, match_id: str) -> MatchInfo:
        return MatchInfo(
            match_id=match_id,
            home_team="Brazil",
            away_team="Argentina",
            score_home=2,
            score_away=1,
            minute=67,
            venue="MetLife Stadium",
            status="live",
            kickoff_time=datetime.utcnow(),
        )

    async def get_navigation(self, request: NavigationRequest) -> NavigationResponse:
        return NavigationResponse(
            route=["Main Entrance", "Corridor A", "Escalator B", request.destination],
            estimated_time_minutes=5,
            distance_meters=320,
            directions=[
                f"Enter through {request.venue_id} main gate",
                "Follow signs to Corridor A",
                "Take Escalator B to Level 2",
                f"Your destination '{request.destination}' is on the left",
            ],
        )

    async def get_concessions(self, section: str) -> List[ConcessionInfo]:
        return [
            ConcessionInfo(
                stall_id=f"CS-{section}-001",
                name="Stadium Grill",
                section=section,
                wait_time_minutes=8,
                status=ConcessionStatus.OPEN,
                menu_highlights=["Hot Dogs", "Nachos", "Soft Drinks"],
            ),
            ConcessionInfo(
                stall_id=f"CS-{section}-002",
                name="Beverage Bar",
                section=section,
                wait_time_minutes=3,
                status=ConcessionStatus.BUSY,
                menu_highlights=["Beer", "Water", "Juices"],
            ),
        ]

    async def answer_fan_question(self, request: FanQuestion) -> FanQuestionResponse:
        answer = await self._gemini.generate(
            prompt=request.question,
            system_instruction=FAN_ASSISTANT_PROMPT,
        )
        return FanQuestionResponse(answer=answer, language=request.language)
