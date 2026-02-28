from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import SessionLocal
from app.core.security import require_roles
from app.models.user import User
from app.models.company import Company

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/metrics")
def get_dashboard_metrics(
    current_user: User = Depends(require_roles(["COMPANY_ADMIN", "EMPLOYEE"])),
    db: Session = Depends(get_db)
):
    # Total users in company
    total_users = db.query(func.count(User.id)).filter(User.company_id == current_user.company_id).scalar()
    
    # Company status
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    
    # In a real SaaS, we would also query the Activity model here
    
    return {
        "total_users": total_users,
        "company_name": company.name if company else "Unknown",
        "company_status": company.status if company else "Unknown",
        "active_features": ["ai_insights", "activity_tracking"]
    }
