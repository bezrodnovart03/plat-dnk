import secrets
import string
from datetime import datetime, timezone
from typing import Any, List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import SessionAnswer, TestSession

_ALPH = string.ascii_lowercase + string.digits


async def _unique_slug(db: AsyncSession) -> str:
    for _ in range(64):
        slug = "".join(secrets.choice(_ALPH) for _ in range(8))
        q = await db.execute(select(func.count()).select_from(TestSession).where(TestSession.unique_slug == slug))
        if q.scalar_one() == 0:
            return slug
    raise RuntimeError("slug generation failed")


async def create_link_session(
    db: AsyncSession,
    *,
    test_id: UUID,
    psychologist_id: UUID,
    questions_snapshot: dict,
) -> TestSession:
    slug = await _unique_slug(db)
    row = TestSession(
        test_id=test_id,
        psychologist_id=psychologist_id,
        unique_slug=slug,
        status="pending",
        questions_snapshot=questions_snapshot,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def get_by_slug(db: AsyncSession, slug: str) -> Optional[TestSession]:
    r = await db.execute(select(TestSession).where(TestSession.unique_slug == slug))
    return r.scalar_one_or_none()


async def get_session(
    db: AsyncSession, session_id: UUID, load_answers: bool = False
) -> Optional[TestSession]:
    q = select(TestSession).where(TestSession.id == session_id)
    if load_answers:
        q = q.options(selectinload(TestSession.answers))
    r = await db.execute(q)
    return r.scalar_one_or_none()


async def start_session_row(
    db: AsyncSession,
    row: TestSession,
    *,
    client_name: str,
    client_email: Optional[str],
    client_phone: Optional[str],
) -> TestSession:
    row.client_name = client_name
    row.client_email = client_email
    row.client_phone = client_phone
    row.status = "in_progress"
    await db.commit()
    await db.refresh(row)
    return row


async def list_attempts_for_test(
    db: AsyncSession, test_id: UUID, psychologist_id: UUID
) -> List[TestSession]:
    r = await db.execute(
        select(TestSession)
        .where(
            TestSession.test_id == test_id,
            TestSession.psychologist_id == psychologist_id,
        )
        .order_by(TestSession.created_at.desc())
    )
    return list(r.scalars().all())


async def add_or_update_answer(
    db: AsyncSession,
    session_id: UUID,
    question_id: UUID,
    answer_value: Any,
) -> SessionAnswer:
    r = await db.execute(
        select(SessionAnswer).where(
            SessionAnswer.session_id == session_id,
            SessionAnswer.question_id == question_id,
        )
    )
    existing = r.scalar_one_or_none()
    if existing:
        existing.answer_value = answer_value
        await db.commit()
        await db.refresh(existing)
        return existing
    row = SessionAnswer(
        session_id=session_id,
        question_id=question_id,
        answer_value=answer_value,
    )
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row


async def mark_completed(db: AsyncSession, row: TestSession) -> TestSession:
    row.status = "completed"
    row.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(row)
    return row


async def load_answers_map(db: AsyncSession, session_id: UUID) -> dict[UUID, SessionAnswer]:
    r = await db.execute(select(SessionAnswer).where(SessionAnswer.session_id == session_id))
    rows = r.scalars().all()
    return {a.question_id: a for a in rows}
