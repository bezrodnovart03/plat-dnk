from typing import Any, Optional

from fastapi import HTTPException


def validate_answer(question_type: str, metadata: Optional[dict], answer_value: Any) -> Any:
    meta = metadata or {}

    if question_type == "text":
        if not isinstance(answer_value, str) or not answer_value.strip():
            raise HTTPException(status_code=400, detail="Текстовый ответ не может быть пустым")
        return answer_value.strip()

    if question_type == "scale":
        mn = int(meta.get("scale_min", 1))
        mx = int(meta.get("scale_max", 5))
        try:
            v = int(answer_value)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Для шкалы нужно целое число")
        if v < mn or v > mx:
            raise HTTPException(
                status_code=400,
                detail=f"Значение шкалы должно быть от {mn} до {mx}",
            )
        return v

    if question_type == "single_choice":
        opts = meta.get("options")
        if not isinstance(opts, list) or not opts:
            raise HTTPException(status_code=500, detail="Вопрос без вариантов ответа")
        if answer_value not in opts:
            raise HTTPException(status_code=400, detail="Недопустимый вариант ответа")
        return answer_value

    raise HTTPException(status_code=400, detail=f"Неизвестный тип вопроса: {question_type}")
