"""Tests for the v2 section-based news fetcher.

Sonar `/search` is called once per section query (open canvas — no domain
allowlist). The Haiku classifier (`classify_articles`) is patched per test to
control is_news / importance. The `db` fixture gives a real Postgres session
for the already-cited-URL and last-published-section lookups.
"""
from datetime import datetime, timezone
from unittest.mock import MagicMock, patch

from sqlalchemy.orm import Session

from models import Post, Source
from schemas.classifier import ArticleVerdict
from services.news_fetcher import (
    DOMAIN_BLOCKLIST,
    SECTION_QUERIES,
    Article,
    fetch_qualifying_articles,
)

CLASSIFY = "services.news_fetcher.classify_articles"


def _slug(section: str) -> str:
    return section.replace(" ", "-").replace("/", "").replace("&", "and").lower()


def _section_url(section: str, i: int, publisher: str = "techcrunch.com") -> str:
    return f"https://{publisher}/{_slug(section)}-{i}"


def _fake_response(results: list[dict]) -> MagicMock:
    response = MagicMock()
    response.raise_for_status.return_value = None
    response.json.return_value = {"results": results}
    return response


def _results_for(counts_by_section: dict[str, int]) -> dict[str, list[dict]]:
    out: dict[str, list[dict]] = {q: [] for q in SECTION_QUERIES.values()}
    for section, query in SECTION_QUERIES.items():
        out[query] = [
            {
                "title": f"{section} article {i}",
                "url": _section_url(section, i),
                "snippet": f"snippet {section} {i}",
                "date": "2026-05-10",
            }
            for i in range(counts_by_section.get(section, 0))
        ]
    return out


def _dispatch(results_by_query: dict[str, list[dict]]):
    def _call(*_args, **kwargs):
        return _fake_response(results_by_query.get(kwargs["json"]["query"], []))
    return _call


def _classifier(*, section_importance=None, drop_urls=None):
    """Build a classify_articles stand-in. `section_importance` maps a section
    to the importance assigned to each of its articles; `drop_urls` are marked
    not-news."""
    drop = drop_urls or set()

    def _fn(articles):
        out = {}
        for a in articles:
            imp = (section_importance or {}).get(a.section, 1)
            out[a.url] = ArticleVerdict(
                url=a.url, is_news=a.url not in drop, importance=imp
            )
        return out

    return _fn


def _make_published_post(db: Session, *, section: str) -> Post:
    post = Post(
        slug=f"existing-{_slug(section)}",
        title="Existing post",
        content="body",
        summary="summary text",
        meta_description="meta description text",
        tags=[],
        section=section,
        publishing_mode="auto",
        status="published",
        published_at=datetime.now(timezone.utc),
    )
    db.add(post)
    db.flush()
    return post


def _cite_url(db: Session, url: str) -> None:
    """Attach `url` to a (draft) post's sources so it counts as already-cited
    without affecting the last-published-section lookup."""
    post = Post(
        slug=f"cited-holder-{abs(hash(url)) % 10000}",
        title="holder",
        content="body",
        summary="summary",
        meta_description="meta",
        tags=[],
        publishing_mode="auto",
        status="draft",
    )
    db.add(post)
    db.flush()
    db.add(Source(post_id=post.id, title="t", url=url, publisher="p"))
    db.flush()


# --- core behavior -------------------------------------------------------

def test_returns_winning_section_and_uses_open_canvas(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    results = _results_for({"Customer Experience": 4, "CRM & Marketing": 2})

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier()
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert len(articles) == 4
    assert {a.section for a in articles} == {"Customer Experience"}

    assert mock_post.call_count == len(SECTION_QUERIES)
    sent = mock_post.call_args_list[0].kwargs["json"]
    assert "search_domain_filter" not in sent  # open canvas
    assert sent["search_recency_filter"] == "week"


def test_skips_when_no_section_hits_threshold(monkeypatch, db, caplog):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    results = _results_for(
        {"Customer Experience": 2, "CRM & Marketing": 2, "Pricing & Analytics": 1}
    )

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier()
    ):
        mock_post.side_effect = _dispatch(results)
        with caplog.at_level("INFO", logger="services.news_fetcher"):
            articles = fetch_qualifying_articles(db)

    assert articles == []
    assert any("skipping run" in m for m in caplog.messages)


