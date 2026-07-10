from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ConcessionStatus(str, Enum):
    OPEN   = "open"
    BUSY   = "busy"
    CLOSED = "closed"


class FanQuestion(BaseModel):
    question: str      = Field(..., min_length=1, max_length=500)
    language: str      = Field(default="en", max_length=5)
    context:  Optional[str] = None


class FanQuestionResponse(BaseModel):
    answer:       str
    language:     str
    sources:      List[str] = []
    generated_at: datetime  = Field(default_factory=datetime.utcnow)


class MatchInfo(BaseModel):
    match_id:     str
    home_team:    str
    away_team:    str
    score_home:   int = 0
    score_away:   int = 0
    minute:       Optional[int] = None
    venue:        str
    status:       str
    kickoff_time: datetime


class NavigationRequest(BaseModel):
    venue_id:               str
    destination:            str
    current_location:       Optional[str] = None
    accessibility_required: bool = False


class NavigationResponse(BaseModel):
    route:                    List[str]
    estimated_time_minutes:   int
    distance_meters:          int
    directions:               List[str]
    accessibility_info:       Optional[str] = None


class ConcessionInfo(BaseModel):
    stall_id:        str
    name:            str
    section:         str
    wait_time_minutes: int
    status:          ConcessionStatus
    menu_highlights: List[str] = []
