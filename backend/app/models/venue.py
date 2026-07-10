from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class SystemStatus(str, Enum):
    OPERATIONAL = "operational"
    WARNING     = "warning"
    CRITICAL    = "critical"
    OFFLINE     = "offline"
    MAINTENANCE = "maintenance"


class FacilityType(str, Enum):
    HVAC        = "hvac"
    POWER       = "power"
    WATER       = "water"
    NETWORK     = "network"
    LIGHTING    = "lighting"
    PITCH       = "pitch"
    CONCESSIONS = "concessions"
    RESTROOMS   = "restrooms"


class FacilityStatus(BaseModel):
    facility_id:        str
    name:               str
    type:               FacilityType
    status:             SystemStatus
    health_percentage:  float           = Field(ge=0, le=100)
    last_checked:       datetime        = Field(default_factory=datetime.utcnow)
    notes:              Optional[str]   = None
    metrics:            Dict[str, Any]  = {}


class VenueOperationalStatus(BaseModel):
    venue_id:           str
    venue_name:         str
    capacity:           int
    current_occupancy:  int
    occupancy_percentage: float
    systems:            List[FacilityStatus] = []
    active_alerts:      int              = 0
    last_updated:       datetime         = Field(default_factory=datetime.utcnow)


class IssueReport(BaseModel):
    facility_type: FacilityType
    description:   str
    location:      str
    reported_by:   str
    severity:      str
    images:        List[str] = []


class MaintenanceAlert(BaseModel):
    alert_id:    str
    facility_id: str
    message:     str
    severity:    str
    created_at:  datetime = Field(default_factory=datetime.utcnow)
    resolved:    bool     = False
