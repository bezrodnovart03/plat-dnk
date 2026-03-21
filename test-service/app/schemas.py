from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime
from typing import Optional, List, Any

# ----- Schemas for Test -----
class TestBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    show_report_to_client: bool = True

class TestCreate(TestBase):
    pass

class TestUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    is_published: Optional[bool] = None
    show_report_to_client: Optional[bool] = None

class TestResponse(TestBase):
    id: UUID
    psychologist_id: UUID
    is_published: bool
    created_at: datetime
    updated_at: datetime
    questions_count: Optional[int] = 0
    sessions_count: Optional[int] = 0
    
    class Config:
        from_attributes = True

class TestDetailResponse(TestResponse):
    questions: List['QuestionResponse'] = []

# ----- Schemas for Question -----
class QuestionBase(BaseModel):
    type: str = Field(..., pattern="^(single_choice|text|scale)$")
    text: str = Field(..., min_length=1)
    required: bool = True
    question_metadata: Optional[Any] = Field(None, alias="metadata")  # Позволяем использовать metadata в API

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    text: Optional[str] = Field(None, min_length=1)
    required: Optional[bool] = None
    question_metadata: Optional[Any] = Field(None, alias="metadata")

class QuestionResponse(QuestionBase):
    id: UUID
    test_id: UUID
    order_index: int
    
    class Config:
        from_attributes = True
        populate_by_name = True  # Позволяет использовать и metadata, и question_metadata

# For updating order
class QuestionsOrderUpdate(BaseModel):
    question_ids: List[UUID]

# To resolve forward references
TestDetailResponse.model_rebuild()