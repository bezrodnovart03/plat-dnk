from typing import Any, Optional
from uuid import UUID


def _qid(raw: Any) -> UUID:
    return UUID(str(raw))


def snapshot_questions(snapshot: Optional[dict]) -> list[dict]:
    if not snapshot:
        return []
    return list(snapshot.get("questions") or [])


def ordered_questions(snapshot: Optional[dict]) -> list[dict]:
    qs = snapshot_questions(snapshot)
    return sorted(qs, key=lambda q: q.get("order_index", 0))


def progress_percent(snapshot: Optional[dict], answered_ids: set[UUID]) -> int:
    qs = snapshot_questions(snapshot)
    if not qs:
        return 100
    done = sum(1 for q in qs if _qid(q["id"]) in answered_ids)
    return int(done * 100 / len(qs))


def next_unanswered_question(snapshot: Optional[dict], answered_ids: set[UUID]) -> Optional[dict]:
    for q in ordered_questions(snapshot):
        if _qid(q["id"]) not in answered_ids:
            return q
    return None


def all_required_answered(snapshot: Optional[dict], answered_ids: set[UUID]) -> bool:
    for q in snapshot_questions(snapshot):
        if not q.get("required", True):
            continue
        if _qid(q["id"]) not in answered_ids:
            return False
    return True


def find_question(snapshot: Optional[dict], question_id: UUID) -> Optional[dict]:
    for q in snapshot_questions(snapshot):
        if _qid(q["id"]) == question_id:
            return q
    return None
