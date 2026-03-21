from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

DATABASE_URL = "postgresql+asyncpg://profdnk:profdnk123@db:5432/profdnk"

engine = create_async_engine(DATABASE_URL, echo=True)
SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

# Эта херь для базы энпоинтов ыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыы
async def get_db():
    async with SessionLocal() as session:
        yield session