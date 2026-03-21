from sqlalchemy import Column, String, Boolean, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from .database import Base # Дефолт класс SQLAlchemy

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="psychologist") # admin / psychologist
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime, nullable=True) # Срок годности аккаунта
    created_at = Column(DateTime, default=datetime.utcnow)