def test_classifier_drops_non_news_before_threshold(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    results = _results_for({"Customer Experience": 4})
    # Two of the four are promo → only 2 news remain (< 3) → skip.
    drop = {_section_url("Customer Experience", 0), _section_url("Customer Experience", 1)}

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier(drop_urls=drop)
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert articles == []


def test_already_cited_urls_are_dropped(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    results = _results_for({"Customer Experience": 4})
    cited = _section_url("Customer Experience", 0)
    _cite_url(db, cited)

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier()
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert len(articles) == 3
    assert cited not in {a.url for a in articles}


def test_blocklisted_domains_are_dropped(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    blocked = next(iter(DOMAIN_BLOCKLIST))
    ce_query = SECTION_QUERIES["Customer Experience"]
    results = {q: [] for q in SECTION_QUERIES.values()}
    results[ce_query] = [
        {"title": "ok 0", "url": "https://techcrunch.com/ce-0", "snippet": "", "date": "2026-05-10"},
        {"title": "ok 1", "url": "https://techcrunch.com/ce-1", "snippet": "", "date": "2026-05-10"},
        {"title": "ok 2", "url": "https://techcrunch.com/ce-2", "snippet": "", "date": "2026-05-10"},
        {"title": "promo", "url": f"https://{blocked}/promo", "snippet": "", "date": "2026-05-10"},
    ]

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier()
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert len(articles) == 3
    assert all(blocked not in a.url for a in articles)


def test_importance_not_raw_count_picks_winner(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    # Equal cluster sizes; Pricing has the high-importance stories.
    results = _results_for({"Customer Experience": 3, "Pricing & Analytics": 3})

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY,
        _classifier(
            section_importance={"Customer Experience": 1, "Pricing & Analytics": 2}
        ),
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert {a.section for a in articles} == {"Pricing & Analytics"}


def test_anti_repeat_avoids_last_section_even_if_higher_importance(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    _make_published_post(db, section="Customer Experience")
    results = _results_for({"Customer Experience": 3, "Pricing & Analytics": 3})

    # CE would win on importance, but it's the last published section → skip it.
    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY,
        _classifier(
            section_importance={"Customer Experience": 2, "Pricing & Analytics": 1}
        ),
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert {a.section for a in articles} == {"Pricing & Analytics"}


def test_last_section_wins_when_only_qualifier(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    _make_published_post(db, section="Customer Experience")
    results = _results_for({"Customer Experience": 4})

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier()
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert {a.section for a in articles} == {"Customer Experience"}


def test_dedupes_by_url_first_seen_section_wins(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    ce_query = SECTION_QUERIES["Customer Experience"]
    crm_query = SECTION_QUERIES["CRM & Marketing"]
    shared = {"title": "Shared", "url": "https://techcrunch.com/shared", "snippet": "", "date": "2026-05-10"}

    results = {q: [] for q in SECTION_QUERIES.values()}
    results[ce_query] = [
        shared,
        {"title": "V1", "url": "https://techcrunch.com/v1", "snippet": "", "date": "2026-05-10"},
        {"title": "V2", "url": "https://techcrunch.com/v2", "snippet": "", "date": "2026-05-10"},
    ]
    results[crm_query] = [
        shared,  # deduped — Customer Experience (first seen) keeps it
        {"title": "C1", "url": "https://techcrunch.com/c1", "snippet": "", "date": "2026-05-10"},
        {"title": "C2", "url": "https://techcrunch.com/c2", "snippet": "", "date": "2026-05-10"},
    ]

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier()
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert {a.section for a in articles} == {"Customer Experience"}
    assert "https://techcrunch.com/shared" in {a.url for a in articles}


def test_skips_results_missing_title_or_url(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    ce_query = SECTION_QUERIES["Customer Experience"]
    results = {q: [] for q in SECTION_QUERIES.values()}
    results[ce_query] = [
        {"title": "Good", "url": "https://techcrunch.com/good", "snippet": "", "date": "2026-05-10"},
        {"title": "No URL", "snippet": "", "date": "2026-05-10"},
        {"url": "https://techcrunch.com/no-title", "snippet": "", "date": "2026-05-10"},
        {"title": "Good 2", "url": "https://techcrunch.com/good-2", "snippet": "", "date": "2026-05-10"},
        {"title": "Good 3", "url": "https://techcrunch.com/good-3", "snippet": "", "date": "2026-05-10"},
    ]

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier()
    ):
        mock_post.side_effect = _dispatch(results)
        articles = fetch_qualifying_articles(db)

    assert len(articles) == 3
    assert all("good" in a.url for a in articles)


def test_returns_empty_when_no_articles_at_all(monkeypatch, db, caplog):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")
    results = {q: [] for q in SECTION_QUERIES.values()}

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        CLASSIFY, _classifier()
    ):
        mock_post.side_effect = _dispatch(results)
        with caplog.at_level("INFO", logger="services.news_fetcher"):
            articles = fetch_qualifying_articles(db)

    assert articles == []
    assert any("skipping run" in m for m in caplog.messages)
