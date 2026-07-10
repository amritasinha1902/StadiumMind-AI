from datetime import datetime
from typing import Dict, List
from app.models.venue import (
    FacilityStatus, FacilityType, IssueReport,
    SystemStatus, VenueOperationalStatus,
)


class VenueService:
    async def get_facilities(self, venue_id: str) -> List[FacilityStatus]:
        return [
            FacilityStatus(
                facility_id=f"{venue_id}-HVAC",
                name="HVAC System",
                type=FacilityType.HVAC,
                status=SystemStatus.OPERATIONAL,
                health_percentage=98.5,
                metrics={"temperature_c": 22, "humidity_pct": 45},
            ),
            FacilityStatus(
                facility_id=f"{venue_id}-POWER",
                name="Power Systems",
                type=FacilityType.POWER,
                status=SystemStatus.WARNING,
                health_percentage=87.0,
                metrics={"load_pct": 87, "backup_available": True},
            ),
            FacilityStatus(
                facility_id=f"{venue_id}-NET",
                name="Network Infrastructure",
                type=FacilityType.NETWORK,
                status=SystemStatus.OPERATIONAL,
                health_percentage=99.9,
                metrics={"uptime_pct": 99.9, "bandwidth_gbps": 40},
            ),
        ]

    async def get_operational_status(self, venue_id: str) -> VenueOperationalStatus:
        facilities = await self.get_facilities(venue_id)
        alert_count = sum(1 for f in facilities if f.status != SystemStatus.OPERATIONAL)
        return VenueOperationalStatus(
            venue_id=venue_id,
            venue_name="MetLife Stadium",
            capacity=82_500,
            current_occupancy=75_000,
            occupancy_percentage=90.9,
            systems=facilities,
            active_alerts=alert_count,
        )

    async def report_issue(self, venue_id: str, issue: IssueReport) -> Dict[str, str]:
        issue_id = f"ISS-{venue_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        return {
            "issue_id": issue_id,
            "venue_id": venue_id,
            "status": "received",
            "message": "Issue logged. A maintenance team has been notified.",
            "estimated_response_minutes": "15",
        }
