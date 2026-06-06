"""Tests for the pipeline orchestrator + /pipeline endpoints.

`news_fetcher` and `blog_writer` are patched at the names imported INTO
`services.pipeline` — not at their definition sites — because the import
binds the reference there.

The `db` fixture (conftest.py) wraps each test in a connection-level
transaction; the endpoint's `db.commit()` releases a SAVEPOINT but the
outer transaction is rolled back at teardown, so committed rows from one
test don't leak into others.
"""
from collections.abc import Generator
from datetime import date
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_api_key
from main import app
from models import Post, Setting, Source
from routers import pipeline as pipeline_router
from schemas.blog_writer import GeneratedPost, GeneratedSource
from services.news_fetcher import Article


@pytest.fixture(autouse=True)
def _stub_eval() -> Generator[None, None, None]:
    """The in-loop post-generation eval calls Haiku; stub it so pipeline tests
    never make a real API call. Behavior under test is persistence/routing."""
    from schemas.evals import EvalResult

    stub = EvalResult(
        pov_adherence=2,
        format_adherence=2,
        source_grounding=2,
        passed=True,
        notes="stub",
    )
    with patch("services.pipeline.evaluate_post", return_value=stub):
        yield


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    # Bypass the API-key gate here; auth enforcement is covered by
    # test_api_key_auth.py. These tests exercise pipeline behavior.
    app.dependency_overrides[require_api_key] = lambda: None
    pipeline_router._state["value"] = "idle"
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()
        pipeline_router._state["value"] = "idle"


def _articles() -> list[Article]:
    return [
        Article(
            title=f"t{i}",
            url=f"https://example.com/{i}",
            publisher="example.com",
            published_date=date(2026, 5, 10),
            snippet="snippet",
            section="Customer Experience",
        )
        for i in range(3)
    ]


def _generated(slug: str = "ai-voice-agents-reshape-service") -> GeneratedPost:
    return GeneratedPost(
        title="AI Voice Agents Reshape Service",
        slug=slug,
        summary="Two-to-three sentence summary text for the blog post.",
        meta_description="Meta description for SEO.",
        body="# Heading\n\nMarkdown body content.",
        tags=["Voice AI", "CRM"],
        story_type="Vendor Launch",
        sources=[
            GeneratedSource(
                title=f"Source {i}",
                url=f"https://example.com/src-{i}",
                publisher="example.com",
                published_date=date(2026, 5, 9),
            )
            for i in range(2)
        ],
    )


def _set_mode(db: Session, mode: str) -> None:
    setting = db.query(Setting).filter(Setting.id == 1).one()
    setting.publishing_mode = mode
    db.flush()


def _patch_services(generated: GeneratedPost | None = None, articles=None):
    """Patch the names as imported into services.pipeline."""
    articles = articles if articles is not None else _articles()
    return (
        patch(
            "services.pipeline.fetch_qualifying_articles",
            return_value=articles,
        ),
        patch(
            "services.pipeline.generate_post",
            return_value=generated or _generated(),
        ),
    )


def test_run_auto_creates_published_post(client: TestClient, db: Session) -> None:
    _set_mode(db, "auto")
    fetch_patch, gen_patch = _patch_services(_generated(slug="auto-mode-test"))
    with fetch_patch, gen_patch:
        response = client.post("/pipeline/run")

    assert response.status_code == 200
    body = response.json()
    assert body["skipped"] is False
    assert body["slug"] == "auto-mode-test"
    assert body["status"] == "published"
    assert body["publishing_mode"] == "auto"
    assert body["published_at"] is not None

    post = db.query(Post).filter(Post.slug == "auto-mode-test").one()
    assert post.status == "published"
    assert post.published_at is not None
    assert post.publishing_mode == "auto"


