"""Tests for the public /public/posts endpoint.

The `db` fixture (conftest.py) wraps each test in a connection-level
transaction; endpoint commits release a SAVEPOINT but the outer
transaction is rolled back at teardown.
"""
from collections.abc import Generator
from datetime import datetime, timedelta, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from database import get_db
from main import app
from models import Post


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def _seed_post(
    db: Session,
    *,
    slug: str,
    title: str = "Post Title",
    status: str = "published",
    published_at: datetime | None = None,
    content: str = "body",
    tags: list[str] | None = None,
    section: str | None = "Customer Experience",
) -> Post:
    post = Post(
        slug=slug,
        title=title,
        content=content,
        summary="Summary.",
        meta_description="Meta.",
        tags=tags or ["Voice AI"],
        section=section,
        publishing_mode="auto",
        status=status,
        published_at=published_at,
        generation_attempt=1,
    )
    db.add(post)
    db.flush()
    db.refresh(post)
    return post


def test_list_public_posts_returns_only_published(
    client: TestClient, db: Session
) -> None:
    now = datetime.now(timezone.utc)
    _seed_post(db, slug="pub-a", status="published", published_at=now)
    _seed_post(db, slug="draft-a", status="draft")
    _seed_post(db, slug="pending-a", status="pending_review")
    _seed_post(
        db,
        slug="accepted-a",
        status="accepted",
        published_at=None,
    )
    _seed_post(db, slug="rejected-a", status="rejected")

    response = client.get("/public/posts")
    assert response.status_code == 200
    body = response.json()
    slugs = {item["slug"] for item in body["items"]}
    assert "pub-a" in slugs
    assert {"draft-a", "pending-a", "accepted-a", "rejected-a"}.isdisjoint(slugs)
    # The public list exposes section (the browse axis for the index filter).
    pub_a = next(item for item in body["items"] if item["slug"] == "pub-a")
    assert pub_a["section"] == "Customer Experience"


def test_list_public_posts_orders_by_published_at_desc(
    client: TestClient, db: Session
) -> None:
    now = datetime.now(timezone.utc)
    _seed_post(db, slug="older", published_at=now - timedelta(days=3))
    _seed_post(db, slug="newest", published_at=now)
    _seed_post(db, slug="middle", published_at=now - timedelta(days=1))

    response = client.get("/public/posts")
    assert response.status_code == 200
    items = response.json()["items"]
    ordered_slugs = [item["slug"] for item in items if item["slug"] in {"older", "newest", "middle"}]
    assert ordered_slugs == ["newest", "middle", "older"]


def test_list_public_posts_computes_read_time(
    client: TestClient, db: Session
) -> None:
    # 400 words ≈ 2 minutes at 200 wpm
    long_content = "word " * 400
    short_content = "tiny"  # < 200 words → rounds to 1 minute (clamped)
    _seed_post(
        db,
        slug="long-read",
        published_at=datetime.now(timezone.utc),
        content=long_content,
    )
    _seed_post(
        db,
        slug="short-read",
        published_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        content=short_content,
    )

    response = client.get("/public/posts")
    assert response.status_code == 200
    by_slug = {item["slug"]: item for item in response.json()["items"]}
    assert by_slug["long-read"]["read_time_minutes"] == 2
    assert by_slug["short-read"]["read_time_minutes"] == 1


def test_list_public_posts_empty_when_no_published(
    client: TestClient, db: Session
) -> None:
    # Seed only non-published rows
    _seed_post(db, slug="only-draft", status="draft")
    _seed_post(db, slug="only-pending", status="pending_review")

    response = client.get("/public/posts")
    assert response.status_code == 200
    body = response.json()
    slugs = {item["slug"] for item in body["items"]}
    assert "only-draft" not in slugs
    assert "only-pending" not in slugs


def test_list_public_posts_response_shape(
    client: TestClient, db: Session
) -> None:
    _seed_post(
        db,
        slug="shape-check",
        title="Shape Check",
        tags=["CRM", "Voice AI"],
        published_at=datetime.now(timezone.utc),
    )

    response = client.get("/public/posts")
    assert response.status_code == 200
    body = response.json()
    assert "items" in body
    assert "total" in body
    item = next(i for i in body["items"] if i["slug"] == "shape-check")
    expected_keys = {
        "id",
        "slug",
        "title",
        "summary",
        "tags",
        "section",
        "format",
        "published_at",
        "read_time_minutes",
    }
    assert set(item.keys()) == expected_keys
    # Admin-only fields must not leak through
    assert "status" not in item
    assert "content" not in item
    assert "publishing_mode" not in item
    assert "meta_description" not in item
    assert "generation_attempt" not in item


