import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base

class Test(Base):
    __tablename__ = "tests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    psychologist_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    show_report_to_client = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=False)
    
    # Связь с вопросами
    questions = relationship("Question", back_populates="test", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(UUID(as_uuid=True), ForeignKey("tests.id", ondelete="CASCADE"), nullable=False, index=True)
    order_index = Column(Integer, nullable=False, default=0)
    type = Column(String(50), nullable=False)  # single_choice, text, scale
    text = Column(Text, nullable=False)
    required = Column(Boolean, default=True, nullable=False)
    # Переименовали metadata в question_metadata
    question_metadata = Column(JSON, nullable=True)  # Хранит options, scale_min/max и т.д.
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Связь с тестом
    test = relationship("Test", back_populates="questions")