"""
Recommendation API Routes
FastAPI endpoints for serving recommendations
"""

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from services.recommendation_service import recommendation_service


router = APIRouter(
    prefix="/recommendations",
    tags=["recommendations"]
)


# Response models
class RecommendationItem(BaseModel):
    content_id: str
    score: float
    title: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    popularity_rank: Optional[int] = None


class RecommendationResponse(BaseModel):
    user_id: Optional[str]
    recommendations: List[RecommendationItem]
    model_version: str
    count: int
    is_personalized: bool
    reason: Optional[str] = None


class ModelInfoResponse(BaseModel):
    loaded: bool
    version: Optional[str] = None
    users_count: Optional[int] = None
    content_count: Optional[int] = None


@router.get("/{user_id}", response_model=RecommendationResponse)
async def get_user_recommendations(
    user_id: str,
    n: int = Query(default=10, ge=1, le=50, description="Number of recommendations")
):
    """
    Get personalized recommendations for a user
    
    - **user_id**: User UUID
    - **n**: Number of recommendations (1-50, default 10)
    
    Returns personalized recommendations if user exists in training data,
    otherwise returns popular content (cold start)
    """
    try:
        result = recommendation_service.get_recommendations(
            user_id=user_id,
            n=n,
            include_details=True
        )
        
        return RecommendationResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate recommendations: {str(e)}"
        )


@router.get("/", response_model=RecommendationResponse)
async def get_popular_recommendations(
    n: int = Query(default=10, ge=1, le=50, description="Number of recommendations")
):
    """
    Get popular content recommendations (for anonymous/new users)
    
    - **n**: Number of recommendations (1-50, default 10)
    
    Returns most popular content based on interaction count
    """
    try:
        result = recommendation_service._get_popular_content(
            n=n,
            include_details=True
        )
        
        return RecommendationResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get popular content: {str(e)}"
        )


@router.get("/model/info", response_model=ModelInfoResponse)
async def get_model_info():
    """
    Get information about the currently loaded ML model
    
    Returns model version, user count, and content count
    """
    try:
        info = recommendation_service.get_model_info()
        return ModelInfoResponse(**info)
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get model info: {str(e)}"
        )
