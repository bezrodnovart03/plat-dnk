from uuid import UUID

from fastapi import HTTPException, Request


def get_current_psychologist_id(request: Request) -> UUID:
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in headers")
    try:
        return UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid user ID")


def get_auth_headers(request: Request) -> tuple[str, str]:
    """Authorization и X-User-Id для проксирования в test-service."""
    auth = request.headers.get("Authorization") or ""
    uid = request.headers.get("X-User-Id") or ""
    if not auth.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization")
    if not uid:
        raise HTTPException(status_code=401, detail="User ID not found in headers")
    return auth, uid
