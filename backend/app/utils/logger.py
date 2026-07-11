import json
import logging
import sys
from app.config.settings import settings


class JSONFormatter(logging.Formatter):
    """Structured JSON formatter for Google Cloud Logging compatibility."""
    def format(self, record: logging.LogRecord) -> str:
        severity_mapping = {
            "DEBUG": "DEBUG",
            "INFO": "INFO",
            "WARNING": "WARNING",
            "ERROR": "ERROR",
            "CRITICAL": "CRITICAL",
        }
        severity = severity_mapping.get(record.levelname, "INFO")
        
        log_entry = {
            "severity": severity,
            "message": record.getMessage(),
            "time": self.formatTime(record, self.datefmt),
            "logging.googleapis.com/sourceLocation": {
                "file": record.filename,
                "line": str(record.lineno),
                "function": record.funcName,
            },
            "logger": record.name,
        }
        
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_entry)


def get_logger(name: str) -> logging.Logger:
    """Return a named logger configured once at import time."""
    logger = logging.getLogger(name)

    if logger.handlers:
        return logger  # Already configured

    level = getattr(logging, settings.log_level.upper(), logging.INFO)
    logger.setLevel(level)

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(level)
    
    if settings.environment == "production":
        formatter = JSONFormatter(datefmt="%Y-%m-%dT%H:%M:%SZ")
    else:
        formatter = logging.Formatter(
            "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        
    handler.setFormatter(formatter)
    logger.addHandler(handler)

    return logger
