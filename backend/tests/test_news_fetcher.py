from unittest.mock import MagicMock, patch

from services.news_fetcher import SONAR_QUERIES, fetch_qualifying_articles


def _fake_response(results: list[dict]) -> MagicMock:
    response = MagicMock()
    response.raise_for_status.return_value = None
    response.json.return_value = {"results": results}
    return response


def test_returns_articles_when_threshold_met(monkeypatch):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")

    raw = [
        {
            "title": "AI in dealerships",
            "url": "https://www.techcrunch.com/post-1",
            "snippet": "snip 1",
            "date": "2026-05-10",
        },
        {
            "title": "Voice agents",
            "url": "https://theverge.com/post-2",
            "snippet": "snip 2",
            "date": "2026-05-09",
        },
        {
            "title": "Duplicate URL — should dedup",
            "url": "https://www.techcrunch.com/post-1",
            "snippet": "dup",
            "date": "2026-05-08",
        },
        {
            "title": "Merchandising",
            "url": "https://example.com/post-3",
            "snippet": "snip 3",
            "date": "2026-05-07",
        },
    ]

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.return_value = _fake_response(raw)
        articles = fetch_qualifying_articles()

    assert len(articles) == 3
    urls = {a.url for a in articles}
    assert urls == {
        "https://www.techcrunch.com/post-1",
        "https://theverge.com/post-2",
        "https://example.com/post-3",
    }

    techcrunch = next(a for a in articles if "techcrunch" in a.url)
    assert techcrunch.publisher == "techcrunch.com"

    assert mock_post.call_count == 1
    sent_body = mock_post.call_args.kwargs["json"]
    assert sent_body["query"] == SONAR_QUERIES
    assert sent_body["search_recency_filter"] == "week"


def test_returns_empty_when_below_threshold(monkeypatch, caplog):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "test-key")

    raw = [
        {
            "title": "Only one",
            "url": "https://example.com/a",
            "snippet": "...",
            "date": "2026-05-10",
        },
        {
            "title": "Only two",
            "url": "https://example.com/b",
            "snippet": "...",
            "date": "2026-05-09",
        },
    ]

    with patch("services.news_fetcher.httpx.post") as mock_post:
        mock_post.return_value = _fake_response(raw)
        with caplog.at_level("INFO", logger="services.news_fetcher"):
            articles = fetch_qualifying_articles()

    assert articles == []
    assert any("skipping run" in msg for msg in caplog.messages)
