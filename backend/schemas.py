from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# Privacy by Design: We only collect an approximate neighborhood string, never exact GPS coords or addresses.
class IncidentCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    neighborhood: str = Field(..., description="Approximate location or neighborhood only")

class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    neighborhood: str
    category: str # "verified_alert", "noise", "digital_threat"
    action_steps: Optional[List[str]] = None
    upvotes: int = 0
    timestamp: Optional[datetime] = None

# Safe Circles Models
class SafeCircleUpdateCreate(BaseModel):
    status: str = Field(..., max_length=100, description="E.g., I'm safe, Need help")
    location_status: str = Field(..., max_length=50, description="Vague location. E.g., At Home, Evacuating")

class SafeCircleUpdateResponse(BaseModel):
    id: str
    status: str
    location_status: str
    timestamp: datetime
