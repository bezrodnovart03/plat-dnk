import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class TestSession(Base):
    """Прохождение теста: ссылка (pending) → старт клиента → ответы → completed."""

    __tablename__ = "test_sessions"

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    test_id = Column(Uuid(as_uuid=True), nullable=False, index=True)
    psychologist_id = Column(Uuid(as_uuid=True), nullable=False, index=True)
    unique_slug = Column(String(16), unique=True, nullable=False, index=True)

    client_name = Column(String(255), nullable=True)
    client_email = Column(String(255), nullable=True)
    client_phone = Column(String(64), nullable=True)

    # pending | in_progress | completed
    status = Column(String(32), nullable=False, default="pending")

    # Снимок теста на момент генерации ссылки (для публичного прохождения без вызова test-service)
    questions_snapshot = Column(JSON, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    answers = relationship(
        "SessionAnswer",
        back_populates="session",
        cascade="all, delete-orphan",
    )


class SessionAnswer(Base):
    __tablename__ = "session_answers"
    __table_args__ = (UniqueConstraint("session_id", "question_id", name="uq_session_question"),)

    id = Column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(
        Uuid(as_uuid=True),
        ForeignKey("test_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question_id = Column(Uuid(as_uuid=True), nullable=False, index=True)
    answer_value = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("TestSession", back_populates="answers")
