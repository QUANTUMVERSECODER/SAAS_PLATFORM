from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import SessionLocal
from app.core.security import require_roles, hash_password
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.user import EmployeeResponse, EmployeeCreate, EmployeeUpdate

router = APIRouter(prefix="/users", tags=["Employees"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=List[EmployeeResponse])
def get_employees(
    current_user: User = Depends(require_roles(["COMPANY_ADMIN"])),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.company_id == current_user.company_id).all()
    return users

@router.post("/", response_model=EmployeeResponse)
def create_employee(
    data: EmployeeCreate,
    current_user: User = Depends(require_roles(["COMPANY_ADMIN"])),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    if data.role not in ["COMPANY_ADMIN", "EMPLOYEE"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    new_user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        company_id=current_user.company_id
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Log the action
    log = ActivityLog(
        user_id=current_user.id,
        company_id=current_user.company_id,
        action="EMPLOYEE_CREATED",
        details=f"Employee {new_user.email} added with role {new_user.role}"
    )
    db.add(log)
    db.commit()
    
    return new_user

@router.put("/{user_id}", response_model=EmployeeResponse)
def update_employee_role(
    user_id: int,
    data: EmployeeUpdate,
    current_user: User = Depends(require_roles(["COMPANY_ADMIN"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id, User.company_id == current_user.company_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if data.role not in ["COMPANY_ADMIN", "EMPLOYEE"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
        
    user.role = data.role
    db.commit()
    db.refresh(user)

    # Log the action
    log = ActivityLog(
        user_id=current_user.id,
        company_id=current_user.company_id,
        action="EMPLOYEE_ROLE_UPDATED",
        details=f"Employee {user.email} role updated to {data.role}"
    )
    db.add(log)
    db.commit()
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(
    user_id: int,
    current_user: User = Depends(require_roles(["COMPANY_ADMIN"])),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id, User.company_id == current_user.company_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if user.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete your own account")

    db.delete(user)
    
    # Log the action
    log = ActivityLog(
        user_id=current_user.id,
        company_id=current_user.company_id,
        action="EMPLOYEE_DELETED",
        details=f"Employee {user.email} removed"
    )
    db.add(log)
    db.commit()
    return None
