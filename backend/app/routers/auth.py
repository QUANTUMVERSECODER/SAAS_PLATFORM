from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from app.core.database import SessionLocal
from app.core.security import hash_password, verify_password, get_current_user
from app.core.jwt import create_access_token, create_refresh_token
from app.core.config import settings
from app.models.company import Company
from app.models.user import User
from app.models.activity import ActivityLog
from app.schemas.user import SignupRequest, LoginRequest
from app.schemas.token import Token, TokenRefreshRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    company = db.query(Company).filter(Company.name == data.company_name).first()

    if not company:
        company = Company(name=data.company_name)
        db.add(company)
        db.commit()
        db.refresh(company)

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        role="COMPANY_ADMIN",
        company_id=company.id
    )

    db.add(user)
    db.commit()

    return {"message": "Signup successful"}

@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "company_id": user.company_id
    }

    access_token = create_access_token(payload)
    refresh_token = create_refresh_token(payload)

    # Log the action
    log = ActivityLog(
        user_id=user.id,
        company_id=user.company_id,
        action="USER_LOGIN",
        details=f"User {user.email} logged in"
    )
    db.add(log)
    db.commit()

    return Token(access_token=access_token, refresh_token=refresh_token)

@router.post("/refresh", response_model=Token)
def refresh_token(data: TokenRefreshRequest, db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(
            data.refresh_token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        user_id = payload.get("user_id")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
            
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_payload = {
        "user_id": user.id,
        "email": user.email,
        "role": user.role,
        "company_id": user.company_id
    }

    access_token = create_access_token(new_payload)
    new_refresh_token = create_refresh_token(new_payload)

    return Token(access_token=access_token, refresh_token=new_refresh_token)

@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "company_id": current_user.company_id
    }