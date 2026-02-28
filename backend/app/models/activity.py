from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from sqlalchemy.sql import func
from app.core.database import Base

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    action = Column(String, nullable=False) # e.g., "USER_CREATED", "COMPANY_UPDATED"
    details = Column(Text, nullable=True)   # JSON string or plain text details
    
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
