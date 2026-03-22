from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import logging

from app.database import get_db
from app.dependencies import get_current_psychologist_id
from app.generators.docx_generator import DocxReportGenerator
from app.clients.session_client import session_client
from app.clients.auth_client import auth_client 
from app.config import settings

router = APIRouter(prefix="/public/sessions", tags=["public-sessions"])
logger = logging.getLogger(__name__)

# Выбираем email сервис (в зависимости от настроек)
if settings.SMTP_USER and settings.SMTP_PASSWORD:
    email_service = EmailService(
        smtp_host=settings.SMTP_HOST,
        smtp_port=settings.SMTP_PORT,
        smtp_user=settings.SMTP_USER,
        smtp_password=settings.SMTP_PASSWORD
    )
else:
    logger.warning("Using mock email service (no SMTP credentials)")
    email_service = MockEmailService()

@router.get("/session/{session_id}/professional")
async def download_professional_report(
    session_id: UUID,
    request: Request,
    psychologist_id: UUID = Depends(get_current_psychologist_id),
    db: AsyncSession = Depends(get_db),
):
    token = request.headers.get("Authorization", "").strip()
    if not token.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing authorization token")

    auth_header = token
    x_user_id = str(psychologist_id)

    # 1. Получаем детали сессии из session-service
    session_json = await session_client.get_session_detail(session_id, auth_header, x_user_id)
    if not session_json:
        raise HTTPException(status_code=404, detail="Session not found")

    if session_json["test_id"] is None:
        raise HTTPException(status_code=500, detail="Session has no test_id")

    test_id = UUID(str(session_json["test_id"]))

    # 2. Получаем тест (с вопросами) из test-service (локально через crud или через HTTP)
    # Здесь у тебя уже есть TestCRUD и QuestionCRUD, можно собрать dict локально:
    from app import crud as test_crud

    test = await test_crud.TestCRUD.get_by_id(db, test_id, psychologist_id)
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    questions = await test_crud.QuestionCRUD.get_by_test(db, test_id)
    test_data = {
        "id": str(test.id),
        "title": test.title,
        "description": test.description,
        "questions": [
            {
                "id": str(q.id),
                "order_index": q.order_index,
                "type": q.type,
                "text": q.text,
                "required": q.required,
                "metadata": q.question_metadata,
            }
            for q in questions
        ],
    }

    # 3. Собираем ответы
    answers_data = []
    answers_map = {UUID(str(a["question_id"])): a for a in session_json["answers"]}
    for q in questions:
        a = answers_map.get(q.id)
        if not a:
            continue
        answers_data.append(
            {
                "order_index": q.order_index,
                "question_text": q.text,
                "answer_value": a["answer_value"],
            }
        )

    # 4. Психолог (для шапки отчёта)
    psychologist = await auth_client.get_psychologist_by_id(psychologist_id, auth_header)
    if not psychologist:
        psychologist = {"full_name": "Психолог", "email": ""}

    # 5. Генерация DOCX
    try:
        report_buffer = await DocxReportGenerator.generate_report(
            test=test_data,
            session=session_json,
            answers=answers_data,
            psychologist=psychologist,
        )
    except Exception as e:
        logger.error(f"Failed to generate report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")

    filename = f"report_{session_json.get('client_name','client')}_{test.title}.docx"

    return StreamingResponse(
        report_buffer,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

@router.post("/session/{session_id}/send-to-psychologist")
async def send_report_to_psychologist(
    session_id: UUID,
    request: Request,
    psychologist_id: UUID = Depends(get_current_psychologist_id),
    db: AsyncSession = Depends(get_db)
):
    """
    Сгенерировать отчёт и отправить на email психолога.

    Контракт без доработок auth-service (на стороне шлюза / клиента):
    - Authorization: Bearer … (как сейчас через gateway)
    - X-User-Id — id психолога (проставляет gateway)
    - X-User-Email — email получателя (если шлюз или клиент могут передать профиль без вызова auth)

    Если заголовка с email нет, делается попытка GET {AUTH_SERVICE_URL}/auth/me с тем же токеном
    (работает только если такой эндпоинт уже есть у команды auth — не ваша зона ответственности).
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token")

    psychologist_email = (request.headers.get("X-User-Email") or "").strip() or None
    psychologist_name = (request.headers.get("X-User-Full-Name") or "").strip() or None

    if not psychologist_email:
        psychologist = await auth_client.get_psychologist_by_id(psychologist_id, token)
        if not psychologist:
            raise HTTPException(
                status_code=502,
                detail=(
                    "Не удалось получить email психолога: передайте заголовок X-User-Email "
                    "или обеспечьте доступность профиля по токену (например GET /auth/me на auth-service)."
                ),
            )
        psychologist_email = psychologist.get("email")
        psychologist_name = psychologist.get("full_name") or psychologist_name

    if not psychologist_email:
        raise HTTPException(status_code=400, detail="Psychologist has no email")
    if not psychologist_name:
        psychologist_name = "Психолог"
    
    # Здесь нужно получить данные сессии и ответы из session-service
    # Пока используем заглушку для тестирования
    
    # Временные данные для тестирования
    test_data = {
        "title": "Тест Голланда",
        "description": "Тест для определения профессиональных интересов"
    }
    
    session_data = {
        "id": session_id,
        "client_name": "Иван Петров",
        "client_email": "ivan@example.com",
        "client_phone": "+7 (999) 123-45-67",
        "status": "completed",
        "completed_at": "2024-03-21T10:30:00"
    }
    
    answers_data = [
        {
            "order_index": 0,
            "question_text": "Что вам больше нравится?",
            "answer_value": "Работа с людьми"
        },
        {
            "order_index": 1,
            "question_text": "Оцените ваше отношение к математике",
            "answer_value": 4
        },
        {
            "order_index": 2,
            "question_text": "Опишите ваши профессиональные цели",
            "answer_value": "Хочу помогать людям в выборе профессии"
        }
    ]
    
    # 2. Генерируем отчет
    try:
        report_buffer = await DocxReportGenerator.generate_report(
            test=test_data,
            session=session_data,
            answers=answers_data,
            psychologist={
                "full_name": psychologist_name,
                "email": psychologist_email,
            }
        )
    except Exception as e:
        logger.error(f"Failed to generate report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate report")
    
    # 3. Отправляем email
    success = await email_service.send_report(
        to_email=psychologist_email,
        client_name=session_data["client_name"],
        test_title=test_data["title"],
        report_buffer=report_buffer,
        report_format="docx"
    )
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to send email")
    
    return {
        "message": f"Report sent to {psychologist_email}",
        "psychologist_email": psychologist_email,
        "session_id": str(session_id),
        "client_name": session_data["client_name"],
        "test_title": test_data["title"]
    }

@router.get("/test")
async def test_report_generation():
    """Тестовый эндпоинт для проверки генерации отчета без отправки email."""
    if not settings.DEBUG:
        raise HTTPException(status_code=404, detail="Not found")
    # Тестовые данные
    test_data = {
        "title": "Тест Голланда",
        "description": "Тест для определения профессиональных интересов"
    }
    
    session_data = {
        "id": "test-session-123",
        "client_name": "Тестовый Клиент",
        "client_email": "test@example.com",
        "client_phone": "+7 (999) 123-45-67",
        "status": "completed",
        "completed_at": "2024-03-21T10:30:00"
    }
    
    answers_data = [
        {
            "order_index": 0,
            "question_text": "Что вам больше нравится?",
            "answer_value": "Работа с людьми"
        },
        {
            "order_index": 1,
            "question_text": "Оцените ваше отношение к математике",
            "answer_value": 4
        }
    ]
    
    psychologist_data = {
        "full_name": "Тестовый Психолог",
        "email": "psychologist@example.com"
    }
    
    try:
        report_buffer = await DocxReportGenerator.generate_report(
            test=test_data,
            session=session_data,
            answers=answers_data,
            psychologist=psychologist_data
        )
        
        # Сохраняем файл локально
        filename = "test_report.docx"
        with open(filename, "wb") as f:
            f.write(report_buffer.getvalue())
        
        return {
            "message": f"Test report generated and saved as {filename}",
            "file": filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate test report: {str(e)}")