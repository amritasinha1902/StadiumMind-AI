from fastapi import APIRouter
from app.api import ai_handler

router = APIRouter()

router.add_api_route(
    "/chat",
    ai_handler.chat,
    methods=["POST"],
    summary="Multi-turn AI chat with Gemini",
)

router.add_api_route(
    "/summary",
    ai_handler.generate_summary,
    methods=["POST"],
    summary="Generate an AI summary from structured data",
)

router.add_api_route(
    "/translate",
    ai_handler.translate_text,
    methods=["POST"],
    summary="Translate text to any supported language",
)
