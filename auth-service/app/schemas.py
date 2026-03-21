from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID

# Что присылает юзер при логине
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Что мы отдаем в ответ (Токен)
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# Данные пользователя (для эндпоинта /me)
class UserOut(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str