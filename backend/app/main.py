from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, companies, users, dashboard, activities, ai
from app.core.exceptions import setup_exception_handlers
from app.core.logging import logger

logger.info("Starting SaaS Platform API...")

app = FastAPI(title="Multi-Company Work Management Platform")

setup_exception_handlers(app)

# Initialize database
from app.core.database import engine, Base
from app.models import company, user, activity
Base.metadata.create_all(bind=engine)

# 👇 ADD THIS BLOCK
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # allow all for now (development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(users.router)
app.include_router(dashboard.router)
app.include_router(activities.router)
app.include_router(ai.router)

@app.get("/")
def home():
    return {"message": "Backend is running 🚀"}
