from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI

from app.config import settings
from app.database import Base, engine
from app.routers import public_sessions, sessions

logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(settings.SERVICE_NAME)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s...", settings.SERVICE_NAME)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    logger.info("Shutting down %s...", settings.SERVICE_NAME)
    await engine.dispose()


app = FastAPI(
    title="Session Service",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.DEBUG else None,
)

app.include_router(sessions.router)
app.include_router(public_sessions.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.SERVICE_NAME}


@app.get("/")
async def root():
    return {"message": f"{settings.SERVICE_NAME} is running"}
