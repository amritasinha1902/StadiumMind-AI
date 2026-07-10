from datetime import datetime
from typing import Any, Dict, List
from app.ai.gemini_client import GeminiClient


class OrganizerService:
    def __init__(self) -> None:
        self._gemini = GeminiClient()

    async def get_dashboard_data(self) -> Dict[str, Any]:
        return {
            "total_matches": 64,
            "matches_completed": 12,
            "active_venues": 26,
            "total_fans_today": 312_000,
            "active_volunteers": 1_204,
            "open_incidents": 3,
            "ai_insights_generated": 1_247,
            "overall_satisfaction_score": 4.8,
            "last_updated": datetime.utcnow().isoformat(),
        }

    async def get_reports(self) -> List[Dict[str, Any]]:
        return [
            {
                "report_id": "RPT-001",
                "title": "Match Day Operations Report",
                "type": "Operations",
                "generated_at": datetime.utcnow().isoformat(),
                "status": "ready",
                "summary": "All operations running smoothly with minor crowd density alerts resolved.",
            },
            {
                "report_id": "RPT-002",
                "title": "Security Incident Summary",
                "type": "Security",
                "generated_at": datetime.utcnow().isoformat(),
                "status": "ready",
                "summary": "3 incidents recorded; all resolved within target response SLA.",
            },
            {
                "report_id": "RPT-003",
                "title": "Volunteer Performance Review",
                "type": "HR",
                "generated_at": datetime.utcnow().isoformat(),
                "status": "generating",
                "summary": None,
            },
        ]

    async def generate_insight(self, data: Dict[str, Any]) -> Dict[str, Any]:
        prompt = (
            f"You are an expert FIFA World Cup 2026 operations analyst.\n"
            f"Generate a concise, actionable operational insight based on this data:\n{data}"
        )
        insight = await self._gemini.generate(prompt=prompt)
        return {
            "insight": insight,
            "confidence": "high",
            "generated_at": datetime.utcnow().isoformat(),
        }
