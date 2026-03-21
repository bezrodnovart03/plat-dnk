from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from app.database import get_db
from app.dependencies import get_current_psychologist_id
from app import crud, schemas

router = APIRouter(prefix="/tests", tags=["tests"])

@router.post("/", response_model=schemas.TestResponse, status_code=status.HTTP_201_CREATED)
async def create_test(
    test_data: schemas.TestCreate,
    request: Request,
    psychologist_id: UUID = Depends(get_current_psychologist_id),
    db: AsyncSession = Depends(get_db)
):
    """Создать новый тест."""
    return await crud.TestCRUD.create(db, psychologist_id, test_data)

@router.get("/", response_model=List[schemas.TestResponse])
async def get_tests(
    request: Request,
    limit: int = 50,
    offset: int = 0,
    psychologist_id: UUID = Depends(get_current_psychologist_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить список тестов текущего психолога."""
    tests, _ = await crud.TestCRUD.get_all(db, psychologist_id, limit, offset)
    
    # Добавляем количество вопросов
    for test in tests:
        questions = await crud.QuestionCRUD.get_by_test(db, test.id)
        test.questions_count = len(questions)
    
    return tests

@router.get("/{test_id}", response_model=schemas.TestDetailResponse)
async def get_test(
    test_id: UUID,
    request: Request,
    psychologist_id: UUID = Depends(get_current_psychologist_id),
    db: AsyncSession = Depends(get_db)
):
    """Получить тест с вопросами."""
    test = await crud.TestCRUD.get_by_id(db, test_id, psychologist_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    questions = await crud.QuestionCRUD.get_by_test(db, test_id)
    test.questions = questions
    test.questions_count = len(questions)
    
    return test

@router.put("/{test_id}", response_model=schemas.TestResponse)
async def update_test(
    test_id: UUID,
    test_data: schemas.TestUpdate,
    request: Request,
    psychologist_id: UUID = Depends(get_current_psychologist_id),
    db: AsyncSession = Depends(get_db)
):
    """Обновить тест."""
    test = await crud.TestCRUD.get_by_id(db, test_id, psychologist_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    updated = await crud.TestCRUD.update(db, test_id, test_data)
    return updated

@router.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_test(
    test_id: UUID,
    request: Request,
    psychologist_id: UUID = Depends(get_current_psychologist_id),
    db: AsyncSession = Depends(get_db)
):
    """Удалить тест."""
    test = await crud.TestCRUD.get_by_id(db, test_id, psychologist_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    await crud.TestCRUD.delete(db, test_id)