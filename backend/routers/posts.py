"""Admin posts router — list, detail, accept, reject, regenerate.

Guarded by `require_api_key` at the router level: every route requires the
shared `Authorization: Bearer <secret>` header forwarded by the Next.js proxy.
"""
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload

from database import get_db
from dependencies import require_api_key
from models import Post, Source
from schemas.posts import (
    AcceptRequest,
    PostListResponse,
    PostOut,
    PostStatus,
    RegenerateRequest,
    RescheduleRequest,
)
from services.blog_writer import FORMAT_SPECS, generate_post
from services.news_fetcher import Article
from services.pipeline import overwrite_generated_post

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
    dependencies=[Depends(require_api_key)],
)


def _load_post_or_404(db: Session, post_id: uuid.UUID) -> Post:
    post = (
        db.query(Post)
        .options(selectinload(Post.sources))
        .filter(Post.id == post_id)
        .one_or_none()
    )
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="post not found")
    return post


def _require_status(post: Post, expected: str) -> None:
    if post.status != expected:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"post not in {expected} (current={post.status})",
        )


def _require_pending_review(post: Post) -> None:
    _require_status(post, "pending_review")


@router.get("", response_model=PostListResponse)
def list_posts(
    status_filter: PostStatus | None = Query(default=None, alias="status"),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> PostListResponse:
    query = db.query(Post)
    if status_filter is not None:
        query = query.filter(Post.status == status_filter)

    total = query.count()
    items = (
        query.order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return PostListResponse(items=items, total=total)


@router.get("/{post_id}", response_model=PostOut)
def get_post(post_id: uuid.UUID, db: Session = Depends(get_db)) -> Post:
    return _load_post_or_404(db, post_id)


@router.post("/{post_id}/accept", response_model=PostOut)
def accept_post(
    post_id: uuid.UUID,
    body: AcceptRequest | None = None,
    db: Session = Depends(get_db),
) -> Post:
    body = body or AcceptRequest()
    post = _load_post_or_404(db, post_id)
    _require_pending_review(post)

    if body.scheduled_at is None:
        post.status = "published"
        post.published_at = datetime.now(timezone.utc)
        post.scheduled_at = None
    else:
        post.status = "accepted"
        post.scheduled_at = body.scheduled_at
        post.published_at = None

    db.commit()
    db.refresh(post)
    logger.info("post accepted: id=%s status=%s", post.id, post.status)
    return post


@router.post("/{post_id}/reject", response_model=PostOut)
def reject_post(post_id: uuid.UUID, db: Session = Depends(get_db)) -> Post:
    post = _load_post_or_404(db, post_id)
    _require_pending_review(post)

    post.status = "rejected"
    db.commit()
    db.refresh(post)
    logger.info("post rejected: id=%s", post.id)
    return post


@router.post("/{post_id}/regenerate", response_model=PostOut)
def regenerate_post(
    post_id: uuid.UUID,
    body: RegenerateRequest | None = None,
    db: Session = Depends(get_db),
) -> Post:
    body = body or RegenerateRequest()
    post = _load_post_or_404(db, post_id)
    _require_pending_review(post)

    # Reconstruct Articles from this post's persisted sources for the
    # re-generation call. Carry the post's section so the regenerated post
    # stays in the same category as the original.
    section = post.section or ""
    articles = [
        Article(
            title=src.title,
            url=src.url,
            publisher=src.publisher,
            published_date=src.published_date,
            snippet="",
            section=section,
        )
        for src in post.sources
    ]

    # Keep the original format when it's one we can regenerate; else default.
    fmt = post.format if post.format in FORMAT_SPECS else "Deep Dive"
    generated = generate_post(articles, format=fmt, feedback=body.feedback)
    overwrite_generated_post(db, post, generated)
    post.generation_attempt += 1

    db.commit()
    db.refresh(post)
    logger.info(
        "post regenerated: id=%s attempt=%d feedback=%s",
        post.id,
        post.generation_attempt,
        bool(body.feedback and body.feedback.strip()),
    )
    return post


@router.post("/{post_id}/reschedule", response_model=PostOut)
def reschedule_post(
    post_id: uuid.UUID,
    body: RescheduleRequest,
    db: Session = Depends(get_db),
) -> Post:
    post = _load_post_or_404(db, post_id)
    _require_status(post, "accepted")

    post.scheduled_at = body.scheduled_at
    db.commit()
    db.refresh(post)
    logger.info("post rescheduled: id=%s scheduled_at=%s", post.id, post.scheduled_at)
    return post


@router.post("/{post_id}/unschedule", response_model=PostOut)
def unschedule_post(post_id: uuid.UUID, db: Session = Depends(get_db)) -> Post:
    post = _load_post_or_404(db, post_id)
    _require_status(post, "accepted")

    post.status = "pending_review"
    post.scheduled_at = None
    db.commit()
    db.refresh(post)
    logger.info("post unscheduled: id=%s", post.id)
    return post


@router.post("/{post_id}/publish", response_model=PostOut)
def publish_post(post_id: uuid.UUID, db: Session = Depends(get_db)) -> Post:
    post = _load_post_or_404(db, post_id)
    _require_status(post, "accepted")

    post.status = "published"
    post.published_at = datetime.now(timezone.utc)
    post.scheduled_at = None
    db.commit()
    db.refresh(post)
    logger.info("post published: id=%s", post.id)
    return post
