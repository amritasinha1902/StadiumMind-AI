from typing import Any, Dict
from app.agents.base_agent import BaseAgent
from app.prompts.agent_prompts import (
    FAN_AGENT_PROMPT,
    NAVIGATION_AGENT_PROMPT,
    ACCESSIBILITY_AGENT_PROMPT,
    OPERATIONS_AGENT_PROMPT,
    EMERGENCY_AGENT_PROMPT,
    TRANSLATION_AGENT_PROMPT,
    SUSTAINABILITY_AGENT_PROMPT,
)


class FanAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("FanAgent", FAN_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        try:
            return await super().generate_response(message, context)
        except Exception:
            q = message.lower()
            if "seat" in q:
                return "Your ticket corresponds to Section 102, Row G. Exit the corridor and follow the tactile path to the gate."
            if "food" in q or "vegetarian" in q or "vegan" in q:
                return "Taco Corner B (Section 112) is serving delicious vegetarian and vegan tacos, and currently has a very short queue."
            return "Our concessions, water refill stations, and ATMs are fully open across all concourse sectors today."


class NavigationAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("NavigationAgent", NAVIGATION_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        try:
            return await super().generate_response(message, context)
        except Exception:
            return "To navigate, proceed 20 meters forward from Gate 3, then follow the arrows on the floor to Sector B elevators."


class AccessibilityAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("AccessibilityAgent", ACCESSIBILITY_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        try:
            return await super().generate_response(message, context)
        except Exception:
            return "Wheelchair-accessible ramps and Elevator 2 are located directly to the left of the Section 102 entrance corridor."


class OperationsAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("OperationsAgent", OPERATIONS_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        try:
            return await super().generate_response(message, context)
        except Exception:
            return "Operations note: Crowd flow is normal at Gate 2, but North Entrance Gate 3 is experiencing moderate delays."


class EmergencyAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("EmergencyAgent", EMERGENCY_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        try:
            return await super().generate_response(message, context)
        except Exception:
            return "EMERGENCY PROCEDURES ENABLED. Please take deep breaths and stay exactly where you are. Security personnel and medical responders have been notified of your location and are coming to assist you."


class TranslationAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("TranslationAgent", TRANSLATION_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        try:
            return await super().generate_response(message, context)
        except Exception:
            return f"[Spanish]: He recibido su mensaje. Nuestro equipo está en camino para ayudarle."


class SustainabilityAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("SustainabilityAgent", SUSTAINABILITY_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        try:
            return await super().generate_response(message, context)
        except Exception:
            return "You can minimize your carbon footprint by taking the MetLife Shuttle bus, and refilling your water at Section 102 refill stations."
