from fastapi import APIRouter, File, UploadFile

from app.api import accessibility as accessibility_api
from app.models.accessibility import (
    ObjectDetectionResponse,
    OcrResponse,
    SceneResponse,
    SosRequest,
    SosResponse,
    VoiceRequest,
    VoiceResponse,
)

router = APIRouter()

router.add_api_route(
    "/voice",
    accessibility_api.voice_chat,
    methods=["POST"],
    response_model=VoiceResponse,
    summary="Multi-turn voice assistant interaction",
)

router.add_api_route(
    "/ocr",
    accessibility_api.analyze_ocr,
    methods=["POST"],
    response_model=OcrResponse,
    summary="Extract text from signs, banners, or tickets",
)

router.add_api_route(
    "/scene",
    accessibility_api.analyze_scene,
    methods=["POST"],
    response_model=SceneResponse,
    summary="Describe stadium scene and visual layout",
)

router.add_api_route(
    "/objects",
    accessibility_api.detect_objects,
    methods=["POST"],
    response_model=ObjectDetectionResponse,
    summary="Detect accessibility landmarks like ramps, stairs, washrooms",
)

router.add_api_route(
    "/sos",
    accessibility_api.trigger_sos,
    methods=["POST"],
    response_model=SosResponse,
    summary="Trigger Accessibility Emergency SOS assistance",
)
