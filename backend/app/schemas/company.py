from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CompanyBase(BaseModel):
    name: str

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

class CompanyResponse(CompanyBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True
