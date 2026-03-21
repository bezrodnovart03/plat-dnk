from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    SERVICE_NAME: str = "session-service"
    DEBUG: bool = True

    DATABASE_URL: str = "sqlite+aiosqlite:///./sessions.db"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20

    TEST_SERVICE_URL: str = "http://test-service:8000"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
