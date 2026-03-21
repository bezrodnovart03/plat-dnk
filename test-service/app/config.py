from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Service
    SERVICE_NAME: str = "test-service"
    SERVICE_PORT: int = 8002
    DEBUG: bool = True  # Включите DEBUG для разработки
    
    # Database - используем SQLite для простоты
    DATABASE_URL: str = "sqlite+aiosqlite:///./test.db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()