def test_list_public_posts_respects_pagination(
    client: TestClient, db: Session
) -> None:
    now = datetime.now(timezone.utc)
    for i in range(5):
        _seed_post(
            db,
            slug=f"page-{i}",
            published_at=now - timedelta(minutes=i),
        )

    response = client.get("/public/posts", params={"limit": 2, "offset": 1})
    assert response.status_code == 200
    body = response.json()
    assert len(body["items"]) == 2
    # total counts ALL published rows (including any pre-existing dev rows),
    # so just assert our slice is a contiguous window of the seeded set.
    returned = [item["slug"] for item in body["items"] if item["slug"].startswith("page-")]
    assert returned == ["page-1", "page-2"]


# ---------------------------------------------------------------------------
# GET /public/posts/{slug}
# ---------------------------------------------------------------------------


def test_get_public_post_returns_detail(client: TestClient, db: Session) -> None:
    _seed_post(
        db,
        slug="detail-post",
        title="Detail Title",
        published_at=datetime.now(timezone.utc),
        content="word " * 300,
    )

    response = client.get("/public/posts/detail-post")
    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "detail-post"
    assert body["title"] == "Detail Title"
    assert "content" in body
    assert "meta_description" in body
    assert "sources" in body
    assert isinstance(body["sources"], list)
    assert body["read_time_minutes"] == 2  # 300 words ÷ 200 wpm


def test_get_public_post_404_for_missing_slug(client: TestClient, db: Session) -> None:
    response = client.get("/public/posts/does-not-exist")
    assert response.status_code == 404


def test_get_public_post_404_for_non_published(client: TestClient, db: Session) -> None:
    _seed_post(db, slug="draft-slug", status="draft")
    response = client.get("/public/posts/draft-slug")
    assert response.status_code == 404


def test_get_public_post_does_not_leak_admin_fields(
    client: TestClient, db: Session
) -> None:
    _seed_post(
        db,
        slug="no-leak",
        published_at=datetime.now(timezone.utc),
    )

    response = client.get("/public/posts/no-leak")
    assert response.status_code == 200
    body = response.json()
    assert "status" not in body
    assert "publishing_mode" not in body
    assert "generation_attempt" not in body
    assert "scheduled_at" not in body


# ---------------------------------------------------------------------------
# GET /public/posts/featured
# ---------------------------------------------------------------------------


def test_featured_returns_pin_regardless_of_recency(
    client: TestClient, db: Session
) -> None:
    now = datetime.now(timezone.utc)
    # Newest post is NOT pinned; an older post IS — the pin must still win.
    _seed_post(db, slug="newest-unpinned", published_at=now)
    old_pin = _seed_post(
        db, slug="old-pin", published_at=now - timedelta(days=30)
    )
    old_pin.is_featured = True
    db.flush()

    response = client.get("/public/posts/featured")
    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "old-pin"
    assert body["is_featured"] is True


def test_featured_falls_back_to_most_recent_when_no_pin(
    client: TestClient, db: Session
) -> None:
    now = datetime.now(timezone.utc)
    _seed_post(db, slug="fb-older", published_at=now - timedelta(days=2))
    _seed_post(db, slug="fb-newest", published_at=now)

    response = client.get("/public/posts/featured")
    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "fb-newest"
    # Flag tells the band this is a fallback, not a real editor's-choice pin.
    assert body["is_featured"] is False


def test_featured_returns_null_when_no_published(
    client: TestClient, db: Session
) -> None:
    _seed_post(db, slug="only-draft-feat", status="draft")

    response = client.get("/public/posts/featured")
    assert response.status_code == 200
    assert response.json() is None


def test_featured_response_shape(client: TestClient, db: Session) -> None:
    post = _seed_post(
        db, slug="feat-shape", published_at=datetime.now(timezone.utc)
    )
    post.is_featured = True
    db.flush()

    response = client.get("/public/posts/featured")
    assert response.status_code == 200
    body = response.json()
    expected_keys = {
        "id",
        "slug",
        "title",
        "summary",
        "tags",
        "section",
        "format",
        "published_at",
        "read_time_minutes",
        "is_featured",
    }
    assert set(body.keys()) == expected_keys
    # The featured endpoint must not leak admin-only fields either.
    assert "status" not in body
    assert "content" not in body
