from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class TaskStatus(str, Enum):
    PENDING     = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED   = "completed"
    CANCELLED   = "cancelled"


class TaskPriority(str, Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"
    URGENT = "urgent"


class VolunteerRole(str, Enum):
    GATE_ASSISTANT   = "gate_assistant"
    ACCESSIBILITY    = "accessibility"
    MEDIA_LIAISON    = "media_liaison"
    FIRST_AID        = "first_aid"
    TRANSPORT        = "transport"
    VIP_SERVICES     = "vip_services"
    FAN_SERVICES     = "fan_services"
    SECURITY_SUPPORT = "security_support"


class Task(BaseModel):
    task_id:             Optional[str] = None
    title:               str
    description:         str
    priority:            TaskPriority
    status:              TaskStatus    = TaskStatus.PENDING
    assigned_to:         Optional[str] = None
    zone:                str
    volunteers_required: int           = 1
    created_at:          datetime      = Field(default_factory=datetime.utcnow)
    due_at:              Optional[datetime] = None
    completed_at:        Optional[datetime] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus
    notes:  Optional[str] = None


class VolunteerSchedule(BaseModel):
    volunteer_id: str
    date:         str
    shift_start:  str
    shift_end:    str
    role:         VolunteerRole
    zone:         str
    supervisor:   Optional[str] = None


class GuidanceRequest(BaseModel):
    question:     str           = Field(..., min_length=1, max_length=500)
    volunteer_id: Optional[str] = None
    role:         Optional[VolunteerRole] = None
    context:      Optional[str] = None


class GuidanceResponse(BaseModel):
    answer:              str
    related_procedures:  List[str] = []
    emergency_contacts:  List[str] = []
    generated_at:        datetime   = Field(default_factory=datetime.utcnow)
