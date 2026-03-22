from fastapi import FastAPI, Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession
from contextlib import asynccontextmanager  
from sqlalchemy import select
from .database import get_db, engine, Base
from .models import User
from .schemas import LoginRequest, TokenResponse, UserOut, UserCreate
from .auth_utils import verify_password, create_access_token, decode_access_token, hash_password

app = FastAPI(title="Auth Service")

# При запуске создаем таблицы в базе
# @app.on_event("startup")
# async def startup():
#     async with engine.begin() as conn:
#         await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

# РЕГИСТРАЦИЯ (Создание пользователя)
@app.post("/auth/users", response_model=UserOut)
async def register(payload: UserCreate, db: AsyncSession = Depends(get_db)):
    # Проверка, нет ли уже такого email
    check_query = select(User).where(User.email == payload.email)
    existing_user = await db.execute(check_query)
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email уже занят")
    
    new_user = User(
        email=payload.email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name,
        role=payload.role,
        expires_at=payload.expires_at
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

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
@app.post("/auth/validate")
async def validate_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Отсутствует токен")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(status_code=401, detail="Невалидный или просроченный токен")
    
    return {"status": "ok", "user_id": payload.get("sub"), "role": payload.get("role")}