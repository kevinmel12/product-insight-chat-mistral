from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1 import routes_analyze, routes_chat


app = FastAPI(
    title="InsightChat API",
    description="Mistral-powered UX Analytics Assistant",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(routes_analyze.router, prefix="/api/v1")
app.include_router(routes_chat.router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint with basic API information."""
    return {
        "name": "InsightChat API",
        "version": "0.1.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "mistral_configured": bool(settings.mistral_api_key)
    }

