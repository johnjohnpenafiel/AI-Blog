"""Tests for the weekly Roundup: generate_roundup (mocked Claude) + the
run_roundup orchestrator (gather week's posts, skip-if-empty, persist)."""
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest
from sqlalchemy.orm import Session

from models import Post, Setting, Source
from schemas.blog_writer import GeneratedPost, GeneratedSource
from services.blog_writer import (
    ROUNDUP_TOOL_NAME,
    BlogWriterError,
    generate_roundup,
)
from services.pipeline import (
    PipelineSkipResult,
    PipelineSuccessResult,
    run_roundup,
)


@pytest.fixture(autouse=True)
def _stub_eval():
    """run_roundup runs the in-loop post-generation eval (a Haiku call); stub it
    so roundup tests stay offline. The eval is observational, not under test."""
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


def _published_post(db, *, slug, fmt="Deep Dive", days_ago=1) -> Post:
    post = Post(
        slug=slug,
        title=f"Title {slug}",
        content="body",
        summary=f"summary {slug}",
        meta_description="meta",
        tags=[],
        section="Customer Experience",
        format=fmt,
        publishing_mode="auto",
        status="published",
        published_at=datetime.now(timezone.utc) - timedelta(days=days_ago),
    )
    db.add(post)
    db.flush()
    return post


def _set_mode(db, mode: str) -> None:
    s = db.query(Setting).filter(Setting.id == 1).one()
    s.publishing_mode = mode
    db.flush()


def _roundup_generated(slug="weekly-roundup") -> GeneratedPost:
    return GeneratedPost(
        title="This Week in Dealership AI",
        slug=slug,
        summary="A summary of the week's posts.",
        meta_description="meta",
        body="# Roundup\n\nbody",
        tags=["Voice AI"],
        sources=[
            GeneratedSource(title="Post A", url="/blog/a", publisher="The Garage AI")
        ],
    )


# --- generate_roundup ----------------------------------------------------

def test_generate_roundup_derives_sources_from_posts(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    draft = {
        "title": "This Week",
        "slug": "weekly-roundup",
        "summary": "s",
        "meta_description": "m",
        "body": "b",
        "tags": ["Voice AI"],
    }
    block = MagicMock()
    block.type = "tool_use"
    block.name = ROUNDUP_TOOL_NAME
    block.input = draft
    response = MagicMock()
    response.content = [block]
    client = MagicMock()
    client.messages.create.return_value = response

    posts = [
        {"title": "Post A", "summary": "sa", "section": "Customer Experience", "slug": "post-a"},
        {"title": "Post B", "summary": "sb", "section": "Pricing & Analytics", "slug": "post-b"},
    ]
    with patch("services.blog_writer.anthropic.Anthropic", return_value=client):
        result = generate_roundup(posts)

    assert result.slug == "weekly-roundup"
    assert [s.url for s in result.sources] == ["/blog/post-a", "/blog/post-b"]
    assert all(s.publisher == "The Garage AI" for s in result.sources)


def test_generate_roundup_empty_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    with pytest.raises(BlogWriterError):
        generate_roundup([])


# --- run_roundup ---------------------------------------------------------

def test_run_roundup_creates_roundup_post(db: Session):
    _set_mode(db, "auto")
    _published_post(db, slug="brief-1", fmt="Brief")
    _published_post(db, slug="deep-1", fmt="Deep Dive")

    with patch(
        "services.pipeline.generate_roundup",
        return_value=_roundup_generated(slug="wk-roundup"),
    ):
        result = run_roundup(db)

    assert isinstance(result, PipelineSuccessResult)
    post = result.post
    assert post.format == "Roundup"
    assert post.section is None
    assert post.status == "published"
    sources = db.query(Source).filter(Source.post_id == post.id).all()
    assert len(sources) >= 1


def test_run_roundup_passes_week_posts_to_generator(db: Session):
    _set_mode(db, "auto")
    _published_post(db, slug="brief-1", fmt="Brief")
    _published_post(db, slug="deep-1", fmt="Deep Dive")

    with patch(
        "services.pipeline.generate_roundup",
        return_value=_roundup_generated(slug="wk-roundup-2"),
    ) as gen:
        run_roundup(db)

    payload = gen.call_args.args[0]
    slugs = {p["slug"] for p in payload}
    assert slugs == {"brief-1", "deep-1"}


def test_run_roundup_skips_when_no_recent_posts(db: Session):
    _set_mode(db, "auto")
    _published_post(db, slug="old-1", days_ago=10)  # outside the 7-day window

    with patch("services.pipeline.generate_roundup") as gen:
        result = run_roundup(db)

    assert isinstance(result, PipelineSkipResult)
    assert result.reason == "no_posts_this_week"
    gen.assert_not_called()


def test_run_roundup_excludes_prior_roundups(db: Session):
    _set_mode(db, "auto")
    _published_post(db, slug="prior-roundup", fmt="Roundup", days_ago=2)

    with patch("services.pipeline.generate_roundup") as gen:
        result = run_roundup(db)

    # Only a prior roundup exists → nothing to summarize → skip.
    assert isinstance(result, PipelineSkipResult)
    gen.assert_not_called()
