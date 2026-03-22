import logging
from typing import Any
from uuid import UUID

import httpx
from app.config import settings

logger = logging.getLogger(__name__)


class SessionClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")

    async def get_session_detail(self, session_id: UUID, authorization: str, x_user_id: str) -> dict[str, Any] | None:
        url = f"{self.base_url}/sessions/{session_id}/detail"
        headers = {
            "Authorization": authorization,
            "X-User-Id": x_user_id,
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(url, headers=headers)
        except httpx.RequestError as e:
            logger.error("session-service unreachable: %s", e)
            return None
        if r.status_code != 200:
            logger.warning("get_session_detail %s -> %s", session_id, r.status_code)
            return None
        return r.json()

    async def list_attempts_for_test(self, test_id: UUID, authorization: str, x_user_id: str) -> list[dict]:
        url = f"{self.base_url}/sessions/tests/{test_id}/attempts"
        headers = {
            "Authorization": authorization,
            "X-User-Id": x_user_id,
        }
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(url, headers=headers)
        except httpx.RequestError as e:
            logger.error("session-service unreachable: %s", e)
            return []
        if r.status_code != 200:
            logger.warning("list_attempts_for_test %s -> %s", test_id, r.status_code)
            return []
        return r.json()


session_client = SessionClient(settings.SESSION_SERVICE_URL)
