import logging
from typing import Any
from uuid import UUID

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


async def fetch_test_detail(test_id: UUID, authorization: str, x_user_id: str) -> dict[str, Any] | None:
    """GET /tests/{id} в test-service (тест с вопросами), от имени психолога."""
    url = f"{settings.TEST_SERVICE_URL.rstrip('/')}/tests/{test_id}"
    headers = {"Authorization": authorization, "X-User-Id": x_user_id}
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(url, headers=headers)
    except httpx.RequestError as e:
        logger.error("test-service unreachable: %s", e)
        return None
    if r.status_code != 200:
        logger.warning("fetch_test_detail %s -> %s", test_id, r.status_code)
        return None
    return r.json()


def build_questions_snapshot(test_json: dict) -> dict[str, Any]:
    """Минимальный снимок для клиента и отчёта."""
    questions_raw = test_json.get("questions") or []
    ordered = sorted(questions_raw, key=lambda q: q.get("order_index", 0))
    questions = []
    for q in ordered:
        qid = q.get("id")
        if qid is None:
            continue
        questions.append(
            {
                "id": str(qid),
                "order_index": q.get("order_index", 0),
                "type": q.get("type", "text"),
                "text": q.get("text") or "",
                "required": q.get("required", True),
                "metadata": q.get("metadata") or q.get("question_metadata"),
            }
        )
    return {
        "test_title": test_json.get("title", ""),
        "test_description": test_json.get("description"),
        "is_published": test_json.get("is_published", False),
        "questions": questions,
    }
