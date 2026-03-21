from sqlalchemy import select, update, delete, func
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional, List, Tuple

from app.models import Test, Question
from app.schemas import TestCreate, TestUpdate, QuestionCreate, QuestionUpdate

class TestCRUD:
    @staticmethod
    async def create(db: AsyncSession, psychologist_id: UUID, test_data: TestCreate) -> Test:
        """Создать новый тест."""
        db_test = Test(**test_data.model_dump(), psychologist_id=psychologist_id)
        db.add(db_test)
        await db.commit()
        await db.refresh(db_test)
        return db_test

    @staticmethod
    async def get_by_id(db: AsyncSession, test_id: UUID, psychologist_id: Optional[UUID] = None) -> Optional[Test]:
        """Получить тест по ID."""
        query = select(Test).where(Test.id == test_id)
        if psychologist_id:
            query = query.where(Test.psychologist_id == psychologist_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def get_all(db: AsyncSession, psychologist_id: UUID, limit: int = 50, offset: int = 0) -> Tuple[List[Test], int]:
        """Получить все тесты психолога."""
        query = select(Test).where(Test.psychologist_id == psychologist_id)
        total_result = await db.execute(select(func.count()).select_from(query.subquery()))
        total = total_result.scalar_one()
        
        query = query.order_by(Test.created_at.desc()).offset(offset).limit(limit)
        result = await db.execute(query)
        tests = result.scalars().all()
        return tests, total

    @staticmethod
    async def update(db: AsyncSession, test_id: UUID, test_data: TestUpdate) -> Optional[Test]:
        """Обновить тест."""
        update_data = test_data.model_dump(exclude_unset=True)
        if not update_data:
            return await TestCRUD.get_by_id(db, test_id)
        
        query = update(Test).where(Test.id == test_id).values(**update_data).returning(Test)
        result = await db.execute(query)
        await db.commit()
        return result.scalar_one_or_none()

    @staticmethod
    async def delete(db: AsyncSession, test_id: UUID) -> bool:
        """Удалить тест."""
        query = delete(Test).where(Test.id == test_id)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0

class QuestionCRUD:
    @staticmethod
    async def create(db: AsyncSession, test_id: UUID, question_data: QuestionCreate, order_index: int) -> Question:
        """Создать новый вопрос."""
        # Преобразуем данные, заменяя metadata на question_metadata
        data = question_data.model_dump(by_alias=True)
        # Если есть metadata, переносим в question_metadata
        if "metadata" in data:
            data["question_metadata"] = data.pop("metadata")
        
        db_question = Question(
            **data,
            test_id=test_id,
            order_index=order_index
        )
        db.add(db_question)
        await db.commit()
        await db.refresh(db_question)
        return db_question

    @staticmethod
    async def get_by_id(db: AsyncSession, question_id: UUID) -> Optional[Question]:
        """Получить вопрос по ID."""
        result = await db.execute(select(Question).where(Question.id == question_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_by_test(db: AsyncSession, test_id: UUID) -> List[Question]:
        """Получить все вопросы теста."""
        result = await db.execute(
            select(Question)
            .where(Question.test_id == test_id)
            .order_by(Question.order_index)
        )
        return result.scalars().all()

    @staticmethod
    async def update(db: AsyncSession, question_id: UUID, question_data: QuestionUpdate) -> Optional[Question]:
        """Обновить вопрос."""
        update_data = question_data.model_dump(exclude_unset=True, by_alias=True)
        # Если есть metadata, переносим в question_metadata
        if "metadata" in update_data:
            update_data["question_metadata"] = update_data.pop("metadata")
        
        if not update_data:
            return await QuestionCRUD.get_by_id(db, question_id)
        
        query = update(Question).where(Question.id == question_id).values(**update_data).returning(Question)
        result = await db.execute(query)
        await db.commit()
        return result.scalar_one_or_none()

    @staticmethod
    async def delete(db: AsyncSession, question_id: UUID) -> bool:
        """Удалить вопрос."""
        query = delete(Question).where(Question.id == question_id)
        result = await db.execute(query)
        await db.commit()
        return result.rowcount > 0

    @staticmethod
    async def reorder(db: AsyncSession, test_id: UUID, question_ids: List[UUID]) -> bool:
        """Изменить порядок вопросов."""
        for index, question_id in enumerate(question_ids):
            query = update(Question).where(
                Question.id == question_id,
                Question.test_id == test_id
            ).values(order_index=index)
            await db.execute(query)
        await db.commit()
        return True