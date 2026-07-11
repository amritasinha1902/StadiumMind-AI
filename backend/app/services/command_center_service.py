import random
from datetime import datetime
from typing import Any, Dict, List, Optional

from app.ai.gemini_client import GeminiClient
from app.models.command_center import (
    CommandAccessibilityModel,
    CommandCenterStatusResponse,
    CommandFoodStallModel,
    CommandIncidentModel,
    CommandMedicalModel,
    CommandRiskModel,
    CommandSecurityModel,
    CommandSustainabilityModel,
    CommandTransitModel,
    CommandVolunteerModel,
    LogEntryModel,
    ReportGenerationResponse,
)
from app.prompts.command_center_prompts import (
    COMMAND_RISK_PROMPT,
    COMMAND_REPORT_PROMPT,
    COMMAND_SUMMARY_PROMPT,
)
from mock_data.simulator import StadiumSimulator


class CommandCenterService:
    def __init__(self) -> None:
        self._gemini = GeminiClient()
        self.simulator = StadiumSimulator()

    def _init_state(self) -> None:
        pass

    async def get_status(self, role: str) -> CommandCenterStatusResponse:
        self.simulator.update()

        # Map Incidents
        incidents = [
            CommandIncidentModel(
                incident_id=inc["incident_id"],
                type=inc["type"],
                location=inc["location"],
                severity=inc["severity"],
                status=inc["status"],
                assigned_team=inc["assigned_team"],
                estimated_resolution_min=inc["estimated_resolution_min"],
                ai_recommendation=inc["ai_recommendation"]
            )
            for inc in self.simulator.incidents
        ]

        # Map Volunteers
        volunteers = [
            CommandVolunteerModel(
                volunteer_id=v["volunteer_id"],
                name=v["name"],
                status=v["status"],
                location=v["location"],
                current_assignment=v["assignment"]
            )
            for v in self.simulator.volunteers
        ]

        # Map Medical
        medical = CommandMedicalModel(
            team_id=self.simulator.medical["team_id"],
            name=self.simulator.medical["name"],
            status=self.simulator.medical["status"],
            location=self.simulator.medical["location"],
            current_cases=self.simulator.medical["current_cases"],
            ambulances_available=self.simulator.medical["ambulances_available"],
            treatment_room_status=self.simulator.medical["treatment_room_status"]
        )

        # Map Security
        security = CommandSecurityModel(
            patrol_id=self.simulator.security["patrol_id"],
            officers_count=self.simulator.security["officers_count"],
            location=self.simulator.security["location"],
            status=self.simulator.security["status"],
            restricted_zones_cleared=self.simulator.security["restricted_zones_cleared"]
        )

        # Map Food
        food = [
            CommandFoodStallModel(
                stall_id=f_id,
                name=f["name"],
                queue_length=f["queue_length"],
                inventory_percentage=f["inventory_percentage"],
                status=f["status"]
            )
            for f_id, f in self.simulator.food_stalls.items()
        ]

        # Map Transit
        transit = CommandTransitModel(
            metro_status=self.simulator.transit["metro_status"],
            bus_queue=self.simulator.transit["bus_queue"],
            taxi_delay_min=self.simulator.transit["taxi_delay_min"],
            walking_routes_clear=self.simulator.transit["walking_routes_clear"]
        )

        # Map Accessibility
        accessibility = CommandAccessibilityModel(
            wheelchairs_active=self.simulator.accessibility["wheelchair_escorts_active"],
            audio_requests=self.simulator.accessibility["hearing_loops_active"],
            elevators_operational=6
        )

        # Map Sustainability
        sustainability = CommandSustainabilityModel(
            water_usage_liters=self.simulator.sustainability["water_usage_liters"],
            energy_usage_kwh=self.simulator.sustainability["energy_usage_kwh"],
            waste_recycled_kg=self.simulator.sustainability["waste_recycled_kg"]
        )

        # Map Risks
        risks = [
            CommandRiskModel(
                name="crowd",
                level="medium",
                prediction=f"Gate 3 North Entrance may face heavy congestion due to {self.simulator.current_occupancy} visitor inflow.",
                reason="Ticket scans at Gate 3 show significant density spikes.",
                action="Redirect incoming visitors to Gate 4 East Entrance immediately."
            ),
            CommandRiskModel(
                name="weather",
                level="low",
                prediction=f"Sunny skies. Current temperature is {self.simulator.weather['temperature_c']}°C.",
                reason="Radar data indicates clear weather pattern.",
                action="Ensure water stations are restocked for heat mitigation."
            )
        ]

        # Alerts Feed (Map low inventory stalls or congested gates)
        alerts = []
        for g_id, g in self.simulator.entrances.items():
            if g["status"] == "congested":
                alerts.append(f"Crowd risk increasing at {g['name']}. Suggest opening auxiliary lanes.")
        for f_id, f in self.simulator.food_stalls.items():
            if f["status"] == "low":
                alerts.append(f"Low inventory alert: {f['name']} inventory is at {f['inventory_percentage']}%.")
        
        if not alerts:
            alerts = ["All systems within normal thresholds."]

        # Map Logs
        logs = [
            LogEntryModel(message=log["message"], category=log["level"].lower())
            for log in self.simulator.logs
        ]

        # Build custom risk updates via Gemini
        try:
            risk_prompt = f"Stadium state details:\nFood queues: {food}\nTransit: {transit}"
            risk_res = await self._gemini.generate(
                prompt=risk_prompt,
                system_instruction=COMMAND_RISK_PROMPT,
            )
            risks[0].prediction = f"AI Update: {risk_res[:150]}..."
        except Exception:
            pass

        # Generate Executive Summary based on User Role via Gemini
        try:
            summary_prompt = (
                f"Role: {role}\n"
                f"Incidents count: {len(incidents)}\n"
                f"Active risks: {risks}\n"
                f"Transit status: {transit}"
            )
            summary_text = await self._gemini.generate(
                prompt=summary_prompt,
                system_instruction=COMMAND_SUMMARY_PROMPT,
            )
        except Exception:
            if role == "security":
                summary_text = "Security operations are normal. Entry flow checks at all gates report zero security alerts. Threat level is low."
            elif role == "medical":
                summary_text = "Medical services are operating steadily. Ambulance dispatches are prompt. AED stations are active."
            elif role == "volunteers":
                summary_text = "Volunteer shifts are 92% covered. High availability at Gate 2 lobby. Rest periods are within compliance limits."
            elif role == "transport":
                summary_text = "Metro services running smoothly. Bus loop lines are busy but queue sizes are stable."
            elif role == "sustainability":
                summary_text = "Waste recycling compliance rate is 88%. Water conservation targets met. Energy usage matches stadium evening parameters."
            else:
                summary_text = f"All operations stable. Total occupancy: {self.simulator.current_occupancy}. Overall risk index is LOW."

        return CommandCenterStatusResponse(
            role=role,
            incidents=incidents,
            volunteers=volunteers,
            medical=medical,
            security=security,
            food=food,
            transit=transit,
            accessibility=accessibility,
            sustainability=sustainability,
            risks=risks,
            alerts_feed=alerts,
            exec_summary=summary_text,
            command_logs=logs[-15:]
        )

    async def resolve_incident(self, incident_id: str) -> Dict[str, Any]:
        target = None
        for inc in self.simulator.incidents:
            if inc["incident_id"] == incident_id:
                target = inc
                break

        if not target:
            return {"status": "error", "message": f"Incident {incident_id} not found."}

        target["status"] = "resolved"
        for vol in self.simulator.volunteers:
            if vol["assignment"] == incident_id:
                vol["status"] = "available"
                vol["assignment"] = None

        log_msg = f"Incident {incident_id} resolved by dispatcher."
        self.simulator.logs.append({"timestamp": self.simulator.sim_time.isoformat(), "level": "INFO", "message": log_msg})

        return {
            "status": "success",
            "message": f"Incident {incident_id} resolved successfully.",
            "resolved_incident": CommandIncidentModel(
                incident_id=target["incident_id"],
                type=target["type"],
                location=target["location"],
                severity=target["severity"],
                status=target["status"],
                assigned_team=target["assigned_team"],
                estimated_resolution_min=target["estimated_resolution_min"],
                ai_recommendation=target["ai_recommendation"]
            ),
        }

    async def generate_report(self, report_type: str) -> ReportGenerationResponse:
        sustainability = CommandSustainabilityModel(
            water_usage_liters=self.simulator.sustainability["water_usage_liters"],
            energy_usage_kwh=self.simulator.sustainability["energy_usage_kwh"],
            waste_recycled_kg=self.simulator.sustainability["waste_recycled_kg"]
        )
        try:
            prompt = (
                f"Generate report type: {report_type}\n"
                f"State timeline info:\n"
                f"Incidents: {self.simulator.incidents}\n"
                f"Sustainability stats: {sustainability}"
            )
            report_md = await self._gemini.generate(
                prompt=prompt,
                system_instruction=COMMAND_REPORT_PROMPT,
            )
        except Exception:
            report_md = f"""# FIFA World Cup 2026 Stadium Operations Report
## Report Type: {report_type.replace('_', ' ').capitalize()}
Generated at: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}

### 1. Executive Operations Summary
The stadium facility is reporting highly stable parameters across all concourse sectors. Current spectator count is {self.simulator.current_occupancy}.

### 2. Incident Status Overview
All medical and lost child cases have been resolved within expected resolution timelines.

### 3. Sustainability Audit
- Water Usage: **{sustainability.water_usage_liters} Liters**
- Energy Consumed: **{sustainability.energy_usage_kwh} kWh**
- Waste Recycled: **{sustainability.waste_recycled_kg} kg**

---
*Report compiled by StadiumMind AI Command Copilot.*
"""

        return ReportGenerationResponse(
            report_md=report_md,
        )
