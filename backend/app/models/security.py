from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class IncidentSeverity(str, Enum):
    LOW      = "low"
    MEDIUM   = "medium"
    HIGH     = "high"
    CRITICAL = "critical"


class IncidentStatus(str, Enum):
    REPORTED   = "reported"
    RESPONDING = "responding"
    RESOLVED   = "resolved"
    ESCALATED  = "escalated"


class IncidentType(str, Enum):
    CROWD_SURGE     = "crowd_surge"
    MEDICAL         = "medical"
    DISTURBANCE     = "disturbance"
    LOST_ITEM       = "lost_item"
    FIRE            = "fire"
    SECURITY_BREACH = "security_breach"
    OTHER           = "other"


class IncidentCreate(BaseModel):
    type:        IncidentType
    severity:    IncidentSeverity
    zone:        str
    description: str
    reported_by: str


class IncidentUpdate(BaseModel):
    status:       Optional[IncidentStatus]   = None
    assigned_team: Optional[str]             = None
    resolution_notes: Optional[str]          = None


class Incident(BaseModel):
    incident_id:   Optional[str]             = None
    type:          IncidentType
    severity:      IncidentSeverity
    zone:          str
    description:   str
    reported_by:   str
    reported_at:   datetime                   = Field(default_factory=datetime.utcnow)
    status:        IncidentStatus             = IncidentStatus.REPORTED
    assigned_team: Optional[str]             = None
    resolved_at:   Optional[datetime]         = None
    ai_assessment: Optional[str]             = None


class CrowdStatus(BaseModel):
    zone:                 str
    capacity:             int
    current_count:        int
    density_percentage:   float
    status:               str
    ai_recommendation:    Optional[str] = None
    timestamp:            datetime       = Field(default_factory=datetime.utcnow)


class SecurityAlert(BaseModel):
    alert_id:       str
    message:        str
    severity:       IncidentSeverity
    affected_zones: List[str]
    issued_at:      datetime            = Field(default_factory=datetime.utcnow)
    expires_at:     Optional[datetime]  = None
    active:         bool                = True
