from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from .database import get_db, engine, Base
from .models import User
from .schemas import LoginRequest, TokenResponse, UserOut
from .auth_utils import verify_password, create_access_token

app = FastAPI(title="Auth Service")

# При запуске создаем таблицы в базе
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.post("/auth/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Ищем чела по email
    query = select(User).where(User.email == payload.email)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    # Если нет чела или пароль кривой — кидаем ошибку
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный логин или пароль"
        )

    # Делаем токен
    token_data = {"sub": str(user.id), "role": user.role}
    token = create_access_token(token_data)

    return {"access_token": token, "token_type": "bearer"}

# Эндпоинт для проверки токена
@app.get("/auth/validate")
async def validate_token(token_data: dict = Depends(create_access_token)):
    # Если токен валиден, то все гууд
    return {"status": "ok", "user": token_data}