from app.utils.logger import get_logger

logger = get_logger(__name__)

SUPPORTED_LANGUAGES = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German",
    "pt": "Portuguese", "ar": "Arabic", "zh": "Chinese (Simplified)",
    "ja": "Japanese", "ko": "Korean", "it": "Italian",
    "nl": "Dutch", "ru": "Russian", "tr": "Turkish", "hi": "Hindi",
}

VALID_ZONES = {
    "north_gate", "south_gate", "east_gate", "west_gate",
    "fan_zone", "vip_area", "media_zone", "parking_a", "parking_b",
}


def validate_language(code: str) -> str:
    """Normalise and validate a BCP-47 language code, defaulting to 'en'."""
    normalised = code.lower().strip()[:5]
    if normalised not in SUPPORTED_LANGUAGES:
        logger.warning("Unsupported language code '%s'; defaulting to 'en'.", code)
        return "en"
    return normalised


def validate_zone(zone: str) -> bool:
    """Return True if `zone` is a known stadium zone."""
    return zone.lower().replace(" ", "_") in VALID_ZONES


def sanitise_input(text: str, max_length: int = 2000) -> str:
    """Strip whitespace and truncate to `max_length` characters."""
    return text.strip()[:max_length]
