from fastapi import UploadFile

from app.models.accessibility import (
    ObjectDetectionResponse,
    OcrResponse,
    SceneResponse,
    SosRequest,
    SosResponse,
    VoiceRequest,
    VoiceResponse,
)
from app.services.accessibility_service import AccessibilityService

_service = AccessibilityService()


async def voice_chat(request: VoiceRequest) -> VoiceResponse:
    return await _service.get_voice_response(request)


async def analyze_ocr(file: UploadFile) -> OcrResponse:
    content = await file.read()
    return await _service.analyze_ocr(content, file.filename)


async def analyze_scene(file: UploadFile) -> SceneResponse:
    content = await file.read()
    return await _service.analyze_scene(content, file.filename)


async def detect_objects(file: UploadFile) -> ObjectDetectionResponse:
    content = await file.read()
    return await _service.detect_objects(content, file.filename)


async def trigger_sos(request: SosRequest) -> SosResponse:
    return await _service.trigger_sos(request)
