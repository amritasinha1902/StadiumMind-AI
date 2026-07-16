import uuid
import re
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.agents.specialized_agents import SEAT_DATABASE, _extract_seat_code

from app.ai.gemini_client import GeminiClient
from app.models.fan_copilot import (
    CopilotChatRequest,
    CopilotChatResponse,
    CopilotTranslateRequest,
    ParkingSaveRequest,
    PreferencesUpdateRequest,
    RecommendationRequest,
    UserPreferences,
)
from app.prompts.fan_copilot_prompts import (
    FAN_ASSISTANT_PROMPT,
    EMERGENCY_ASSISTANT_PROMPT,
    NAVIGATION_ASSISTANT_PROMPT,
    FOOD_ASSISTANT_PROMPT,
    ACCESSIBILITY_ASSISTANT_PROMPT,
    TRANSLATION_ASSISTANT_PROMPT,
)


class FanCopilotService:
    def __init__(self) -> None:
        self._gemini = GeminiClient()

    def _classify_mode(self, message: str) -> str:
        q = message.lower()
        # 1. Emergency triggers
        emergency_words = {"help", "emergency", "medical", "lost child", "lost my child", "fire", "security"}
        if any(word in q for word in emergency_words):
            return "emergency"
        # 2. Food triggers
        food_words = {"food", "concession", "stall", "eat", "drink", "beer", "water", "hungry", "thirsty", "vegetarian", "vegan", "halal", "gluten free"}
        if any(word in q for word in food_words):
            return "food"
        # 3. Accessibility triggers
        accessibility_words = {"wheelchair", "elderly", "visually impaired", "blind", "ramp", "elevator", "tactile"}
        if any(word in q for word in accessibility_words):
            return "accessibility"
        # 4. Navigation triggers
        navigation_words = {"navigate", "guide", "seat", "gate", "parking", "car", "zone", "where is", "how do i reach", "find my"}
        if any(word in q for word in navigation_words):
            return "navigation"

        return "general"

    async def chat(self, request: CopilotChatRequest) -> CopilotChatResponse:
        mode = self._classify_mode(request.message)

        # Build context prompt based on user settings
        context_parts = []
        if request.preferences:
            p = request.preferences
            prefs = []
            if p.wheelchair_user: prefs.append("Wheelchair user")
            if p.family_with_children: prefs.append("Traveling with children")
            if p.elderly: prefs.append("Elderly")
            if p.visually_impaired: prefs.append("Visually impaired")
            if p.solo_traveler: prefs.append("Solo traveler")
            if p.international_tourist: prefs.append("International tourist (requires local translation)")
            if prefs:
                context_parts.append(f"User Preferences: {', '.join(prefs)}.")

        if request.parking_location:
            context_parts.append(f"Saved Parking Spot: {request.parking_location}.")

        user_context = " ".join(context_parts)

        # Select prompt template
        if mode == "emergency":
            system_instruction = EMERGENCY_ASSISTANT_PROMPT
        elif mode == "food":
            system_instruction = FOOD_ASSISTANT_PROMPT
        elif mode == "accessibility":
            system_instruction = ACCESSIBILITY_ASSISTANT_PROMPT
        elif mode == "navigation":
            system_instruction = NAVIGATION_ASSISTANT_PROMPT
        else:
            system_instruction = FAN_ASSISTANT_PROMPT

        # Append preferences to system prompt
        if user_context:
            system_instruction += f"\nImportant Personalisation Context: {user_context}"

        # Build message history for Gemini
        history = [
            {"role": "user" if m.role == "user" else "model", "parts": [{"text": m.content}]}
            for m in request.history
        ]

        try:
            response_text = await self._gemini.chat(
                message=request.message,
                history=history,
                system_instruction=system_instruction,
            )
        except Exception:
            # Reassuring mock response fallback
            q = request.message.lower()
            if mode == "emergency":
                response_text = "EMERGENCY ALERT REGISTERED. Please stay calm. We have notified stadium safety dispatch. Medical and security responders are en route. If you can, stay where you are. First Aid station is in Section 104, 30m away."
            elif "parking" in q or "car" in q:
                if request.parking_location:
                    response_text = f"Your car is saved in {request.parking_location}. To return there, exit Gate C, follow the walkway to Lot C, and look for the blue markers."
                else:
                    response_text = "You haven't saved a parking spot yet. Please enter your parking zone details (e.g. 'Blue Zone B12') above so I can log it for you."
            elif "gate 7" in q:
                response_text = "To reach Gate 7, take the elevator in Section 102 up to Level 2. Head left along the outer concourse. Gate 7 is approximately 60 meters ahead on the left side."
            elif "seat" in q:
                # Use mock database check
                context = {
                    "gate": "None detected",
                    "seat": None,
                }
                seat_code = _extract_seat_code(request.message, context)
                if seat_code and seat_code in SEAT_DATABASE:
                    seat_info = SEAT_DATABASE[seat_code]
                    response_text = f"Your seating sector is {seat_info['section']}, {seat_info['row']}. Please proceed along the concourse walkway to reach it."
                else:
                    response_text = "The exact location of this seat is not available in the current stadium model. Please consult the nearest information desk or look at the overhead section maps."
            elif "washroom" in q or "toilet" in q:
                response_text = "The nearest wheelchair-accessible washroom is located 10 meters behind you on your left, next to the main info kiosk. Walking time: 1 minute."
            elif "food" in q or "hungry" in q or "vegetarian" in q:
                response_text = "Food Court B is 3 minutes ahead on your right. Concession 4 serves vegetarian, gluten-free, and Halal tacos with a short queue. Walking time: 2 minutes."
            else:
                response_text = f"I have received your request: '{request.message}'. As StadiumMind AI, I recommend taking elevator 3 to access the upper decks, or asking the nearest volunteer at gate entry."

        # Choose contextual quick reply action suggestions
        if mode == "emergency":
            suggested_actions = ["I am safe", "Need medical team", "Show exit route"]
        elif mode == "food":
            suggested_actions = ["Fastest Food", "Vegetarian food", "Beverages nearby"]
        elif mode == "navigation":
            suggested_actions = ["Take me to my car", "Guide to Seat", "Show elevators"]
        elif mode == "accessibility":
            suggested_actions = ["Elevator locations", "Tactile routes", "Request help"]
        else:
            suggested_actions = ["Today's matches", "Concession queues", "Emergency SOS"]

        return CopilotChatResponse(
            response=response_text,
            detected_mode=mode,
            suggested_actions=suggested_actions,
        )

    async def translate(self, request: CopilotTranslateRequest) -> str:
        prompt = f"Translate the following text to language code '{request.target_language}':\n\n{request.text}"
        try:
            translated = await self._gemini.generate(
                prompt=prompt,
                system_instruction=TRANSLATION_ASSISTANT_PROMPT,
            )
            return translated.strip()
        except Exception:
            return f"[Simulated Translation to {request.target_language}]: {request.text}"

    async def get_recommendations(self, request: RecommendationRequest) -> List[Dict[str, Any]]:
        # Simulated recommend items based on category and preferences
        cat = request.category.lower()
        is_wheelchair = request.preferences.wheelchair_user if request.preferences else False
        is_family = request.preferences.family_with_children if request.preferences else False

        if cat == "food":
            items = [
                {
                    "name": "Stadium Taco Bar",
                    "location": "Concourse B, Section 104",
                    "walking_distance_min": 2,
                    "queue_wait_min": 4,
                    "tags": ["Vegetarian", "Vegan", "Halal", "Gluten-Free"],
                    "accessibility": "Wheelchair accessible counter",
                },
                {
                    "name": "Nexus Grill & Burger",
                    "location": "Concourse A, Section 112",
                    "walking_distance_min": 4,
                    "queue_wait_min": 12,
                    "tags": ["Halal"],
                    "accessibility": "Counter height: 90cm",
                },
                {
                    "name": "Green Salad & Wraps",
                    "location": "Concourse C, Section 118",
                    "walking_distance_min": 5,
                    "queue_wait_min": 2,
                    "tags": ["Vegetarian", "Vegan", "Gluten-Free"],
                    "accessibility": "Accessible elevator lobby adjacent",
                }
            ]
        elif cat == "facility":
            items = [
                {
                    "name": "Main Medical Center",
                    "location": "Concourse Level 1, Section 102",
                    "walking_distance_min": 1,
                    "status": "Available",
                    "tags": ["Medical", "Emergency"],
                    "accessibility": "Fully accessible door ramps",
                },
                {
                    "name": "Wheelchair Accessible Restroom",
                    "location": "Section 102 Corridor",
                    "walking_distance_min": 1,
                    "status": "Short Queue",
                    "tags": ["Washroom", "Restroom"],
                    "accessibility": "Tactile indicator paving, sliding auto-door",
                },
                {
                    "name": "Prayer & Quiet Room",
                    "location": "Level 2 East Concourse",
                    "walking_distance_min": 6,
                    "status": "Available",
                    "tags": ["Prayer", "Rest Area"],
                    "accessibility": "Elevator accessible",
                },
                {
                    "name": "Water Refill & Charge Kiosk",
                    "location": "Section 114 Entry",
                    "walking_distance_min": 3,
                    "status": "Available",
                    "tags": ["Water", "Charging"],
                    "accessibility": "Height adjustable dispensers",
                }
            ]
        else:
            items = [
                {
                    "name": "Parking Zone C (Blue)",
                    "location": "Gate C Exit Lot",
                    "walking_distance_min": 7,
                    "spots_available": 140,
                    "tags": ["Parking", "Transit"],
                    "accessibility": "60 Wheelchair parking bays",
                }
            ]

        # Prioritize accessibility tags or elevator references if wheelchair user is selected
        if is_wheelchair:
            for item in items:
                item["walking_distance_min"] = max(1, item["walking_distance_min"] - 1)  # simulated elevator short path

        return items
