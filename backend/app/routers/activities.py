from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import SessionLocal
from app.core.security import require_roles
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.activity import ActivityLogResponse

router = APIRouter(prefix="/activities", tags=["Activity Logs"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[ActivityLogResponse])
def get_company_activity_logs(
    limit: int = 50,
    current_user: User = Depends(require_roles(["COMPANY_ADMIN"])),
    db: Session = Depends(get_db)
):
    logs = db.query(ActivityLog).filter(
        ActivityLog.company_id == current_user.company_id
    ).order_by(ActivityLog.timestamp.desc()).limit(limit).all()
    return logs
