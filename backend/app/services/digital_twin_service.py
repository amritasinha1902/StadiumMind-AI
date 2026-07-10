import random
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.ai.gemini_client import GeminiClient
from app.models.digital_twin import (
    CrowdGateModel,
    FoodCourtTwinModel,
    IncidentActionRequest,
    IncidentModel,
    MedicalTeamTwinModel,
    NavigationRequest,
    NavigationResponse,
    TransitStatusModel,
    TwinStatusResponse,
    VolunteerTwinModel,
    WeatherModel,
)
from app.prompts.digital_twin_prompts import (
    CROWD_PREDICTION_PROMPT,
    EMERGENCY_ROUTING_PROMPT,
    NAVIGATION_RECOMMENDATION_PROMPT,
    OPERATIONS_SUMMARY_PROMPT,
    WEATHER_RECOMMENDATION_PROMPT,
)


class DigitalTwinService:
    # Class-level state to persist across requests (simulating real-time updates)
    _state: Dict[str, Any] = {}

    def __init__(self) -> None:
        self._gemini = GeminiClient()
        self._init_state()

    def _init_state(self) -> None:
        if self._state:
            return

        self._state["weather"] = WeatherModel(
            temperature_c=24.0,
            humidity_pct=65.0,
            status="sunny",
        )

        self._state["incidents"] = [
            IncidentModel(
                incident_id="INC-302",
                type="overcrowding",
                location="North Concourse A",
                severity="medium",
                status="active",
            )
        ]

        self._state["crowd_gates"] = [
            CrowdGateModel(gate_id="G1", name="Gate 1 (West Entrance)", current_count=8200, density_percentage=42.0, status="low"),
            CrowdGateModel(gate_id="G2", name="Gate 2 (South Entrance)", current_count=14500, density_percentage=73.0, status="busy"),
            CrowdGateModel(gate_id="G3", name="Gate 3 (North Entrance)", current_count=19200, density_percentage=94.0, status="congested"),
            CrowdGateModel(gate_id="G4", name="Gate 4 (East Entrance)", current_count=9800, density_percentage=55.0, status="moderate"),
        ]

        self._state["volunteers"] = [
            VolunteerTwinModel(volunteer_id="V-101", name="David Kim", status="available", location="Gate 2 Information Desk"),
            VolunteerTwinModel(volunteer_id="V-102", name="Elena Rostova", status="available", location="Concourse Sector C"),
            VolunteerTwinModel(volunteer_id="V-103", name="Carlos Gomez", status="responding", location="North Entrance Lobby", assigned_to="INC-302"),
        ]

        self._state["medical_teams"] = [
            MedicalTeamTwinModel(team_id="MED-1", name="Medical Team 1", status="available", location="First Aid Station 1"),
            MedicalTeamTwinModel(team_id="MED-2", name="Medical Team 2", status="treating_patient", location="Section 104 Walkway"),
        ]

        self._state["food_courts"] = [
            FoodCourtTwinModel(stall_id="F1", name="Stadium Grill A", queue_length=24, wait_time_minutes=15, inventory_status="normal"),
            FoodCourtTwinModel(stall_id="F2", name="Taco Corner B", queue_length=8, wait_time_minutes=5, inventory_status="low"),
            FoodCourtTwinModel(stall_id="F3", name="Beverage Stand C", queue_length=42, wait_time_minutes=25, inventory_status="normal"),
        ]

        self._state["transit"] = [
            TransitStatusModel(mode="metro", status="normal", info="Trains operating every 3 minutes. Platform 1 slightly crowded."),
            TransitStatusModel(mode="shuttle", status="busy", info="Shuttle buses delayed by 8 minutes due to outer loop traffic."),
            TransitStatusModel(mode="taxi", status="delayed", info="High demand taxi queue. Average wait time: 18 minutes."),
            TransitStatusModel(mode="parking", status="normal", info="Lot A and Lot B are 95% full. Lot C has 200 available slots."),
            TransitStatusModel(mode="walking", status="normal", info="Sensors record clear, safe walking paths across all exits."),
        ]

    async def get_status(self) -> TwinStatusResponse:
        # 1. Simulate minor crowd variation
        for gate in self._state["crowd_gates"]:
            delta = random.choice([-200, -100, 100, 200, 300])
            gate.current_count = max(100, gate.current_count + delta)
            gate.density_percentage = min(100.0, max(0.0, gate.density_percentage + (delta / 250.0)))
            if gate.density_percentage >= 90:
                gate.status = "congested"
            elif gate.density_percentage >= 70:
                gate.status = "busy"
            elif gate.density_percentage >= 40:
                gate.status = "moderate"
            else:
                gate.status = "low"

        # 2. Extract alerts based on states
        alerts = []
        for gate in self._state["crowd_gates"]:
            if gate.status == "congested":
                alerts.append(f"High crowd density detected near {gate.name}. Suggest redirecting entrants.")

        for stall in self._state["food_courts"]:
            if stall.inventory_status == "low":
                alerts.append(f"Low inventory warning at {stall.name}. Restock within 20 minutes.")

        # 3. Request Gemini to analyze operations
        try:
            summary_prompt = (
                f"Active Incidents: {self._state['incidents']}\n"
                f"Crowd Gates: {self._state['crowd_gates']}\n"
                f"Weather: {self._state['weather']}"
            )
            ops_summary = await self._gemini.generate(
                prompt=summary_prompt,
                system_instruction=OPERATIONS_SUMMARY_PROMPT,
            )
        except Exception:
            ops_summary = "North Gate congestion is increasing. Direct incoming visitors to East Gate. Medical Team 1 is available at First Aid Station 1. Concourse flows are stable."

        try:
            predictions_prompt = f"Crowd Gates state details:\n{self._state['crowd_gates']}"
            predictions_text = await self._gemini.generate(
                prompt=predictions_prompt,
                system_instruction=CROWD_PREDICTION_PROMPT,
            )
            predictions = [line.strip("- ") for line in predictions_text.strip().split("\n") if line.strip()]
        except Exception:
            predictions = [
                "Gate 3 North Entrance will likely experience high congestion within 10 minutes.",
                "Food stall B wait times are increasing due to low inventory queues.",
                "Parking Exit B may see temporary delays after match kickoff.",
            ]

        return TwinStatusResponse(
            weather=self._state["weather"],
            incidents=self._state["incidents"],
            crowd_gates=self._state["crowd_gates"],
            volunteers=self._state["volunteers"],
            medical_teams=self._state["medical_teams"],
            food_courts=self._state["food_courts"],
            transit=self._state["transit"],
            operations_summary=ops_summary,
            crowd_predictions=predictions[:4],
            smart_alerts=alerts,
        )

    async def get_navigation(self, request: NavigationRequest) -> NavigationResponse:
        path = ["Gate C", "Tactile Concourse Way", "Section 102 Lobby"]
        directions = [
            f"Start at your current location: {request.from_location}.",
            f"Move toward exit corridor heading for {request.to_location}."
        ]

        if request.preference == "wheelchair":
            path.extend(["Elevator Lobby 3", "Level 2 Accessible Seats"])
            directions.extend([
                "Take Elevator 3 on the left to Level 2.",
                "Follow the blue wheelchair indicator lines directly to Section 102."
            ])
            explanation_addon = "Preference: Wheelchair route. Directing via Elevator 3 (100% stair-free path)."
        elif request.preference == "evacuation":
            path = ["Section 102 Exit", "Main Staircase C", "Outer Lot Gate 3"]
            directions = [
                "IMMEDIATE EVACUATION: Walk quickly and calmly to the closest marked exit.",
                "Follow Main Staircase C down to the ground level.",
                "Exit the stadium compound through Gate 3."
            ]
            explanation_addon = "CRITICAL: Emergency Evacuation profile. Bypassing elevators and directing to ground Gate 3."
        else:
            path.extend(["Stairs Sector C", "Row G Seat 14"])
            directions.extend([
                "Take Stairs C up to Row G.",
                "Section 102 Seat 14 is on the right side."
            ])
            explanation_addon = "Preference: Standard path. Directions configured for MetLife Section 102."

        try:
            ai_prompt = (
                f"From: {request.from_location} to {request.to_location}.\n"
                f"Selected Profile: {request.preference}.\n"
                f"Generated Directions: {directions}"
            )
            ai_explanation = await self._gemini.generate(
                prompt=ai_prompt,
                system_instruction=NAVIGATION_RECOMMENDATION_PROMPT,
            )
        except Exception:
            ai_explanation = f"Recommended route from {request.from_location} to {request.to_location}. {explanation_addon}"

        return NavigationResponse(
            path=path,
            directions=directions,
            ai_explanation=ai_explanation,
        )

    async def inject_random_incident(self) -> IncidentModel:
        incident_types = [
            ("medical", "Medical Emergency (Chest Pain)", "Section 108 seating row D", "high"),
            ("lost_child", "Lost Child (5yo Boy)", "Kids Zone Concourse A", "medium"),
            ("overcrowding", "Overcrowding Alert", "Gate 3 Entrance Corridor", "high"),
            ("rain", "Heavy Rain Warning", "Open Roof Deck Section E", "medium"),
            ("security", "Security Incident (Disturbance)", "Concession Stand 2 queue", "high"),
            ("power_failure", "Power Failure (Light bank 4)", "West Stand Level 2", "critical"),
            ("stall_closed", "Food Court Stall Closed", "Grill Stall A (F1)", "low"),
        ]

        inc_type, desc, loc, severity = random.choice(incident_types)
        inc_id = f"INC-{random.randint(400, 999)}"

        new_incident = IncidentModel(
            incident_id=inc_id,
            type=inc_type,
            location=loc,
            severity=severity,
            status="active",
        )

        self._state["incidents"].append(new_incident)
        return new_incident

    async def assign_responder(self, request: IncidentActionRequest) -> Dict[str, Any]:
        target_incident = None
        for inc in self._state["incidents"]:
            if inc.incident_id == request.incident_id:
                target_incident = inc
                break

        if not target_incident:
            return {"status": "error", "message": f"Incident {request.incident_id} not found."}

        target_incident.status = "responding"

        # Update responder state
        if request.responder_type == "volunteer":
            for vol in self._state["volunteers"]:
                if vol.volunteer_id == request.assigned_responder_id:
                    vol.status = "responding"
                    vol.assigned_to = request.incident_id
                    return {
                        "status": "success",
                        "message": f"Volunteer {vol.name} assigned to incident {request.incident_id}.",
                        "responder": vol,
                    }
        else:
            for med in self._state["medical_teams"]:
                if med.team_id == request.assigned_responder_id:
                    med.status = "treating_patient"
                    med.assigned_to = request.incident_id
                    return {
                        "status": "success",
                        "message": f"Medical Team {med.name} dispatched to {request.incident_id}.",
                        "responder": med,
                    }

        return {"status": "error", "message": f"Responder {request.assigned_responder_id} not found."}

    async def update_weather(self, status: str) -> WeatherModel:
        if status not in ["sunny", "cloudy", "rain", "storm"]:
            status = "sunny"

        temp = 28.0 if status == "sunny" else 22.0 if status == "cloudy" else 18.0
        hum = 50.0 if status == "sunny" else 70.0 if status == "cloudy" else 95.0

        w = WeatherModel(
            temperature_c=temp,
            humidity_pct=hum,
            status=status,
        )

        self._state["weather"] = w
        return w
