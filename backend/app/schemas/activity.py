from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ActivityLogResponse(BaseModel):
    id: int
    user_id: int
    company_id: int
    action: str
    details: Optional[str] = None
    timestamp: datetime
    
    class Config:
        from_attributes = True
