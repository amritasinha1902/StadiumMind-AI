import logging
import sys
from app.config.settings import settings


def get_logger(name: str) -> logging.Logger:
    """Return a named logger configured once at import time."""
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger  # Already configured

    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    logger.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    fmt = logging.Formatter(
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    handler.setFormatter(fmt)
    logger.addHandler(handler)

    return logger
