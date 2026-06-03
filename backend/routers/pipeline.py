from typing import Union

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_api_key
from models import Setting
from schemas.pipeline import (
    PipelineRunRequest,
    PipelineRunSkipped,
    PipelineRunSuccess,
    PipelineStatusResponse,
)
from services.pipeline import (
    PipelineSkipResult,
    PipelineSuccessResult,
    run_pipeline,
)

router = APIRouter(
    prefix="/pipeline",
    tags=["pipeline"],
    dependencies=[Depends(require_api_key)],
)

# Bare module-level flag is intentional: single admin + cron, race window
# is implausible. A threading.Lock wouldn't help under multi-worker either
# — if we ever scale workers, swap this for a DB advisory lock.
_state: dict[str, str] = {"value": "idle"}


@router.post(
    "/run",
    response_model=Union[PipelineRunSuccess, PipelineRunSkipped],
)
def trigger_pipeline_run(
    body: PipelineRunRequest | None = None,
    db: Session = Depends(get_db),
) -> PipelineRunSuccess | PipelineRunSkipped:
    if _state["value"] == "running":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="pipeline already running",
        )
    fmt = (body or PipelineRunRequest()).format
    _state["value"] = "running"
    try:
        result = run_pipeline(db, format=fmt)
    finally:
        _state["value"] = "idle"

    if isinstance(result, PipelineSkipResult):
        return PipelineRunSkipped(
            reason=result.reason,
            article_count=result.article_count,
        )

    assert isinstance(result, PipelineSuccessResult)
    post = result.post
    return PipelineRunSuccess(
        post_id=post.id,
        slug=post.slug,
        status=post.status,
        publishing_mode=post.publishing_mode,
        published_at=post.published_at,
    )


@router.get("/status", response_model=PipelineStatusResponse)
def get_pipeline_status(db: Session = Depends(get_db)) -> PipelineStatusResponse:
    settings = db.query(Setting).filter(Setting.id == 1).one()
    return PipelineStatusResponse(
        last_run_at=settings.last_run_at,
        next_run_at=settings.next_run_at,
        state=_state["value"],
    )
