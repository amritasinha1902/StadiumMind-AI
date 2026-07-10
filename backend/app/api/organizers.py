from typing import Any, Dict, List
from app.services.organizer_service import OrganizerService

_service = OrganizerService()


async def get_dashboard() -> Dict[str, Any]:
    return await _service.get_dashboard_data()


async def get_reports() -> List[Dict[str, Any]]:
    return await _service.get_reports()


async def generate_insight(data: Dict[str, Any]) -> Dict[str, Any]:
    return await _service.generate_insight(data)
