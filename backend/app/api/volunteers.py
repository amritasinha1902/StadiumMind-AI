from typing import List
from app.models.volunteer import (
    Task, TaskStatusUpdate, VolunteerSchedule,
    GuidanceRequest, GuidanceResponse,
)
from app.services.volunteer_service import VolunteerService

_service = VolunteerService()


async def get_volunteer_tasks(volunteer_id: str) -> List[Task]:
    return await _service.get_tasks_for_volunteer(volunteer_id)


async def update_task_status(task_id: str, update: TaskStatusUpdate) -> Task:
    return await _service.update_task_status(task_id, update)


async def get_volunteer_schedule(volunteer_id: str) -> List[VolunteerSchedule]:
    return await _service.get_schedule(volunteer_id)


async def get_ai_guidance(request: GuidanceRequest) -> GuidanceResponse:
    return await _service.get_ai_guidance(request)
