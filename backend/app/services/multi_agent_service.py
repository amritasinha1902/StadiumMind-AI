import re
from typing import Any, Dict, List, Optional

from app.agents.supervisor_agent import SupervisorAgent
from app.models.multi_agent import (
    MemoryModel,
    MultiAgentChatRequest,
    MultiAgentChatResponse,
)
from app.utils.logger import get_logger

logger = get_logger(__name__)


class MultiAgentService:
    def __init__(self) -> None:
        self._supervisor = SupervisorAgent()

    def _update_memory(self, message: str, existing: Optional[MemoryModel]) -> MemoryModel:
        """Parse message query text and extract context properties to cache memory."""
        memory = existing or MemoryModel()

        q = message.lower()

        # 1. Gate detection
        gate_match = re.search(r"\bgate\s+(\w+)\b", q)
        if gate_match:
            memory.current_gate = f"Gate {gate_match.group(1).upper()}"

        # 2. Seat detection
        seat_match = re.search(r"\bseat\s+(\w+)\b", q)
        if seat_match:
            memory.seat_number = f"Seat {seat_match.group(1).upper()}"

        # 3. Parking detection
        parking_match = re.search(r"\bparking\s+(zone|lot)\s+(\w+)\b", q)
        if parking_match:
            memory.parking_location = f"Parking {parking_match.group(1).capitalize()} {parking_match.group(2).upper()}"
        elif "parking" in q or "lot" in q:
            # Check basic colors
            for color in ["blue", "red", "green", "yellow"]:
                if color in q:
                    memory.parking_location = f"Lot {color.capitalize()}"

        # 4. Accessibility pref
        if "wheelchair" in q or "ramp" in q:
            memory.accessibility_pref = "Wheelchair Route"
        elif "visually impaired" in q or "blind" in q:
            memory.accessibility_pref = "Screen/Vocal Reader"
        elif "elderly" in q:
            memory.accessibility_pref = "Elderly Support"

        # 5. Food preference
        if "vegetarian" in q or "veg" in q:
            memory.food_preference = "Vegetarian"
        elif "vegan" in q:
            memory.food_preference = "Vegan"
        elif "halal" in q:
            memory.food_preference = "Halal"
        elif "gluten free" in q:
            memory.food_preference = "Gluten-Free"

        # 6. Language detection
        if "spanish" in q:
            memory.preferred_language = "Spanish"
        elif "arabic" in q:
            memory.preferred_language = "Arabic"
        elif "french" in q:
            memory.preferred_language = "French"

        # 7. Transportation method
        if "metro" in q or "train" in q:
            memory.transportation_method = "Metro"
        elif "shuttle" in q or "bus" in q:
            memory.transportation_method = "Shuttle"
        elif "taxi" in q or "cab" in q:
            memory.transportation_method = "Taxi"

        return memory

    async def chat(self, request: MultiAgentChatRequest) -> MultiAgentChatResponse:
        # Update memory context before execution
        updated_memory = self._update_memory(request.message, request.memory)

        # Build context object matching agent expectations
        context = {
            "gate":          updated_memory.current_gate,
            "seat":          updated_memory.seat_number,
            "parking":       updated_memory.parking_location,
            "accessibility": updated_memory.accessibility_pref,
            "language":      updated_memory.preferred_language,
            "food":          updated_memory.food_preference,
            "transit":       updated_memory.transportation_method,
            "history":       request.history,
        }

        # Run Supervisor Orchestrator pipeline
        res = await self._supervisor.orchestrate(request.message, context)

        return MultiAgentChatResponse(
            response=res["response"],
            intents=res["intents"],
            chosen_agents=res["chosen_agents"],
            telemetry=res["telemetry"],
            total_time_ms=res["total_time_ms"],
            confidence_score=res["confidence_score"],
            memory=updated_memory,
        )

    async def route_intent(self, message: str) -> List[str]:
        return await self._supervisor.classify_intents(message)
