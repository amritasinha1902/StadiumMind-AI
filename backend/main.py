from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config.settings import settings
from app.routes import fans, security, volunteers, venue, organizers, ai, accessibility, fan_copilot, digital_twin, multi_agent, command_center
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("⚽ Starting StadiumMind AI Backend — %s", settings.environment)
    yield
    logger.info("🛑 Shutting down StadiumMind AI Backend")


from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

is_prod = settings.environment == "production"

app = FastAPI(
    title="StadiumMind AI API",
    description="AI-powered Stadium Operating System for FIFA World Cup 2026",
    version="1.0.0",
    docs_url=None if is_prod else "/docs",
    redoc_url=None if is_prod else "/redoc",
    openapi_url=None if is_prod else "/openapi.json",
    lifespan=lifespan,
)

# Production security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "no-referrer"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error("HTTP error on %s %s: %s (status %d)", request.method, request.url.path, exc.detail, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s: %s", request.method, request.url.path, str(exc))
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred. Please contact system support."},
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
app.include_router(multi_agent.router,   prefix="/multi-agent",   tags=["Multi-Agent AI System"])
app.include_router(command_center.router, prefix="/command-center", tags=["Command Center Operations"])


@app.get("/health", tags=["System"], summary="Health check")
async def health_check():
    gemini_configured = bool(settings.gemini_api_key)
    status = "operational" if gemini_configured else "degraded"
    
    return {
        "status": status,
        "service": "StadiumMind AI",
        "version": "1.0.0",
        "environment": settings.environment,
        "checks": {
            "gemini_api": "ok" if gemini_configured else "missing_api_key",
        }
    }


@app.get("/", tags=["System"], summary="API root")
async def root():
    return {
        "message": "StadiumMind AI API",
        "version": "1.0.0",
        "docs": None if is_prod else "/docs",
    }
