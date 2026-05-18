"""Tests for `services.publisher.publish_due_posts`.

The function does a single bulk UPDATE filtered on `status='accepted' AND
scheduled_at <= now()`. We seed posts in various states + scheduled times
and verify only the eligible rows flip. `db` fixture (conftest.py) wraps
each test in a transaction that rolls back at teardown.
"""
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import Post
from services.publisher import publish_due_posts


def _make_post(
    db: Session,
    *,
    slug: str,
    status: str,
    scheduled_at: datetime | None = None,
    published_at: datetime | None = None,
) -> Post:
    post = Post(
        slug=slug,
        title=f"Post {slug}",
        content="# Body",
        summary="Summary.",
        meta_description="Meta.",
        tags=["Voice AI"],
        publishing_mode="approve_only",
        status=status,
        scheduled_at=scheduled_at,
        published_at=published_at,
        generation_attempt=1,
    )
    db.add(post)
    db.flush()
    db.refresh(post)
    return post


def test_publishes_due_post(db: Session) -> None:
    past = datetime.now(timezone.utc) - timedelta(minutes=1)
    post = _make_post(db, slug="due-1", status="accepted", scheduled_at=past)

    count = publish_due_posts(db)
    assert count == 1

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "published"
    assert fresh.published_at is not None
    assert fresh.scheduled_at is None


def test_skips_future_post(db: Session) -> None:
    future = datetime.now(timezone.utc) + timedelta(hours=1)
    post = _make_post(db, slug="future-1", status="accepted", scheduled_at=future)

    count = publish_due_posts(db)
    assert count == 0

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "accepted"
    assert fresh.scheduled_at is not None
    assert fresh.published_at is None


def test_skips_pending_review_post(db: Session) -> None:
    past = datetime.now(timezone.utc) - timedelta(minutes=5)
    post = _make_post(
        db, slug="pending-1", status="pending_review", scheduled_at=past
    )

    count = publish_due_posts(db)
    assert count == 0

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "pending_review"


def test_skips_already_published_post(db: Session) -> None:
    earlier = datetime.now(timezone.utc) - timedelta(hours=1)
    post = _make_post(
        db,
        slug="pub-1",
        status="published",
        scheduled_at=None,
        published_at=earlier,
    )

    count = publish_due_posts(db)
    assert count == 0

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "published"
    assert fresh.published_at == earlier  # untouched


def test_publishes_multiple_due_in_one_call(db: Session) -> None:
    past_1 = datetime.now(timezone.utc) - timedelta(minutes=1)
    past_2 = datetime.now(timezone.utc) - timedelta(minutes=10)
    past_3 = datetime.now(timezone.utc) - timedelta(hours=1)
    _make_post(db, slug="due-a", status="accepted", scheduled_at=past_1)
    _make_post(db, slug="due-b", status="accepted", scheduled_at=past_2)
    _make_post(db, slug="due-c", status="accepted", scheduled_at=past_3)

    count = publish_due_posts(db)
    assert count >= 3  # at least our 3; dev DB may have other due posts

    db.expire_all()
    ours = (
        db.query(Post)
        .filter(Post.slug.in_(("due-a", "due-b", "due-c")))
        .all()
    )
    assert {p.slug: p.status for p in ours} == {
        "due-a": "published",
        "due-b": "published",
        "due-c": "published",
    }


def test_second_call_after_publish_is_noop(db: Session) -> None:
    """Models the race: first caller (worker OR manual /publish) wins; second
    caller's UPDATE matches 0 rows because the status filter no longer hits."""
    past = datetime.now(timezone.utc) - timedelta(minutes=1)
    _make_post(db, slug="race-1", status="accepted", scheduled_at=past)

    first = publish_due_posts(db)
    second = publish_due_posts(db)
    assert first == 1
    assert second == 0
