from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

# Что присылает юзер при логине
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: Optional[str] = "psychologist"
    expires_at: Optional[datetime] = None

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