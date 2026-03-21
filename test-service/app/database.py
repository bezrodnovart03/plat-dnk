from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncSession,
    async_sessionmaker
)
from sqlalchemy.orm import declarative_base
from typing import AsyncGenerator

from app.config import settings

# SQLite требует особых настроек
if "sqlite" in settings.DATABASE_URL:
    # Для SQLite
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,  # Показывать SQL запросы для отладки
        connect_args={"check_same_thread": False}  # Нужно для SQLite
    )
else:
    # Для PostgreSQL
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=True,
    )

# Фабрика сессий
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

# Базовый класс для моделей
Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency для получения сессии БД."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()