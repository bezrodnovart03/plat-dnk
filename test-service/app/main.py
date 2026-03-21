from contextlib import asynccontextmanager
from fastapi import FastAPI
import logging

from app.config import settings
from app.database import engine, Base
from app.routers import tests, questions, reports

# Настройка логирования
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(settings.SERVICE_NAME)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan контекст для startup/shutdown."""
    logger.info(f"Starting {settings.SERVICE_NAME}...")
    
    # Создаем таблицы при запуске (только для разработки!)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")
    
    yield
    
    logger.info(f"Shutting down {settings.SERVICE_NAME}...")
    await engine.dispose()

app = FastAPI(
    title=settings.SERVICE_NAME.capitalize(),
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url=None,
)

# Подключение роутеров
app.include_router(tests.router)
app.include_router(questions.router)
app.include_router(reports.router)

@app.get("/health")
async def health() -> dict:
    """Healthcheck endpoint."""
    return {
        "status": "ok",
        "service": settings.SERVICE_NAME,
    }

@app.get("/")
async def root() -> dict:
    return {"message": f"{settings.SERVICE_NAME} is running"}