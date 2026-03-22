from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# import os
# from dotenv import load_dotenv

# load_dotenv()

# DATABASE_URL = os.getenv("DATABASE_URL")
# print("DATABASE_URL:", DATABASE_URL, type(DATABASE_URL))
# # "postgresql+asyncpg://profdnk:profdnk123@db:5432/profdnk"

# DATABASE_URL = "postgresql+asyncpg://devops_user:devops_password@127.0.0.1:5432/devops_db"

# engine = create_async_engine(DATABASE_URL, echo=True)
# SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# class Base(DeclarativeBase):
#     pass

# # Эта херь для базы энпоинтов ыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыы
# async def get_db():
#     async with SessionLocal() as session:
#         yield session

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

# Путь к файлу базы данных в текущей папке
DATABASE_URL = "sqlite+aiosqlite:///./test.db"

# Для SQLite добавляем connect_args, чтобы разрешить работу из разных "потоков" (нужно для FastAPI)
engine = create_async_engine(
    DATABASE_URL, 
    echo=True,
    connect_args={"check_same_thread": False} 
)

# class Base(DeclarativeBase):
#     pass

SessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with SessionLocal() as session:
        yield session