def test_run_approve_only_creates_pending_review(
    client: TestClient, db: Session
) -> None:
    _set_mode(db, "approve_only")
    fetch_patch, gen_patch = _patch_services(_generated(slug="approve-only-test"))
    with fetch_patch, gen_patch:
        response = client.post("/pipeline/run")

    assert response.status_code == 200
    body = response.json()
    assert body["skipped"] is False
    assert body["slug"] == "approve-only-test"
    assert body["status"] == "pending_review"
    assert body["publishing_mode"] == "approve_only"
    assert body["published_at"] is None

    post = db.query(Post).filter(Post.slug == "approve-only-test").one()
    assert post.status == "pending_review"
    assert post.published_at is None
    assert post.publishing_mode == "approve_only"


def test_run_skips_when_no_articles(client: TestClient, db: Session) -> None:
    setting = db.query(Setting).filter(Setting.id == 1).one()
    last_before = setting.last_run_at
    posts_before = db.query(Post).count()

    with patch(
        "services.pipeline.fetch_qualifying_articles", return_value=[]
    ), patch("services.pipeline.generate_post") as gen_mock:
        response = client.post("/pipeline/run")

    assert response.status_code == 200
    body = response.json()
    assert body["skipped"] is True
    assert body["reason"] == "below_threshold"
    assert body["article_count"] == 0
    gen_mock.assert_not_called()

    assert db.query(Post).count() == posts_before

    db.expire_all()
    setting = db.query(Setting).filter(Setting.id == 1).one()
    assert setting.last_run_at is not None
    assert setting.last_run_at != last_before


def test_run_persists_sources_with_fk(client: TestClient, db: Session) -> None:
    _set_mode(db, "auto")
    generated = _generated(slug="sources-test")
    fetch_patch, gen_patch = _patch_services(generated)
    with fetch_patch, gen_patch:
        response = client.post("/pipeline/run")

    assert response.status_code == 200
    post = db.query(Post).filter(Post.slug == "sources-test").one()
    sources = db.query(Source).filter(Source.post_id == post.id).all()
    assert len(sources) == len(generated.sources)
    assert {s.url for s in sources} == {s.url for s in generated.sources}
    assert {s.title for s in sources} == {s.title for s in generated.sources}


def test_publishing_mode_snapshot_is_immutable(
    client: TestClient, db: Session
) -> None:
    _set_mode(db, "auto")
    fetch_patch, gen_patch = _patch_services(_generated(slug="snapshot-test"))
    with fetch_patch, gen_patch:
        response = client.post("/pipeline/run")
    assert response.status_code == 200

    _set_mode(db, "approve_only")

    db.expire_all()
    post = db.query(Post).filter(Post.slug == "snapshot-test").one()
    assert post.publishing_mode == "auto"


def test_overlap_returns_409(client: TestClient) -> None:
    pipeline_router._state["value"] = "running"
    try:
        response = client.post("/pipeline/run")
    finally:
        pipeline_router._state["value"] = "idle"

    assert response.status_code == 409
    assert response.json()["detail"] == "pipeline already running"


def test_status_endpoint_shape(client: TestClient, db: Session) -> None:
    # Reset next_run_at so the None branch is exercised regardless of
    # whether the scheduler has booted against the dev DB.
    setting = db.query(Setting).filter(Setting.id == 1).one()
    setting.next_run_at = None
    db.flush()

    response = client.get("/pipeline/status")
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {"last_run_at", "next_run_at", "state"}
    assert body["next_run_at"] is None
    assert body["state"] == "idle"


def test_run_sets_default_deep_dive_format(client: TestClient, db: Session) -> None:
    _set_mode(db, "auto")
    fetch_patch, gen_patch = _patch_services(_generated(slug="fmt-default"))
    with fetch_patch, gen_patch:
        response = client.post("/pipeline/run")
    assert response.status_code == 200
    post = db.query(Post).filter(Post.slug == "fmt-default").one()
    assert post.format == "Deep Dive"


def test_manual_format_override(client: TestClient, db: Session) -> None:
    _set_mode(db, "auto")
    fetch_patch, gen_patch = _patch_services(_generated(slug="brief-override"))
    with fetch_patch, gen_patch as gen_mock:
        response = client.post("/pipeline/run", json={"format": "Brief"})
    assert response.status_code == 200
    post = db.query(Post).filter(Post.slug == "brief-override").one()
    assert post.format == "Brief"
    assert gen_mock.call_args.kwargs["format"] == "Brief"


