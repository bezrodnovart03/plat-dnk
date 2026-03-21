from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.answer_validation import validate_answer
from app.database import get_db
from app.schemas import (
    AnswerSubmitRequest,
    AnswerSubmitResponse,
    NextQuestionResponse,
    QuestionPublicOut,
    SessionStartRequest,
    SessionStartResponse,
)
from app.session_helpers import (
    all_required_answered,
    find_question,
    next_unanswered_question,
    progress_percent,
)

router = APIRouter(prefix="/sessions/public", tags=["public-sessions"])


@router.post("/sessions/start", response_model=SessionStartResponse)
async def public_start(body: SessionStartRequest, db: AsyncSession = Depends(get_db)):
    row = await crud.get_by_slug(db, body.slug.strip())
    if not row:
        raise HTTPException(status_code=404, detail="Ссылка не найдена")
    if row.status == "completed":
        raise HTTPException(status_code=410, detail="Тест уже завершён")
    if row.status == "in_progress":
        raise HTTPException(status_code=409, detail="Сессия уже начата")
    if row.status != "pending":
        raise HTTPException(status_code=400, detail="Некорректное состояние сессии")

    snap = row.questions_snapshot or {}
    row = await crud.start_session_row(
        db,
        row,
        client_name=body.client_name,
        client_email=body.client_email,
        client_phone=body.client_phone,
    )
    total = len(snap.get("questions") or [])
    return SessionStartResponse(
        session_id=row.id,
        test_title=snap.get("test_title") or "",
        total_questions=total,
        status=row.status,
    )


@router.get("/sessions/{session_id}/next", response_model=NextQuestionResponse)
async def public_next(session_id: UUID, db: AsyncSession = Depends(get_db)):
    row = await crud.get_session(db, session_id)
    if not row:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    if row.status != "in_progress":
        raise HTTPException(status_code=400, detail="Сессия не активна")

    answered_map = await crud.load_answers_map(db, session_id)
    answered_ids = set(answered_map.keys())
    snap = row.questions_snapshot
    pct = progress_percent(snap, answered_ids)
    nxt = next_unanswered_question(snap, answered_ids)

    if nxt is None:
        if all_required_answered(snap, answered_ids) and row.status != "completed":
            row = await crud.mark_completed(db, row)
        return NextQuestionResponse(
            session_id=session_id,
            progress_percent=100,
            question=None,
            is_finished=True,
        )

    q_out = QuestionPublicOut(
        id=UUID(str(nxt["id"])),
        order_index=nxt.get("order_index", 0),
        type=nxt["type"],
        text=nxt["text"],
        required=nxt.get("required", True),
        metadata=nxt.get("metadata"),
    )
    return NextQuestionResponse(
        session_id=session_id,
        progress_percent=pct,
        question=q_out,
        is_finished=False,
    )


@router.post("/sessions/{session_id}/answer", response_model=AnswerSubmitResponse)
async def public_answer(
    session_id: UUID,
    body: AnswerSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    row = await crud.get_session(db, session_id)
    if not row:
        raise HTTPException(status_code=404, detail="Сессия не найдена")
    if row.status != "in_progress":
        raise HTTPException(status_code=400, detail="Сессия не активна")

    snap = row.questions_snapshot
    qdef = find_question(snap, body.question_id)
    if not qdef:
        raise HTTPException(status_code=404, detail="Вопрос не относится к этой сессии")

    coerced = validate_answer(qdef["type"], qdef.get("metadata"), body.answer_value)
    await crud.add_or_update_answer(db, session_id, body.question_id, coerced)

    answered_map = await crud.load_answers_map(db, session_id)
    answered_ids = set(answered_map.keys())
    pct = progress_percent(snap, answered_ids)
    finished = next_unanswered_question(snap, answered_ids) is None and all_required_answered(snap, answered_ids)

    if finished:
        row = await crud.mark_completed(db, row)
        pct = 100

    return AnswerSubmitResponse(session_id=session_id, progress_percent=pct, is_finished=finished)
