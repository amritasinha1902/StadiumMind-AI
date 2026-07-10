from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class AccessibilityMessageRole(str, Enum):
    USER      = "user"
    ASSISTANT = "assistant"


class AccessibilityChatMessage(BaseModel):
    role:      AccessibilityMessageRole
    content:   str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class VoiceRequest(BaseModel):
    message:  str = Field(..., min_length=1, max_length=1000)
    history:  List[AccessibilityChatMessage] = []
    location: Optional[str] = None


class VoiceResponse(BaseModel):
    answer:       str
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class OcrResponse(BaseModel):
    extracted_text: str
    confidence:     float = Field(default=0.95, ge=0.0, le=1.0)
    language:       str = "en"
    detected_signs: List[str] = []
    generated_at:   datetime = Field(default_factory=datetime.utcnow)


class SceneResponse(BaseModel):
    description:   str
    barriers:      List[str] = []
    exits:         List[str] = []
    people_count:  int = 0
    confidence:    float = Field(default=0.90, ge=0.0, le=1.0)
    generated_at:  datetime = Field(default_factory=datetime.utcnow)


class DetectedObject(BaseModel):
    label:        str
    confidence:   float
    bounding_box: Optional[List[float]] = None  # [ymin, xmin, ymax, xmax] normalize coordinates


class ObjectDetectionResponse(BaseModel):
    objects:      List[DetectedObject] = []
    summary:      str
    generated_at: datetime = Field(default_factory=datetime.utcnow)


class SosRequest(BaseModel):
    current_location: str = Field(..., min_length=1, max_length=200)
    emergency_type:   str = Field(default="general")
    notes:            Optional[str] = None


class SosResponse(BaseModel):
    status:               str = "dispatched"
    emergency_id:         str
    nearest_medical:      str
    nearest_volunteer:    str
    emergency_contact:    str
    calming_instructions: str
    dispatch_time:        datetime = Field(default_factory=datetime.utcnow)
