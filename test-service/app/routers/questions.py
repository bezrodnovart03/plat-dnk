from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.database import get_db
from app import crud, schemas
from app.dependencies import get_current_psychologist_id

router = APIRouter(prefix="/tests/{test_id}/questions", tags=["questions"])

@router.post("/", response_model=schemas.QuestionResponse, status_code=status.HTTP_201_CREATED)
async def add_question(
    test_id: UUID,
    question_data: schemas.QuestionCreate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Добавить вопрос в тест."""
    psychologist_id = get_current_psychologist_id(request)
    test = await crud.TestCRUD.get_by_id(db, test_id, psychologist_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # Получаем текущие вопросы для определения порядка
    existing_questions = await crud.QuestionCRUD.get_by_test(db, test_id)
    order_index = len(existing_questions)
    
    question = await crud.QuestionCRUD.create(db, test_id, question_data, order_index)
    return question

@router.put("/order", status_code=status.HTTP_204_NO_CONTENT)
async def reorder_questions(
    test_id: UUID,
    order_data: schemas.QuestionsOrderUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Изменить порядок вопросов (drag-and-drop)."""
    psychologist_id = get_current_psychologist_id(request)
    test = await crud.TestCRUD.get_by_id(db, test_id, psychologist_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    await crud.QuestionCRUD.reorder(db, test_id, order_data.question_ids)

@router.put("/{question_id}", response_model=schemas.QuestionResponse)
async def update_question(
    test_id: UUID,
    question_id: UUID,
    question_data: schemas.QuestionUpdate,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Обновить вопрос."""
    psychologist_id = get_current_psychologist_id(request)
    test = await crud.TestCRUD.get_by_id(db, test_id, psychologist_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    question = await crud.QuestionCRUD.get_by_id(db, question_id)
    if not question or question.test_id != test_id:
        raise HTTPException(status_code=404, detail="Question not found")
    
    updated = await crud.QuestionCRUD.update(db, question_id, question_data)
    return updated

@router.delete("/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_question(
    test_id: UUID,
    question_id: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Удалить вопрос."""
    psychologist_id = get_current_psychologist_id(request)
    test = await crud.TestCRUD.get_by_id(db, test_id, psychologist_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    question = await crud.QuestionCRUD.get_by_id(db, question_id)
    if not question or question.test_id != test_id:
        raise HTTPException(status_code=404, detail="Question not found")
    
    await crud.QuestionCRUD.delete(db, question_id)