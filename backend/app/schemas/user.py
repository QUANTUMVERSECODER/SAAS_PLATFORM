from pydantic import BaseModel, EmailStr

class SignupRequest(BaseModel):
    company_name: str
    email: EmailStr
    password: str
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class EmployeeCreate(BaseModel):
    email: EmailStr
    password: str
    role: str = "EMPLOYEE"

class EmployeeUpdate(BaseModel):
    role: str

class EmployeeResponse(BaseModel):
    id: int
    email: str
    role: str
    company_id: int
    
    class Config:
        from_attributes = True
