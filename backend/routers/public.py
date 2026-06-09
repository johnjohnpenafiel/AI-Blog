"""Public-facing router — no auth, only `published` posts.

Separate from `routers/posts.py` (admin) so the public surface can never
accidentally leak draft, pending, accepted, or rejected content.
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import Post
from schemas.public import PublicPostDetail, PublicPostListItem, PublicPostListResponse, PublicPostSource

router = APIRouter(prefix="/public", tags=["public"])


# Rough industry-standard reading speed for online article content.
# Used to derive a `read_time_minutes` from the markdown body.
_WORDS_PER_MINUTE = 200


def _read_time_minutes(content: str) -> int:
    words = len(content.split())
    return max(1, round(words / _WORDS_PER_MINUTE))


def _to_list_item(post: Post) -> PublicPostListItem:
    # published_at is non-null for `published` posts (enforced at write time
    # in routers/posts.py and services/publisher.py). The endpoint filters
    # by status="published" so we can treat it as required here.
    assert post.published_at is not None
    return PublicPostListItem(
        id=post.id,
        slug=post.slug,
        title=post.title,
        summary=post.summary,
        tags=list(post.tags),
        section=post.section,
        format=post.format,
        published_at=post.published_at,
        read_time_minutes=_read_time_minutes(post.content),
    )


@router.get("/posts", response_model=PublicPostListResponse)
def list_public_posts(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: Session = Depends(get_db),
) -> PublicPostListResponse:
    query = db.query(Post).filter(Post.status == "published")
    total = query.count()
    posts = (
        query.order_by(Post.published_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return PublicPostListResponse(
        items=[_to_list_item(p) for p in posts],
        total=total,
    )


@router.get("/posts/{slug}", response_model=PublicPostDetail)
def get_public_post(slug: str, db: Session = Depends(get_db)) -> PublicPostDetail:
    post = (
        db.query(Post)
        .options(selectinload(Post.sources))
        .filter(Post.status == "published", Post.slug == slug)
        .one_or_none()
    )
    if post is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="post not found")

    assert post.published_at is not None
    return PublicPostDetail(
        id=post.id,
        slug=post.slug,
        title=post.title,
        summary=post.summary,
        meta_description=post.meta_description,
        content=post.content,
        tags=list(post.tags),
        section=post.section,
        format=post.format,
        published_at=post.published_at,
        read_time_minutes=_read_time_minutes(post.content),
        sources=[
            PublicPostSource(
                title=src.title,
                url=src.url,
                publisher=src.publisher,
                published_date=src.published_date,
            )
            for src in post.sources
        ],
    )
