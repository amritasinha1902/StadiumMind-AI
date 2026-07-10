from typing import Dict, List
from app.models.venue import FacilityStatus, VenueOperationalStatus, IssueReport
from app.services.venue_service import VenueService

_service = VenueService()


async def get_facilities(venue_id: str) -> List[FacilityStatus]:
    return await _service.get_facilities(venue_id)


async def get_operational_status(venue_id: str) -> VenueOperationalStatus:
    return await _service.get_operational_status(venue_id)


async def report_issue(venue_id: str, issue: IssueReport) -> Dict[str, str]:
    return await _service.report_issue(venue_id, issue)
