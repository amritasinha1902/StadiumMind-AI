from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class CommandIncidentModel(BaseModel):
    incident_id:              str
    type:                     str  # "lost_child" | "medical" | "security" | "power_failure" | "fire_alarm" | "congestion" | "weather"
    location:                 str
    severity:                 str  # "low" | "medium" | "high" | "critical"
    status:                   str  # "active" | "responding" | "resolved"
    assigned_team:            str
    estimated_resolution_min: int
    ai_recommendation:        str
    reported_at:              datetime = Field(default_factory=datetime.utcnow)


class CommandVolunteerModel(BaseModel):
    volunteer_id:       str
    name:               str
    status:             str  # "available" | "busy" | "responding" | "break"
    location:           str
    current_assignment: Optional[str] = None


class CommandMedicalModel(BaseModel):
    team_id:                str
    name:                   str
    status:                 str  # "available" | "treating_patient" | "returning"
    location:               str
    current_cases:          int
    ambulances_available:   int
    treatment_room_status:  str


class CommandSecurityModel(BaseModel):
    patrol_id:                str
    officers_count:           int
    location:                 str
    status:                   str  # "patrolling" | "stationary" | "dispatched"
    restricted_zones_cleared: bool


class CommandFoodStallModel(BaseModel):
    stall_id:             str
    name:                 str
    queue_length:         int
    inventory_percentage: float
    status:               str  # "normal" | "low"


class CommandTransitModel(BaseModel):
    metro_status:         str  # "normal" | "busy" | "delayed" | "closed"
    bus_queue:            int
    taxi_delay_min:       int
    walking_routes_clear: bool


class CommandAccessibilityModel(BaseModel):
    wheelchairs_active:    int
    audio_requests:        int
    elevators_operational: int


class CommandSustainabilityModel(BaseModel):
    water_usage_liters: float
    energy_usage_kwh:    float
    waste_recycled_kg:   float


class CommandRiskModel(BaseModel):
    name:       str  # "crowd" | "medical" | "weather" | "transport" | "security" | "accessibility"
    level:      str  # "low" | "medium" | "high" | "critical"
    prediction: str
    reason:     str
    action:     str


class LogEntryModel(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message:   str
    category:  str  # "incident" | "assignment" | "weather" | "alert" | "system"


class CommandCenterStatusResponse(BaseModel):
    role:               str
    incidents:          List[CommandIncidentModel]
    volunteers:         List[CommandVolunteerModel]
    medical:            CommandMedicalModel
    security:           CommandSecurityModel
    food:               List[CommandFoodStallModel]
    transit:            CommandTransitModel
    accessibility:      CommandAccessibilityModel
    sustainability:     CommandSustainabilityModel
    risks:              List[CommandRiskModel]
    alerts_feed:        List[str]
    exec_summary:       str
    command_logs:       List[LogEntryModel]
    generated_at:       datetime = Field(default_factory=datetime.utcnow)


class ReportGenerationRequest(BaseModel):
    type: str  # "daily_summary" | "safety" | "accessibility" | "volunteer" | "transportation" | "food_operations" | "sustainability"


class ReportGenerationResponse(BaseModel):
    report_md:    str
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class IncidentResolveRequest(BaseModel):
    incident_id: str
