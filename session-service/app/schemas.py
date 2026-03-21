from datetime import datetime
from typing import Any, List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class GenerateLinkRequest(BaseModel):
    test_id: UUID


class GenerateLinkResponse(BaseModel):
    slug: str
    url_path: str = Field(description="Относительный путь вида /t/{slug} для фронта")


class SessionStartRequest(BaseModel):
    slug: str = Field(..., min_length=4, max_length=16)
    client_name: str = Field(..., min_length=1, max_length=255)
    client_email: Optional[str] = None
    client_phone: Optional[str] = None


class SessionStartResponse(BaseModel):
    session_id: UUID
    test_title: str
    total_questions: int
    status: str


class QuestionPublicOut(BaseModel):
    id: UUID
    order_index: int
    type: str
    text: str
    required: bool
    metadata: Optional[Any] = None


class NextQuestionResponse(BaseModel):
    session_id: UUID
    progress_percent: int
    question: Optional[QuestionPublicOut] = None
    is_finished: bool


class AnswerSubmitRequest(BaseModel):
    question_id: UUID
    answer_value: Any


class AnswerSubmitResponse(BaseModel):
    session_id: UUID
    progress_percent: int
    is_finished: bool


class SessionAttemptSummary(BaseModel):
    id: UUID
    test_id: UUID
    client_name: Optional[str]
    client_email: Optional[str]
    status: str
    unique_slug: str
    created_at: datetime
    completed_at: Optional[datetime]


class SessionAnswerOut(BaseModel):
    question_id: UUID
    answer_value: Any
    created_at: datetime


class SessionDetailResponse(BaseModel):
    id: UUID
    test_id: UUID
    unique_slug: str
    client_name: Optional[str]
    client_email: Optional[str]
    client_phone: Optional[str]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]
    questions_snapshot: Optional[dict] = None
    answers: List[SessionAnswerOut]
