import logging
from uuid import UUID

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class AuthClient:
    """HTTP-клиент к auth-service (профиль текущего пользователя по JWT)."""

    async def get_psychologist_by_id(self, psychologist_id: UUID, token: str) -> dict | None:
        """
        GET /auth/me и проверка, что id в токене совпадает с psychologist_id из шлюза.
        """
        url = f"{settings.AUTH_SERVICE_URL.rstrip('/')}/auth/me"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    url,
                    headers={"Authorization": f"Bearer {token}"},
                )
        except httpx.RequestError as e:
            logger.error("auth-service request failed: %s", e)
            return None

        if response.status_code != 200:
            logger.warning("auth/me returned %s", response.status_code)
            return None

        data = response.json()
        if str(data.get("id")) != str(psychologist_id):
            return None
        return data


auth_client = AuthClient()
