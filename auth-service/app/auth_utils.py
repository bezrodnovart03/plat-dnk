from jose import jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta

# Конфигурация
SECRET_KEY = "SUPER_SECRET_KEY" # Если вдруг не шарели у Auth и Gateway они должны быть одинаковы!!!!!!!!!!!!!!!!!!!!
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def create_access_token(data: dict):
    to_encode = data.copy()
    # Токен на с "утки" 
    expire = datetime.utcnow() + timedelta(days=1)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)