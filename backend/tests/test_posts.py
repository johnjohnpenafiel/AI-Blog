"""Tests for /posts admin endpoints.

The `db` fixture (conftest.py) wraps each test in a connection-level
transaction; endpoint commits release a SAVEPOINT but the outer
transaction is rolled back at teardown.

`generate_post` is patched at the name imported INTO `routers.posts`.
"""
from collections.abc import Generator
from datetime import date, datetime, timedelta, timezone
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from database import get_db
from main import app
from models import Post, Source
from schemas.blog_writer import GeneratedPost, GeneratedSource


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def _seed_pending_post(
    db: Session,
    *,
    slug: str = "pending-post",
    title: str = "Pending Post",
    publishing_mode: str = "approve_only",
) -> Post:
    post = Post(
        slug=slug,
        title=title,
        content="# Body\n\nOriginal content.",
        summary="Original summary.",
        meta_description="Original meta description.",
        tags=["Voice AI", "CRM"],
        publishing_mode=publishing_mode,
        status="pending_review",
        generation_attempt=1,
    )
    db.add(post)
    db.flush()
    for i in range(2):
        db.add(
            Source(
                post_id=post.id,
                title=f"Original Source {i}",
                url=f"https://example.com/orig-{i}",
                publisher="example.com",
                published_date=date(2026, 5, 10),
            )
        )
    db.flush()
    db.refresh(post)
    return post


def _seed_accepted_post(
    db: Session,
    *,
    slug: str = "accepted-post",
    title: str = "Accepted Post",
    scheduled_at: datetime | None = None,
) -> Post:
    if scheduled_at is None:
        scheduled_at = datetime.now(timezone.utc) + timedelta(days=2)
    post = Post(
        slug=slug,
        title=title,
        content="# Body\n\nAccepted content.",
        summary="Accepted summary.",
        meta_description="Accepted meta description.",
        tags=["Voice AI", "CRM"],
        publishing_mode="approve_only",
        status="accepted",
        scheduled_at=scheduled_at,
        generation_attempt=1,
    )
    db.add(post)
    db.flush()
    db.refresh(post)
    return post


def _generated_revision(slug: str = "regenerated-slug") -> GeneratedPost:
    return GeneratedPost(
        title="Regenerated Title",
        slug=slug,
        summary="Regenerated summary.",
        meta_description="Regenerated meta.",
        body="# Regen\n\nNew body content.",
        tags=["Voice AI", "Sales Dev"],
        sources=[
            GeneratedSource(
                title=f"Regen Source {i}",
                url=f"https://example.com/regen-{i}",
                publisher="example.com",
                published_date=date(2026, 5, 12),
            )
            for i in range(3)
        ],
    )


# ---- GET /posts ----------------------------------------------------------


def test_list_posts_filters_by_status_and_returns_total(
    client: TestClient, db: Session
) -> None:
    _seed_pending_post(db, slug="pending-a")
    _seed_pending_post(db, slug="pending-b")
    # A non-pending post should not be returned by the filter
    other = Post(
        slug="published-x",
        title="Pub",
        content="x",
        summary="x",
        meta_description="x",
        tags=["CRM"],
        publishing_mode="auto",
        status="published",
    )
    db.add(other)
    db.flush()

    response = client.get("/posts", params={"status": "pending_review"})
    assert response.status_code == 200
    body = response.json()
    # Defensive against pre-existing dev-DB rows: assert ours are present
    # and the published row is filtered out.
    assert body["total"] >= 2
    slugs = {item["slug"] for item in body["items"]}
    assert {"pending-a", "pending-b"}.issubset(slugs)
    assert "published-x" not in slugs


def test_list_posts_returns_all_when_no_filter(
    client: TestClient, db: Session
) -> None:
    _seed_pending_post(db, slug="any-1")
    response = client.get("/posts")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] >= 1


# ---- GET /posts/{id} -----------------------------------------------------


