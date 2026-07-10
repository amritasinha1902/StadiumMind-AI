from datetime import datetime
from typing import List
from app.ai.gemini_client import GeminiClient
from app.models.volunteer import (
    GuidanceRequest, GuidanceResponse, Task, TaskPriority,
    TaskStatus, TaskStatusUpdate, VolunteerRole, VolunteerSchedule,
)
from app.prompts.volunteer_prompts import VOLUNTEER_GUIDE_PROMPT


class VolunteerService:
    def __init__(self) -> None:
        self._gemini = GeminiClient()

    async def get_tasks_for_volunteer(self, volunteer_id: str) -> List[Task]:
        return [
            Task(
                task_id="TASK-001",
                title="Gate B Fan Assistance",
                description="Help fans find their seats and answer questions at Gate B entrance.",
                priority=TaskPriority.HIGH,
                status=TaskStatus.IN_PROGRESS,
                assigned_to=volunteer_id,
                zone="Gate B",
                volunteers_required=8,
            )
        ]

    async def update_task_status(self, task_id: str, update: TaskStatusUpdate) -> Task:
        return Task(
            task_id=task_id,
            title="Updated Task",
            description="Task status has been updated.",
            priority=TaskPriority.MEDIUM,
            status=update.status,
            zone="General",
        )

    async def get_schedule(self, volunteer_id: str) -> List[VolunteerSchedule]:
        return [
            VolunteerSchedule(
                volunteer_id=volunteer_id,
                date=datetime.utcnow().strftime("%Y-%m-%d"),
                shift_start="08:00",
                shift_end="16:00",
                role=VolunteerRole.GATE_ASSISTANT,
                zone="Gate B",
                supervisor="Supervisor-01",
            )
        ]

    async def get_ai_guidance(self, request: GuidanceRequest) -> GuidanceResponse:
        answer = await self._gemini.generate(
            prompt=request.question,
            system_instruction=VOLUNTEER_GUIDE_PROMPT,
        )
        return GuidanceResponse(
            answer=answer,
            related_procedures=["Emergency Protocol A", "Fan Assistance Guide v3"],
            emergency_contacts=["Security: ext. 5000", "Medical: ext. 5001"],
        )
