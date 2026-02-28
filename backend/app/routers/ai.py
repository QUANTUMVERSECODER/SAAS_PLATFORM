from fastapi import APIRouter, Depends
from typing import Dict, Any

from app.core.security import require_roles
from app.models.user import User
from app.services.ai_service import generate_productivity_insights

router = APIRouter(prefix="/ai", tags=["AI Features"])

# Note: In production, AI endpoints can be computationally expensive.
# Rate limiting (e.g., via slowapi or Redis) should be applied here.

@router.get("/insights", response_model=Dict[str, Any])
async def get_insights(
    current_user: User = Depends(require_roles(["COMPANY_ADMIN"]))
):
    insights = await generate_productivity_insights(current_user.company_id)
    return insights