def test_get_post_returns_full_detail_with_sources(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="detail-test")

    response = client.get(f"/posts/{post.id}")
    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "detail-test"
    assert body["content"].startswith("# Body")
    assert len(body["sources"]) == 2
    assert {s["title"] for s in body["sources"]} == {
        "Original Source 0",
        "Original Source 1",
    }


def test_get_post_returns_404_when_missing(client: TestClient) -> None:
    response = client.get("/posts/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


# ---- POST /posts/{id}/accept --------------------------------------------


def test_accept_publish_now_flips_to_published(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="accept-now")

    response = client.post(f"/posts/{post.id}/accept", json={})
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "published"
    assert body["published_at"] is not None
    assert body["scheduled_at"] is None

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "published"
    assert fresh.published_at is not None


def test_accept_with_future_schedule_flips_to_accepted(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="accept-scheduled")
    future = datetime.now(timezone.utc) + timedelta(days=2)

    response = client.post(
        f"/posts/{post.id}/accept", json={"scheduled_at": future.isoformat()}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "accepted"
    assert body["scheduled_at"] is not None
    assert body["published_at"] is None


def test_accept_with_past_schedule_returns_422(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="accept-past")
    past = datetime.now(timezone.utc) - timedelta(days=1)

    response = client.post(
        f"/posts/{post.id}/accept", json={"scheduled_at": past.isoformat()}
    )
    assert response.status_code == 422


def test_accept_with_naive_schedule_returns_422(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="accept-naive")

    response = client.post(
        f"/posts/{post.id}/accept",
        json={"scheduled_at": "2030-01-01T08:00:00"},
    )
    assert response.status_code == 422


def test_accept_on_non_pending_returns_409(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="accept-conflict")
    post.status = "rejected"
    db.flush()

    response = client.post(f"/posts/{post.id}/accept", json={})
    assert response.status_code == 409


# ---- POST /posts/{id}/reject --------------------------------------------


def test_reject_flips_to_rejected(client: TestClient, db: Session) -> None:
    post = _seed_pending_post(db, slug="reject-1")

    response = client.post(f"/posts/{post.id}/reject")
    assert response.status_code == 200
    assert response.json()["status"] == "rejected"

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "rejected"


def test_reject_on_non_pending_returns_409(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="reject-conflict")
    post.status = "published"
    db.flush()

    response = client.post(f"/posts/{post.id}/reject")
    assert response.status_code == 409


# ---- POST /posts/{id}/regenerate ----------------------------------------


def test_regenerate_overwrites_content_and_bumps_attempt(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="regen-original")
    post_id = post.id

    with patch(
        "routers.posts.generate_post",
        return_value=_generated_revision(slug="regen-new"),
    ) as mock_gen:
        response = client.post(f"/posts/{post_id}/regenerate", json={})

    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "regen-new"
    assert body["title"] == "Regenerated Title"
    assert body["status"] == "pending_review"
    assert body["generation_attempt"] == 2
    assert len(body["sources"]) == 3
    assert {s["title"] for s in body["sources"]} == {
        "Regen Source 0",
        "Regen Source 1",
        "Regen Source 2",
    }

    # generate_post should have been called with feedback=None
    _, kwargs = mock_gen.call_args
    assert kwargs.get("feedback") is None

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post_id).one()
    assert fresh.slug == "regen-new"
    assert fresh.generation_attempt == 2
    fresh_sources = db.query(Source).filter(Source.post_id == post_id).all()
    assert len(fresh_sources) == 3


def test_regenerate_passes_feedback_to_generator(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="regen-feedback")

    with patch(
        "routers.posts.generate_post",
        return_value=_generated_revision(slug="regen-feedback-new"),
    ) as mock_gen:
        response = client.post(
            f"/posts/{post.id}/regenerate",
            json={"feedback": "make it shorter and punchier"},
        )

    assert response.status_code == 200
    _, kwargs = mock_gen.call_args
    assert kwargs.get("feedback") == "make it shorter and punchier"


def test_regenerate_on_non_pending_returns_409(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="regen-conflict")
    post.status = "accepted"
    db.flush()

    response = client.post(f"/posts/{post.id}/regenerate", json={})
    assert response.status_code == 409


# ---- POST /posts/{id}/reschedule ----------------------------------------


def test_reschedule_updates_scheduled_at(
    client: TestClient, db: Session
) -> None:
    post = _seed_accepted_post(db, slug="reschedule-1")
    new_time = datetime.now(timezone.utc) + timedelta(days=5)

    response = client.post(
        f"/posts/{post.id}/reschedule",
        json={"scheduled_at": new_time.isoformat()},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "accepted"
    assert body["scheduled_at"] is not None

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "accepted"
    assert fresh.scheduled_at is not None
    # Tolerate microsecond/format round-trip; compare to the second.
    assert abs((fresh.scheduled_at - new_time).total_seconds()) < 1


def test_reschedule_rejects_past_datetime(
    client: TestClient, db: Session
) -> None:
    post = _seed_accepted_post(db, slug="reschedule-past")
    past = datetime.now(timezone.utc) - timedelta(days=1)

    response = client.post(
        f"/posts/{post.id}/reschedule",
        json={"scheduled_at": past.isoformat()},
    )
    assert response.status_code == 422


def test_reschedule_rejects_naive_datetime(
    client: TestClient, db: Session
) -> None:
    post = _seed_accepted_post(db, slug="reschedule-naive")

    response = client.post(
        f"/posts/{post.id}/reschedule",
        json={"scheduled_at": "2030-01-01T08:00:00"},
    )
    assert response.status_code == 422


def test_reschedule_on_pending_returns_409(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="reschedule-conflict")
    future = datetime.now(timezone.utc) + timedelta(days=1)

    response = client.post(
        f"/posts/{post.id}/reschedule",
        json={"scheduled_at": future.isoformat()},
    )
    assert response.status_code == 409


# ---- POST /posts/{id}/unschedule ----------------------------------------


def test_unschedule_flips_to_pending_review(
    client: TestClient, db: Session
) -> None:
    post = _seed_accepted_post(db, slug="unschedule-1")

    response = client.post(f"/posts/{post.id}/unschedule")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "pending_review"
    assert body["scheduled_at"] is None

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "pending_review"
    assert fresh.scheduled_at is None


def test_unschedule_on_pending_returns_409(
    client: TestClient, db: Session
) -> None:
    post = _seed_pending_post(db, slug="unschedule-pending")

    response = client.post(f"/posts/{post.id}/unschedule")
    assert response.status_code == 409


def test_unschedule_on_published_returns_409(
    client: TestClient, db: Session
) -> None:
    post = _seed_accepted_post(db, slug="unschedule-published")
    post.status = "published"
    db.flush()

    response = client.post(f"/posts/{post.id}/unschedule")
    assert response.status_code == 409


# ---- POST /posts/{id}/publish -------------------------------------------


def test_publish_flips_accepted_to_published(
    client: TestClient, db: Session
) -> None:
    post = _seed_accepted_post(db, slug="publish-1")

    response = client.post(f"/posts/{post.id}/publish")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "published"
    assert body["published_at"] is not None
    assert body["scheduled_at"] is None

    db.expire_all()
    fresh = db.query(Post).filter(Post.id == post.id).one()
    assert fresh.status == "published"
    assert fresh.published_at is not None
    assert fresh.scheduled_at is None


def test_publish_on_pending_returns_409(client: TestClient, db: Session) -> None:
    post = _seed_pending_post(db, slug="publish-pending")

    response = client.post(f"/posts/{post.id}/publish")
    assert response.status_code == 409


def test_publish_on_already_published_returns_409(
    client: TestClient, db: Session
) -> None:
    post = _seed_accepted_post(db, slug="publish-twice")
    post.status = "published"
    db.flush()

    response = client.post(f"/posts/{post.id}/publish")
    assert response.status_code == 409
