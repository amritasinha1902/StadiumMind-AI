import uuid
from typing import List, Optional
from app.ai.gemini_client import GeminiClient
from app.models.security import (
    CrowdStatus, Incident, IncidentCreate, IncidentSeverity,
    IncidentStatus, IncidentUpdate, SecurityAlert,
)
from app.prompts.security_prompts import SECURITY_ASSESSMENT_PROMPT


class SecurityService:
    def __init__(self) -> None:
        self._gemini = GeminiClient()

    async def get_incidents(
        self,
        status: Optional[IncidentStatus] = None,
        zone:   Optional[str] = None,
    ) -> List[Incident]:
        # Firestore query will be implemented here
        return []

    async def create_incident(self, data: IncidentCreate) -> Incident:
        ai_assessment = await self._gemini.generate(
            prompt=(
                f"Assess this security incident at a FIFA World Cup stadium:\n"
                f"Type: {data.type}\n"
                f"Severity: {data.severity}\n"
                f"Zone: {data.zone}\n"
                f"Description: {data.description}\n"
                f"Provide recommended immediate actions."
            ),
            system_instruction=SECURITY_ASSESSMENT_PROMPT,
        )
        return Incident(
            incident_id=str(uuid.uuid4()),
            type=data.type,
            severity=data.severity,
            zone=data.zone,
            description=data.description,
            reported_by=data.reported_by,
            ai_assessment=ai_assessment,
        )

    async def update_incident(self, incident_id: str, update: IncidentUpdate) -> Incident:
        # In production this updates Firestore and returns the refreshed document
        return Incident(
            incident_id=incident_id,
            type="other",
            severity=IncidentSeverity.LOW,
            zone="Unknown",
            description="Updated",
            reported_by="System",
            status=update.status or IncidentStatus.REPORTED,
        )

    async def get_crowd_status(self, zone: Optional[str] = None) -> List[CrowdStatus]:
        zones = [zone] if zone else ["North Gate", "South Gate", "East Gate", "West Gate"]
        return [
            CrowdStatus(
                zone=z,
                capacity=5000,
                current_count=4300,
                density_percentage=86.0,
                status="normal",
            )
            for z in zones
        ]

    async def get_active_alerts(self) -> List[SecurityAlert]:
        return []
