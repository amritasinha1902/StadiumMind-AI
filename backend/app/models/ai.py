from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class MessageRole(str, Enum):
    USER      = "user"
    ASSISTANT = "assistant"
    SYSTEM    = "system"


class ChatMessage(BaseModel):
    role:      MessageRole
    content:   str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    message:  str           = Field(..., min_length=1, max_length=2000)
    context:  Optional[str] = None
    history:  List[ChatMessage] = []
    language: str           = "en"


class ChatResponse(BaseModel):
    response:     str
    model:        str
    tokens_used:  Optional[int] = None
    generated_at: datetime      = Field(default_factory=datetime.utcnow)


class SummaryRequest(BaseModel):
    data:         Dict[str, Any]
    summary_type: str
    language:     str = "en"
    max_length:   int = 500


class SummaryResponse(BaseModel):
    summary:      str
    key_points:   List[str] = []
    generated_at: datetime   = Field(default_factory=datetime.utcnow)


class TranslationRequest(BaseModel):
    text:            str = Field(..., min_length=1, max_length=5000)
    target_language: str = Field(..., min_length=2, max_length=10)
    source_language: str = "auto"


class TranslationResponse(BaseModel):
    translated_text: str
    source_language: str
    target_language: str
    generated_at:    datetime = Field(default_factory=datetime.utcnow)
