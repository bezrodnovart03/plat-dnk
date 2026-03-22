from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Service
    SERVICE_NAME: str = "test-service"
    SERVICE_PORT: int = 8002
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./tests.db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    # Auth Service
    # Опционально: только для fallback-запроса профиля (GET /auth/me), если нет X-User-Email.
    AUTH_SERVICE_URL: str = "http://auth-service:8000"
    SESSION_SERVICE_URL: str = "http://session-service:8003"

    
    # Email (опционально, для реальной отправки)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""  # Ваш email
    SMTP_PASSWORD: str = ""  # Пароль приложения
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()