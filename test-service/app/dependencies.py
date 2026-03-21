# app/dependencies.py
from fastapi import HTTPException, Request
from uuid import UUID

def get_current_psychologist_id(request: Request) -> UUID:
    """Получить ID психолога из заголовка (добавляется Gateway)."""
    user_id = request.headers.get("X-User-Id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID not found in headers")
    return UUID(user_id)

def get_current_user_role(request: Request) -> str:
    """Получить роль пользователя из заголовка."""
    role = request.headers.get("X-User-Role")
    if not role:
        raise HTTPException(status_code=401, detail="User role not found in headers")
    return role