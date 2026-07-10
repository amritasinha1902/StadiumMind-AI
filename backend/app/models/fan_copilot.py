from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class CopilotMessageRole(str, Enum):
    USER      = "user"
    ASSISTANT = "assistant"
    SYSTEM    = "system"


class CopilotChatMessage(BaseModel):
    role:      CopilotMessageRole
    content:   str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class UserPreferences(BaseModel):
    wheelchair_user:      bool = False
    family_with_children: bool = False
    elderly:              bool = False
    visually_impaired:    bool = False
    solo_traveler:        bool = False
    international_tourist:bool = False


class CopilotChatRequest(BaseModel):
    message:          str = Field(..., min_length=1, max_length=2000)
    history:          List[CopilotChatMessage] = []
    preferences:      Optional[UserPreferences] = None
    parking_location: Optional[str] = None
    language:         str = "en"


class CopilotChatResponse(BaseModel):
    response:          str
    detected_mode:     str  # "general" | "emergency" | "navigation" | "food" | "accessibility"
    suggested_actions: List[str] = []
    generated_at:      datetime = Field(default_factory=datetime.utcnow)


class CopilotTranslateRequest(BaseModel):
    text:            str = Field(..., min_length=1, max_length=5000)
    target_language: str = Field(..., min_length=2, max_length=10)


class ParkingSaveRequest(BaseModel):
    location: str = Field(..., min_length=1, max_length=200)


class PreferencesUpdateRequest(BaseModel):
    preferences: UserPreferences


class RecommendationRequest(BaseModel):
    category:         str  # "food" | "facility" | "parking"
    current_location: Optional[str] = None
    preferences:      Optional[UserPreferences] = None
