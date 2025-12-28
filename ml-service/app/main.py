from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

# Import routes
from routes.recommendations import router as recommendation_router
from services.recommendation_service import recommendation_service

app = FastAPI(
    title="ML Recommendation Service",
    description="Machine Learning service for generating personalized content recommendations",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(recommendation_router)


@app.on_event("startup")
async def startup_event():
    """Load ML model on startup"""
    print("🚀 Starting ML Recommendation Service...")
    print("📦 Loading model...")
    recommendation_service.load_model()
    print("✅ Service ready!")


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    model_info = recommendation_service.get_model_info()
    return {
        "success": True,
        "message": "ML Service is healthy",
        "version": "1.0.0",
        "model_loaded": model_info.get('loaded', False),
        "model_version": model_info.get('version', None)
    }

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "ML Recommendation System",
        "status": "running",
        "docs": "/docs",  # FastAPI auto-generates documentation
        "endpoints": {
            "recommendations": "/recommendations/{user_id}",
            "popular": "/recommendations/",
            "model_info": "/recommendations/model/info"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("ML_SERVICE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
