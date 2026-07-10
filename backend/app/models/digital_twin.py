from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class WeatherModel(BaseModel):
    temperature_c: float
    humidity_pct:  float
    status:        str  # "sunny" | "cloudy" | "rain" | "storm"
    last_updated:  datetime = Field(default_factory=datetime.utcnow)


class IncidentModel(BaseModel):
    incident_id: str
    type:        str  # "medical" | "lost_child" | "overcrowding" | "rain" | "security" | "power_failure" | "stall_closed"
    location:    str
    severity:    str  # "low" | "medium" | "high" | "critical"
    status:      str  # "active" | "responding" | "resolved"
    reported_at: datetime = Field(default_factory=datetime.utcnow)


class NavigationRequest(BaseModel):
    from_location: str
    to_location:   str
    preference:    str  # "fastest" | "least_crowded" | "wheelchair" | "family" | "evacuation"


class NavigationResponse(BaseModel):
    path:           List[str]
    directions:     List[str]
    ai_explanation: str
    generated_at:   datetime = Field(default_factory=datetime.utcnow)


class IncidentActionRequest(BaseModel):
    incident_id:           str
    assigned_responder_id: str
    responder_type:        str  # "volunteer" | "medical"


class CrowdGateModel(BaseModel):
    gate_id:            str
    name:               str
    current_count:      int
    density_percentage: float
    status:             str  # "low" | "moderate" | "busy" | "congested"


class VolunteerTwinModel(BaseModel):
    volunteer_id: str
    name:         str
    status:       str  # "available" | "busy" | "responding"
    location:     str
    assigned_to:  Optional[str] = None


class MedicalTeamTwinModel(BaseModel):
    team_id:     str
    name:        str
    status:      str  # "available" | "treating_patient" | "returning"
    location:    str
    assigned_to: Optional[str] = None


class FoodCourtTwinModel(BaseModel):
    stall_id:         str
    name:             str
    queue_length:     int
    wait_time_minutes: int
    inventory_status:  str  # "normal" | "low"


class TransitStatusModel(BaseModel):
    mode:   str  # "metro" | "shuttle" | "taxi" | "parking" | "walking"
    status: str  # "normal" | "busy" | "delayed" | "closed"
    info:   str


class TwinStatusResponse(BaseModel):
    weather:            WeatherModel
    incidents:          List[IncidentModel] = []
    crowd_gates:        List[CrowdGateModel] = []
    volunteers:         List[VolunteerTwinModel] = []
    medical_teams:      List[MedicalTeamTwinModel] = []
    food_courts:        List[FoodCourtTwinModel] = []
    transit:            List[TransitStatusModel] = []
    operations_summary: str
    crowd_predictions:  List[str] = []
    smart_alerts:       List[str] = []
    generated_at:       datetime = Field(default_factory=datetime.utcnow)
