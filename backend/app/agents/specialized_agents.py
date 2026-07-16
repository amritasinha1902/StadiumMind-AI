import random
import re
from typing import Any, Dict, Optional
from app.agents.base_agent import BaseAgent
from app.utils.logger import get_logger
from app.prompts.agent_prompts import (
    FAN_AGENT_PROMPT,
    NAVIGATION_AGENT_PROMPT,
    ACCESSIBILITY_AGENT_PROMPT,
    OPERATIONS_AGENT_PROMPT,
    EMERGENCY_AGENT_PROMPT,
    TRANSLATION_AGENT_PROMPT,
    SUSTAINABILITY_AGENT_PROMPT,
)

logger = get_logger(__name__)

# ----------------------------------------------------
# MOCK SEAT DATABASE & LANDMARKS
# ----------------------------------------------------
SEAT_DATABASE = {
    "A23": {"section": "Section A", "row": "Row 2"},
    "B15": {"section": "Section B", "row": "Row 5"},
    "C12": {"section": "Section C", "row": "Row 3"},
}

# Generate 40 additional realistic seats
for i in range(1, 11):
    SEAT_DATABASE[f"A{i}"] = {"section": "Section A", "row": f"Row {i // 2 + 1}"}
for i in range(11, 21):
    SEAT_DATABASE[f"B{i}"] = {"section": "Section B", "row": f"Row {(i - 10) // 2 + 1}"}
for i in range(21, 31):
    SEAT_DATABASE[f"C{i}"] = {"section": "Section C", "row": f"Row {(i - 20) // 2 + 1}"}
for i in range(31, 41):
    SEAT_DATABASE[f"D{i}"] = {"section": "Section D", "row": f"Row {(i - 30) // 2 + 1}"}

STADIUM_LANDMARKS = [
    "Main Information Desk",
    "Official Merchandise Store",
    "North Escalator",
    "Food Court",
    "Medical Center",
    "Restroom Block",
    "VIP Lounge",
    "Security Checkpoint",
    "Digital Information Kiosk"
]

def _extract_seat_code(message: str, context: Dict[str, Any]) -> Optional[str]:
    # Check context first
    seat_val = context.get("seat")
    if seat_val and seat_val != "None detected":
        match = re.search(r"\b([A-D]\d+)\b", str(seat_val), re.IGNORECASE)
        if match:
            return match.group(1).upper()
        val = str(seat_val).replace("Seat", "").strip().upper()
        if val:
            return val

    # Check message
    q = message.lower()
    match = re.search(r"\bseat\s*(?:number)?\s*(?:is)?\s*#?([a-d]\d+)\b", q)
    if match:
        return match.group(1).upper()
    
    match = re.search(r"\b([a-d]\d+)\b", q)
    if match:
        return match.group(1).upper()
        
    return None

def parse_and_generate_route(message: str, context: Dict[str, Any]) -> Dict[str, Any]:
    q = message.lower()
    
    # 1. Determine Gate
    gate = context.get("gate") or "None detected"
    if gate == "None detected":
        gate_match = re.search(r"\bgate\s+(\w+)\b", q)
        if gate_match:
            gate = f"Gate {gate_match.group(1).upper()}"
        else:
            gate = "Gate 1"
            
    # 2. Determine Accessibility
    accessibility = context.get("accessibility") or "Standard Route"
    
    # 3. Determine Route Type
    if "emergency" in q or "evacuation" in q or "exit" in q:
        route_type = "Emergency Route"
    elif "wheelchair" in q or "ramp" in q or accessibility == "Wheelchair Route":
        route_type = "Wheelchair Route"
    elif "crowd" in q or "traffic" in q or "busy" in q or "least crowded" in q:
        route_type = "Least Crowded Route"
    else:
        route_type = "Fastest Route"
        
    # 4. Determine Crowd Level
    if "high" in q:
        crowd_level = "High"
    elif "low" in q:
        crowd_level = "Low"
    else:
        crowd_level = random.choice(["Low", "Medium", "High"])
        
    # 5. Select Landmark
    landmark = random.choice(STADIUM_LANDMARKS)
    
    # 6. Extract Seat
    seat_code = _extract_seat_code(message, context)
                
    # 7. Check Seat DB
    seat_found = False
    section = None
    row = None
    if seat_code:
        if seat_code in SEAT_DATABASE:
            seat_found = True
            section = SEAT_DATABASE[seat_code]["section"]
            row = SEAT_DATABASE[seat_code]["row"]
            
    # 8. Generate dynamic directions list
    directions = []
    if route_type == "Emergency Route":
        directions = [
            f"Locate the nearest emergency exit door near your current position.",
            f"Follow the illuminated green floor markers towards {gate} exit gates.",
            f"Evacuate to the outer stadium assembly zone and await instructions from stadium safety marshals."
        ]
    elif route_type == "Wheelchair Route":
        directions = [
            f"From {gate}, proceed along the ramp on the left side of the concourse.",
            f"Take the passenger elevator adjacent to the {landmark} to the upper deck concourse.",
        ]
        if seat_found:
            directions.append(f"Follow the level tactile walkway to {section}.")
            directions.append(f"Use the step-free access aisle to reach {row}, Seat {seat_code}.")
        else:
            directions.append("Ask a steward for wheelchair assistance if your seating section is not marked on the concourse guides.")
    elif route_type == "Least Crowded Route":
        directions = [
            f"From {gate}, use the outer ring concourse route (crowd congestion at main gates is currently {crowd_level}).",
            f"Walk 40 meters past the {landmark} on your right, which has a very short line.",
        ]
        if seat_found:
            directions.append(f"Enter the seating bowl at the rear entrance of {section}.")
            directions.append(f"Walk down the side stairs to reach {row}, Seat {seat_code}.")
        else:
            directions.append("Look for the blue signs for general low-density seating pathways.")
    else:  # Fastest Route
        directions = [
            f"From {gate}, enter the main concourse corridor.",
            f"Walk straight for 20 meters, turning right just after the {landmark}.",
        ]
        if seat_found:
            directions.append(f"Proceed down the main aisle to {section}.")
            directions.append(f"Go down the stairs to {row}, Seat {seat_code}.")
        else:
            directions.append("Follow the overhead directional banners to your seating zone.")
            
    return {
        "gate": gate,
        "seat_code": seat_code,
        "seat_found": seat_found,
        "section": section,
        "row": row,
        "route_type": route_type,
        "crowd_level": crowd_level,
        "landmark": landmark,
        "directions": directions
    }


class FanAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("FanAgent", FAN_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        try:
            return await super().generate_response(message, context)
        except Exception:
            q = message.lower()
            if "seat" in q:
                seat_code = _extract_seat_code(message, context)
                if seat_code and seat_code in SEAT_DATABASE:
                    seat_info = SEAT_DATABASE[seat_code]
                    return f"Your ticket corresponds to {seat_info['section']}, {seat_info['row']}. Exit the corridor and follow the path to the gate."
                else:
                    return "The exact location of this seat is not available in the current stadium model. Please proceed to the nearest information desk."
            if "food" in q or "vegetarian" in q or "vegan" in q:
                return "Taco Corner B (Section 112) is serving delicious vegetarian and vegan tacos, and currently has a very short queue."
            return "Our concessions, water refill stations, and ATMs are fully open across all concourse sectors today."


class NavigationAgent(BaseAgent):
    def __init__(self) -> None:
        super().__init__("NavigationAgent", NAVIGATION_AGENT_PROMPT)

    async def generate_response(self, message: str, context: Dict[str, Any]) -> str:
        # 1. Generate route data dynamically
        route_data = parse_and_generate_route(message, context)
        
        # 2. Inject computed values into context for prompt formatting
        context["gate"] = route_data["gate"]
        context["seat"] = f"Seat {route_data['seat_code']}" if route_data["seat_code"] else "None detected"
        context["section"] = route_data["section"] or "None detected"
        context["row"] = route_data["row"] or "None detected"
        context["route_type"] = route_data["route_type"]
        context["crowd_level"] = route_data["crowd_level"]
        context["landmark"] = route_data["landmark"]
        
        dir_lines = "\n".join(f"  {i+1}. {step}" for i, step in enumerate(route_data["directions"]))
        context["directions"] = dir_lines
        
        # 3. Format prompt instruction manually to avoid leaving placeholders
        system_instruction = self.system_prompt
        system_instruction = system_instruction.replace("{gate}", str(context["gate"]))
        system_instruction = system_instruction.replace("{seat}", str(context["seat"]))
        system_instruction = system_instruction.replace("{section}", str(context["section"]))
        system_instruction = system_instruction.replace("{row}", str(context["row"]))
        system_instruction = system_instruction.replace("{route_type}", str(context["route_type"]))
        system_instruction = system_instruction.replace("{crowd_level}", str(context["crowd_level"]))
        system_instruction = system_instruction.replace("{landmark}", str(context["landmark"]))
        system_instruction = system_instruction.replace("{directions}", str(context["directions"]))
        system_instruction = system_instruction.replace("{accessibility}", str(context.get("accessibility") or "Standard Route"))
        system_instruction = system_instruction.replace("{language}", str(context.get("language") or "English"))

        history_str = ""
        chat_history = context.get("history") or []
        if chat_history:
            history_str += "Conversation History:\n"
            for h in chat_history:
                role = getattr(h, "role", None) or h.get("role")
                content = getattr(h, "content", None) or h.get("content")
                role_label = "User" if role == "user" else "Assistant"
                history_str += f"{role_label}: {content}\n"
            history_str += "\n"

        prompt = f"{history_str}User Question: {message}\n"
        
        try:
            response = await self._gemini.generate(
                prompt=prompt,
                system_instruction=system_instruction,
            )
        except Exception as exc:
            logger.error("NavigationAgent failed response generation: %s", exc)
            response = "To navigate, please proceed along the concourse and follow the signage."
            
        # Post-process fallback if seat was specified but not found
        if route_data["seat_code"] and not route_data["seat_found"]:
            prefix = "The exact location of this seat is not available in the current stadium model."
            if prefix not in response:
                response = f"{prefix}\n\n{response}"
                
        return response


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
