from datetime import datetime
from typing import Any, Optional

from fastapi.responses import JSONResponse


def success_response(data: Any, message: str = "Success", status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={
            "success": True,
            "message": message,
            "data": data,
            "timestamp": datetime.utcnow().isoformat(),
        },
    )


def error_response(
    message: str,
    detail:  Optional[str] = None,
    status_code: int = 400,
) -> JSONResponse:
    body: dict = {
        "success": False,
        "message": message,
        "timestamp": datetime.utcnow().isoformat(),
    }
    if detail:
        body["detail"] = detail
    return JSONResponse(status_code=status_code, content=body)
