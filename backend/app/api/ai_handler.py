from app.ai.gemini_client import GeminiClient
from app.models.ai import (
    ChatRequest, ChatResponse,
    SummaryRequest, SummaryResponse,
    TranslationRequest, TranslationResponse,
)
from app.prompts.base_prompts import SYSTEM_PROMPT

_gemini = GeminiClient()


async def chat(request: ChatRequest) -> ChatResponse:
    history = [
        {"role": msg.role.value, "parts": [{"text": msg.content}]}
        for msg in request.history
    ]
    response_text = await _gemini.chat(
        message=request.message,
        history=history,
        system_instruction=SYSTEM_PROMPT,
    )
    return ChatResponse(response=response_text, model=_gemini.model)


async def generate_summary(request: SummaryRequest) -> SummaryResponse:
    summary_text = await _gemini.summarize(request.data, request.summary_type)
    return SummaryResponse(summary=summary_text)


async def translate_text(request: TranslationRequest) -> TranslationResponse:
    translated = await _gemini.translate(request.text, request.target_language)
    return TranslationResponse(
        translated_text=translated,
        source_language=request.source_language,
        target_language=request.target_language,
    )
