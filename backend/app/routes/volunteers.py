from fastapi import APIRouter
from app.api import volunteers as volunteers_api

router = APIRouter()

router.add_api_route(
    "/{volunteer_id}/tasks",
    volunteers_api.get_volunteer_tasks,
    methods=["GET"],
    summary="Get tasks assigned to a volunteer",
)

router.add_api_route(
    "/tasks/{task_id}",
    volunteers_api.update_task_status,
    methods=["PUT"],
    summary="Update the status of a task",
)

router.add_api_route(
    "/{volunteer_id}/schedule",
    volunteers_api.get_volunteer_schedule,
    methods=["GET"],
    summary="Get volunteer shift schedule",
)

router.add_api_route(
    "/guidance",
    volunteers_api.get_ai_guidance,
    methods=["POST"],
    summary="Ask the AI for volunteer guidance",
)