def test_manual_format_invalid_returns_422(client: TestClient) -> None:
    response = client.post("/pipeline/run", json={"format": "Tweet"})
    assert response.status_code == 422


def test_status_reflects_last_run_after_run(client: TestClient, db: Session) -> None:
    _set_mode(db, "auto")
    fetch_patch, gen_patch = _patch_services(_generated(slug="status-after-run"))
    with fetch_patch, gen_patch:
        run_response = client.post("/pipeline/run")
    assert run_response.status_code == 200

    status_response = client.get("/pipeline/status")
    assert status_response.status_code == 200
    assert status_response.json()["last_run_at"] is not None
    assert status_response.json()["state"] == "idle"


def test_in_loop_eval_receives_source_excerpts(client: TestClient, db: Session) -> None:
    """The in-loop eval must get each source's snippet as its excerpt — that's
    what makes its grounding score meaningful (the 2026-06-05 gate-free path)."""
    _set_mode(db, "auto")
    articles = [
        Article(
            title="t0",
            url="https://example.com/match-0",
            publisher="example.com",
            published_date=date(2026, 5, 10),
            snippet="real snippet text zero",
            section="Customer Experience",
        )
    ]
    generated = _generated(slug="excerpt-wiring")
    generated.sources = [
        GeneratedSource(
            title="S0",
            url="https://example.com/match-0",  # matches the article URL
            publisher="example.com",
            published_date=date(2026, 5, 9),
        )
    ]
    fetch_patch, gen_patch = _patch_services(generated, articles)
    with fetch_patch, gen_patch, patch(
        "services.pipeline.evaluate_post"
    ) as eval_mock:
        from schemas.evals import EvalResult

        eval_mock.return_value = EvalResult(
            pov_adherence=1,
            format_adherence=1,
            source_grounding=1,
            passed=True,
            notes="",
        )
        client.post("/pipeline/run")

    eval_mock.assert_called_once()
    post_arg = eval_mock.call_args.args[0]
    assert post_arg["format"] == "Deep Dive"
    assert post_arg["sources"][0]["excerpt"] == "real snippet text zero"


def test_run_persists_story_type(client: TestClient, db: Session) -> None:
    """The LLM-classified story_type is written onto the post."""
    _set_mode(db, "auto")
    fetch_patch, gen_patch = _patch_services(_generated(slug="story-type-persist"))
    with fetch_patch, gen_patch:
        client.post("/pipeline/run")

    post = db.query(Post).filter(Post.slug == "story-type-persist").one()
    assert post.story_type == "Vendor Launch"


def test_run_persists_eval_scores(client: TestClient, db: Session) -> None:
    """The in-loop eval result is written onto the post (the _stub_eval fixture
    returns a 2/2/2 pass)."""
    _set_mode(db, "auto")
    fetch_patch, gen_patch = _patch_services(_generated(slug="eval-persist"))
    with fetch_patch, gen_patch:
        client.post("/pipeline/run")

    post = db.query(Post).filter(Post.slug == "eval-persist").one()
    assert post.eval_pov == 2
    assert post.eval_format == 2
    assert post.eval_grounding == 2
    assert post.eval_passed is True
    assert post.eval_notes == "stub"
    assert post.eval_at is not None


def test_eval_skip_leaves_scores_null(client: TestClient, db: Session) -> None:
    """If the fail-soft eval is skipped (raises), the post saves with NULL
    scores — the run must not break, and nothing stale is recorded."""
    _set_mode(db, "auto")
    fetch_patch, gen_patch = _patch_services(_generated(slug="eval-skip"))
    with fetch_patch, gen_patch, patch(
        "services.pipeline.evaluate_post", side_effect=RuntimeError("judge down")
    ):
        response = client.post("/pipeline/run")

    assert response.status_code == 200
    post = db.query(Post).filter(Post.slug == "eval-skip").one()
    assert post.eval_passed is None
    assert post.eval_pov is None
    assert post.eval_at is None
