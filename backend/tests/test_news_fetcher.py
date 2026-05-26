"""Tests for the per-cluster news fetcher.

Sonar `/search` is now called once per query (7 calls total), so the mocks
use `httpx.post.side_effect` driven by the request's `query` field to
return different fixtures per query. The `db` fixture (conftest.py) gives
each test a real Postgres session for the `_last_published_tag` lookup
used by the tie-break.
"""
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session

from models import Post
from services.news_fetcher import (
    NEWS_DOMAIN_ALLOWLIST,
    QUERY_TO_TAG,
    fetch_qualifying_articles,
)


def _fake_response(results: list[dict]) -> MagicMock:
    response = MagicMock()
    response.raise_for_status.return_value = None
    response.json.return_value = {"results": results}
    return response


def _results_for(counts_by_tag: dict[str, int]) -> dict[str, list[dict]]:
    """Build {query: [raw_result, ...]} with `count` synthetic articles per tag."""
    out: dict[str, list[dict]] = {q: [] for q in QUERY_TO_TAG}
    for query, tag in QUERY_TO_TAG.items():
        n = counts_by_tag.get(tag, 0)
        slug = tag.replace(" ", "-").replace("&", "and").lower()
        out[query] = [
            {
                "title": f"{tag} article {i}",
                "url": f"https://techcrunch.com/{slug}-{i}",
                "snippet": f"snippet for {tag} {i}",
                "date": "2026-05-10",
            }
            for i in range(n)
        ]
    return out


def _dispatch(results_by_query: dict[str, list[dict]]):
    """side_effect callable that returns per-query results based on request body."""
    def _call(*_args, **kwargs):
        query = kwargs["json"]["query"]
        return _fake_response(results_by_query.get(query, []))
    return _call


def _make_published_post(db: Session, *, tag: str) -> Post:
    post = Post(
        slug=f"existing-{tag.replace(' ', '-').lower()}",
        title="Existing post",
        content="body",
        summary="summary text",
        meta_description="meta description text",
        tags=[tag],
        publishing_mode="auto",
        status="published",
        published_at=datetime.now(timezone.utc),
    )
    db.add(post)
    db.flush()
    return post


def test_returns_winning_cluster_articles(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    results = _results_for({"Voice AI": 4, "CRM": 2})

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert len(articles) == 4
    assert {a.tag for a in articles} == {"Voice AI"}

    # One HTTP call per query.
    assert mock_post.call_count == len(QUERY_TO_TAG)
    sent = mock_post.call_args_list[0].kwargs["json"]
    assert sent["search_recency_filter"] == "week"
    assert sent["search_domain_filter"] == NEWS_DOMAIN_ALLOWLIST
    assert isinstance(sent["query"], str)


def test_skips_when_no_cluster_hits_threshold(monkeypatch, db, caplog):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    # 5 total articles but no single cluster reaches the ≥3 threshold.
    results = _results_for({"Voice AI": 2, "CRM": 2, "Merchandising": 1})

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.side_effect = _dispatch(results)
        with caplog.at_level("INFO", logger="services.news_fetcher"):
            articles = fetch_qualifying_articles(db)

    assert articles == []
    assert any("skipping run" in m for m in caplog.messages)


def test_tie_break_prefers_tag_different_from_last_published(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    _make_published_post(db, tag="Voice AI")

    results = _results_for({"Voice AI": 3, "CRM": 3})

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert len(articles) == 3
    assert {a.tag for a in articles} == {"CRM"}


def test_tie_break_falls_back_when_all_candidates_equal_last(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    _make_published_post(db, tag="Voice AI")

    # Only Voice AI has any articles; it wins by default even though
    # it equals last_published_tag (no other candidate to fall back to).
    results = _results_for({"Voice AI": 4})

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert len(articles) == 4
    assert {a.tag for a in articles} == {"Voice AI"}


def test_dedupes_articles_by_url_across_queries(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    voice_query = next(q for q, t in QUERY_TO_TAG.items() if t == "Voice AI")
    crm_query = next(q for q, t in QUERY_TO_TAG.items() if t == "CRM")

    shared = {
        "title": "Shared",
        "url": "https://techcrunch.com/shared",
        "snippet": "",
        "date": "2026-05-10",
    }

    results: dict[str, list[dict]] = {q: [] for q in QUERY_TO_TAG}
    results[voice_query] = [
        shared,
        {"title": "V1", "url": "https://techcrunch.com/v1", "snippet": "", "date": "2026-05-10"},
        {"title": "V2", "url": "https://techcrunch.com/v2", "snippet": "", "date": "2026-05-10"},
    ]
    results[crm_query] = [
        # Same URL — should be deduped, keeping the Voice AI tag (first seen).
        shared,
        {"title": "C1", "url": "https://techcrunch.com/c1", "snippet": "", "date": "2026-05-10"},
        {"title": "C2", "url": "https://techcrunch.com/c2", "snippet": "", "date": "2026-05-10"},
    ]

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    # Voice AI cluster has 3 (shared, V1, V2). CRM cluster has 2 (C1, C2).
    assert len(articles) == 3
    assert {a.tag for a in articles} == {"Voice AI"}
    assert {a.url for a in articles} == {
        "https://techcrunch.com/shared",
        "https://techcrunch.com/v1",
        "https://techcrunch.com/v2",
    }


def test_returns_empty_when_no_articles_at_all(monkeypatch, db, caplog):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    results: dict[str, list[dict]] = {q: [] for q in QUERY_TO_TAG}

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.side_effect = _dispatch(results)
        with caplog.at_level("INFO", logger="services.news_fetcher"):
            articles = fetch_qualifying_articles(db)

    assert articles == []
    assert any("skipping run" in m for m in caplog.messages)


def test_skips_results_missing_title_or_url(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    voice_query = next(q for q, t in QUERY_TO_TAG.items() if t == "Voice AI")

    results: dict[str, list[dict]] = {q: [] for q in QUERY_TO_TAG}
    results[voice_query] = [
        {"title": "Good", "url": "https://techcrunch.com/good", "snippet": "", "date": "2026-05-10"},
        {"title": "No URL", "snippet": "", "date": "2026-05-10"},
        {"url": "https://techcrunch.com/no-title", "snippet": "", "date": "2026-05-10"},
        {"title": "Good 2", "url": "https://techcrunch.com/good-2", "snippet": "", "date": "2026-05-10"},
        {"title": "Good 3", "url": "https://techcrunch.com/good-3", "snippet": "", "date": "2026-05-10"},
    ]

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert len(articles) == 3
    assert all("good" in a.url for a in articles)
