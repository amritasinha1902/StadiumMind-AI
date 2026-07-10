from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class AgentMessageRole(str, Enum):
    USER      = "user"
    ASSISTANT = "assistant"
    SYSTEM    = "system"


class ChatMessageModel(BaseModel):
    role:      AgentMessageRole
    content:   str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MemoryModel(BaseModel):
    current_gate:          Optional[str] = None
    seat_number:           Optional[str] = None
    parking_location:      Optional[str] = None
    accessibility_pref:    Optional[str] = None
    preferred_language:    Optional[str] = None
    food_preference:       Optional[str] = None
    transportation_method: Optional[str] = None
    custom_metadata:       Dict[str, Any] = {}


class MultiAgentChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    history: List[ChatMessageModel] = []
    memory:  Optional[MemoryModel] = None


class AgentTelemetry(BaseModel):
    agent_name:        str
    execution_time_ms: int
    success:           bool


class MultiAgentChatResponse(BaseModel):
    response:          str
    intents:           List[str]
    chosen_agents:     List[str]
    telemetry:         List[AgentTelemetry] = []
    total_time_ms:     int
    confidence_score:  float
    memory:            Optional[MemoryModel] = None
    generated_at:      datetime = Field(default_factory=datetime.utcnow)


class RoutePlanningRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None


class IntentTestRequest(BaseModel):
    message: str


class IntentTestResponse(BaseModel):
    intents:      List[str]
    generated_at: datetime = Field(default_factory=datetime.utcnow)
