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
    def __init__(self) -> None:
        self._gemini = GeminiClient()
        from mock_data.simulator import StadiumSimulator
        self.simulator = StadiumSimulator()

    async def get_status(self) -> TwinStatusResponse:
        # Trigger simulation update
        self.simulator.update()

        # Map Weather
        weather = WeatherModel(
            temperature_c=self.simulator.weather["temperature_c"],
            humidity_pct=self.simulator.weather["humidity_pct"],
            status=self.simulator.weather["status"]
        )

        # Map Incidents
        incidents = [
            IncidentModel(
                incident_id=inc["incident_id"],
                type=inc["type"],
                location=inc["location"],
                severity=inc["severity"],
                status=inc["status"]
            )
            for inc in self.simulator.incidents
        ]

        # Map Gates
        crowd_gates = [
            CrowdGateModel(
                gate_id=g_id,
                name=g["name"],
                current_count=g["current_count"],
                density_percentage=g["density_percentage"],
                status=g["status"]
            )
            for g_id, g in self.simulator.entrances.items()
        ]

        # Map Volunteers
        volunteers = [
            VolunteerTwinModel(
                volunteer_id=v["volunteer_id"],
                name=v["name"],
                status=v["status"],
                location=v["location"],
                assigned_to=v["assignment"]
            )
            for v in self.simulator.volunteers
        ]

        # Map Medical
        medical_teams = [
            MedicalTeamTwinModel(
                team_id=self.simulator.medical["team_id"],
                name=self.simulator.medical["name"],
                status=self.simulator.medical["status"],
                location=self.simulator.medical["location"]
            )
        ]

        # Map Concessions
        food_courts = [
            FoodCourtTwinModel(
                stall_id=f_id,
                name=f["name"],
                queue_length=f["queue_length"],
                wait_time_minutes=f["wait_time_minutes"],
                inventory_status=f["status"]
            )
            for f_id, f in self.simulator.food_stalls.items()
        ]

        # Map Transit
        transit = [
            TransitStatusModel(mode="metro", status=self.simulator.transit["metro_status"], info=self.simulator.transit["metro_info"]),
            TransitStatusModel(mode="shuttle", status="busy", info=self.simulator.transit["shuttle_info"]),
            TransitStatusModel(mode="taxi", status="delayed", info=self.simulator.transit["taxi_info"]),
            TransitStatusModel(mode="parking", status="normal", info=self.simulator.transit["parking_info"]),
            TransitStatusModel(mode="walking", status="normal", info=self.simulator.transit["walking_info"])
        ]

        # Extract alerts based on states
        alerts = []
        for gate in crowd_gates:
            if gate.status == "congested":
                alerts.append(f"High crowd density detected near {gate.name}. Suggest redirecting entrants.")

        for stall in food_courts:
            if stall.inventory_status == "low":
                alerts.append(f"Low inventory warning at {stall.name}. Restock within 20 minutes.")

        # Request Gemini to analyze operations
        try:
            summary_prompt = (
                f"Active Incidents: {incidents}\n"
                f"Crowd Gates: {crowd_gates}\n"
                f"Weather: {weather}"
            )
            ops_summary = await self._gemini.generate(
                prompt=summary_prompt,
                system_instruction=OPERATIONS_SUMMARY_PROMPT,
            )
        except Exception:
            ops_summary = "North Gate congestion is increasing. Direct incoming visitors to East Gate. Medical Team 1 is available. Concourse flows are stable."

        try:
            predictions_prompt = f"Crowd Gates state details:\n{crowd_gates}"
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
            weather=weather,
            incidents=incidents,
            crowd_gates=crowd_gates,
            volunteers=volunteers,
            medical_teams=medical_teams,
            food_courts=food_courts,
            transit=transit,
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

        new_incident = {
            "incident_id": inc_id,
            "type": inc_type,
            "location": loc,
            "severity": severity,
            "status": "active",
            "assigned_team": "Pending Dispatch",
            "estimated_resolution_min": 15,
            "ai_recommendation": f"AI Action plan: {desc}."
        }

        self.simulator.incidents.append(new_incident)
        self.simulator.logs.append({
            "timestamp": self.simulator.sim_time.isoformat(),
            "level": "WARN" if severity != "high" else "ERROR",
            "message": f"Injected incident: {inc_type} at {loc}."
        })

        return IncidentModel(
            incident_id=inc_id,
            type=inc_type,
            location=loc,
            severity=severity,
            status="active"
        )

    async def assign_responder(self, request: IncidentActionRequest) -> Dict[str, Any]:
        target_incident = None
        for inc in self.simulator.incidents:
            if inc["incident_id"] == request.incident_id:
                target_incident = inc
                break

        if not target_incident:
            return {"status": "error", "message": f"Incident {request.incident_id} not found."}

        target_incident["status"] = "responding"

        # Update responder state
        if request.responder_type == "volunteer":
            for vol in self.simulator.volunteers:
                if vol["volunteer_id"] == request.assigned_responder_id:
                    vol["status"] = "responding"
                    vol["assignment"] = request.incident_id
                    target_incident["assigned_team"] = f"Volunteer {vol['name']}"
                    
                    v_model = VolunteerTwinModel(
                        volunteer_id=vol["volunteer_id"],
                        name=vol["name"],
                        status=vol["status"],
                        location=vol["location"],
                        assigned_to=vol["assignment"]
                    )
                    return {
                        "status": "success",
                        "message": f"Volunteer {vol['name']} assigned to incident {request.incident_id}.",
                        "responder": v_model,
                    }
        else:
            if self.simulator.medical["team_id"] == request.assigned_responder_id:
                self.simulator.medical["status"] = "treating_patient"
                self.simulator.medical["assigned_to"] = request.incident_id
                target_incident["assigned_team"] = self.simulator.medical["name"]
                
                m_model = MedicalTeamTwinModel(
                    team_id=self.simulator.medical["team_id"],
                    name=self.simulator.medical["name"],
                    status=self.simulator.medical["status"],
                    location=self.simulator.medical["location"],
                    assigned_to=self.simulator.medical["assigned_to"]
                )
                return {
                    "status": "success",
                    "message": f"Medical Team {self.simulator.medical['name']} dispatched.",
                    "responder": m_model,
                }

        return {"status": "error", "message": f"Responder {request.assigned_responder_id} not found."}

    async def update_weather(self, status: str) -> WeatherModel:
        if status not in ["sunny", "cloudy", "rain", "storm"]:
            status = "sunny"

        temp = 28.0 if status == "sunny" else 22.0 if status == "cloudy" else 18.0
        hum = 50.0 if status == "sunny" else 70.0 if status == "cloudy" else 95.0

        self.simulator.weather["status"] = status
        self.simulator.weather["temperature_c"] = temp
        self.simulator.weather["humidity_pct"] = hum

        return WeatherModel(
            temperature_c=temp,
            humidity_pct=hum,
            status=status,
        )
