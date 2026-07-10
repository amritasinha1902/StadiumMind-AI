from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes import fans, security, volunteers, venue, organizers, ai, accessibility, fan_copilot, digital_twin
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("⚽ Starting FIFA Nexus AI Backend — %s", settings.environment)
    yield
    logger.info("🛑 Shutting down FIFA Nexus AI Backend")


app = FastAPI(
    title="FIFA Nexus AI API",
    description="AI-powered Stadium Operating System for FIFA World Cup 2026",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(fans.router,          prefix="/fans",          tags=["Fan Experience"])
app.include_router(security.router,      prefix="/security",      tags=["Security Operations"])
app.include_router(volunteers.router,    prefix="/volunteers",    tags=["Volunteer Management"])
app.include_router(venue.router,         prefix="/venue",         tags=["Venue Operations"])
app.include_router(organizers.router,    prefix="/organizers",    tags=["Organizer Tools"])
app.include_router(ai.router,            prefix="/ai",            tags=["AI Assistant"])
app.include_router(accessibility.router, prefix="/accessibility", tags=["Accessibility AI"])
app.include_router(fan_copilot.router,   prefix="/fan-copilot",   tags=["Fan Co-pilot"])
app.include_router(digital_twin.router,  prefix="/digital-twin",  tags=["Digital Twin Operations"])


@app.get("/health", tags=["System"], summary="Health check")
async def health_check():
    return {
        "status": "operational",
        "service": "FIFA Nexus AI",
        "version": "1.0.0",
        "environment": settings.environment,
    }


@app.get("/", tags=["System"], summary="API root")
async def root():
    return {
        "message": "FIFA Nexus AI API",
        "version": "1.0.0",
        "docs": "/docs",
    }
