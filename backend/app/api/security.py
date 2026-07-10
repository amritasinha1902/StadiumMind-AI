from typing import List, Optional
from fastapi import Query
from app.models.security import (
    Incident, IncidentCreate, IncidentUpdate,
    CrowdStatus, SecurityAlert, IncidentStatus,
)
from app.services.security_service import SecurityService

_service = SecurityService()


async def get_incidents(
    status: Optional[IncidentStatus] = Query(default=None, description="Filter by incident status"),
    zone:   Optional[str]            = Query(default=None, description="Filter by zone"),
) -> List[Incident]:
    return await _service.get_incidents(status=status, zone=zone)


async def create_incident(incident: IncidentCreate) -> Incident:
    return await _service.create_incident(incident)


async def update_incident(incident_id: str, update: IncidentUpdate) -> Incident:
    return await _service.update_incident(incident_id, update)


async def get_crowd_status(
    zone: Optional[str] = Query(default=None, description="Specific zone to query"),
) -> List[CrowdStatus]:
    return await _service.get_crowd_status(zone=zone)


async def get_alerts() -> List[SecurityAlert]:
    return await _service.get_active_alerts()
