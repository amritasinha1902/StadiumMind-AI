from functools import lru_cache
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Runtime
    environment: str = "development"
    log_level: str = "INFO"

    # Google Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-1.5-flash"
    max_tokens: int = 2048
    temperature: float = 0.7

    # Firebase
    firebase_project_id: str = ""
    google_application_credentials: str = ""

    # CORS
    cors_origins: List[str] = ["http://localhost:5173"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings: Settings = get_settings()
