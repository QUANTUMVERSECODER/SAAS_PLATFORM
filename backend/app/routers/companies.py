from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.core.security import require_roles
from app.models.user import User
from app.models.company import Company
from app.models.activity import ActivityLog
from app.schemas.company import CompanyResponse, CompanyUpdate

router = APIRouter(prefix="/companies", tags=["Companies"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/me", response_model=CompanyResponse)
def get_my_company(
    current_user: User = Depends(require_roles(["COMPANY_ADMIN", "EMPLOYEE"])),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
    return company

@router.put("/me", response_model=CompanyResponse)
def update_my_company(
    data: CompanyUpdate,
    current_user: User = Depends(require_roles(["COMPANY_ADMIN"])),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    if data.name is not None:
        # Check uniqueness
        existing = db.query(Company).filter(Company.name == data.name, Company.id != company.id).first()
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Company name already taken")
        company.name = data.name
    
    if data.status is not None:
        company.status = data.status

    db.commit()
    db.refresh(company)

    # Log the action
    log = ActivityLog(
        user_id=current_user.id,
        company_id=current_user.company_id,
        action="COMPANY_UPDATED",
        details=f"Company profile updated"
    )
    db.add(log)
    db.commit()
    return company

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_company(
    current_user: User = Depends(require_roles(["COMPANY_ADMIN"])),
    db: Session = Depends(get_db)
):
    company = db.query(Company).filter(Company.id == current_user.company_id).first()
    if not company:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

    # This would cascade delete users if configured in models, 
    # but for safety we just log and change status instead of hard delete in production.
    # For now, hard delete:
    # For now, hard delete:
    db.delete(company)

    # Log the action
    log = ActivityLog(
        user_id=current_user.id,
        company_id=current_user.company_id,
        action="COMPANY_DELETED",
        details=f"Company profile deleted"
    )
    db.add(log)

    db.commit()
    return None
