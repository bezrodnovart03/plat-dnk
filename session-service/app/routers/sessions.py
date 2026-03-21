from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app import crud
from app.clients.test_service_client import build_questions_snapshot, fetch_test_detail
from app.database import get_db
from app.dependencies import get_auth_headers, get_current_psychologist_id
from app.schemas import (
    GenerateLinkRequest,
    GenerateLinkResponse,
    SessionAnswerOut,
    SessionDetailResponse,
    SessionAttemptSummary,
)

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("/generate-link", response_model=GenerateLinkResponse)
async def generate_link(
    body: GenerateLinkRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    psychologist_id: UUID = Depends(get_current_psychologist_id),
):
    """Создать уникальную ссылку на прохождение теста (снимок вопросов фиксируется здесь)."""
    authorization, x_user = get_auth_headers(request)
    test_json = await fetch_test_detail(body.test_id, authorization, x_user)
    if not test_json:
        raise HTTPException(status_code=404, detail="Тест не найден или нет доступа")

    if not test_json.get("is_published"):
        raise HTTPException(status_code=400, detail="Тест не опубликован")

    snapshot = build_questions_snapshot(test_json)
    if not snapshot["questions"]:
        raise HTTPException(status_code=400, detail="В тесте нет вопросов")

    row = await crud.create_link_session(
        db,
        test_id=body.test_id,
        psychologist_id=psychologist_id,
        questions_snapshot=snapshot,
    )
    return GenerateLinkResponse(slug=row.unique_slug, url_path=f"/t/{row.unique_slug}")


@router.get("/tests/{test_id}/attempts", response_model=list[SessionAttemptSummary])
async def list_attempts(
    test_id: UUID,
    db: AsyncSession = Depends(get_db),
    psychologist_id: UUID = Depends(get_current_psychologist_id),
):
    rows = await crud.list_attempts_for_test(db, test_id, psychologist_id)
    return [
        SessionAttemptSummary(
            id=r.id,
            test_id=r.test_id,
            client_name=r.client_name,
            client_email=r.client_email,
            status=r.status,
            unique_slug=r.unique_slug,
            created_at=r.created_at,
            completed_at=r.completed_at,
        )
        for r in rows
    ]


@router.get("/{session_id}/detail", response_model=SessionDetailResponse)
async def session_detail(
    session_id: UUID,
    db: AsyncSession = Depends(get_db),
    psychologist_id: UUID = Depends(get_current_psychologist_id),
):
    row = await crud.get_session(db, session_id, load_answers=True)
    if not row or row.psychologist_id != psychologist_id:
        raise HTTPException(status_code=404, detail="Сессия не найдена")

    answers = sorted(row.answers, key=lambda a: a.created_at)
    return SessionDetailResponse(
        id=row.id,
        test_id=row.test_id,
        unique_slug=row.unique_slug,
        client_name=row.client_name,
        client_email=row.client_email,
        client_phone=row.client_phone,
        status=row.status,
        created_at=row.created_at,
        completed_at=row.completed_at,
        questions_snapshot=row.questions_snapshot,
        answers=[
            SessionAnswerOut(question_id=a.question_id, answer_value=a.answer_value, created_at=a.created_at)
            for a in answers
        ],
    )
