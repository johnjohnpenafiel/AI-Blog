"""Tests for the weekly volume probe (mocked Sonar + classifier)."""
from unittest.mock import MagicMock, patch

from schemas.classifier import ArticleVerdict
from services.news_fetcher import SECTION_QUERIES
from services.volume_probe import measure_section_supply


def _fake_response(results: list[dict]) -> MagicMock:
    r = MagicMock()
    r.raise_for_status.return_value = None
    r.json.return_value = {"results": results}
    return r


def _dispatch(by_query: dict[str, list[dict]]):
    def _call(*_args, **kwargs):
        return _fake_response(by_query.get(kwargs["json"]["query"], []))
    return _call


def test_measure_counts_raw_and_news(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "k")
    ce_q = SECTION_QUERIES["Customer Experience"]
    by_query = {q: [] for q in SECTION_QUERIES.values()}
    by_query[ce_q] = [
        {"title": f"a{i}", "url": f"https://t.com/ce-{i}", "snippet": "", "date": "2026-05-10"}
        for i in range(4)
    ]
    drop = {"https://t.com/ce-0"}  # one promo → news < raw

    def _classify(articles):
        return {
            a.url: ArticleVerdict(url=a.url, is_news=a.url not in drop, importance=1)
            for a in articles
        }

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        "services.volume_probe.classify_articles", _classify
    ):
        mock_post.side_effect = _dispatch(by_query)
        result = measure_section_supply(db)

    assert result["Customer Experience"] == {"raw": 4, "news": 3}
    # A section with no results reports zeros and isn't sent to the classifier.
    assert result["Pricing & Analytics"] == {"raw": 0, "news": 0}
    # One Sonar call per section query.
    assert mock_post.call_count == len(SECTION_QUERIES)


def test_measure_can_skip_classification(monkeypatch, db):
    monkeypatch.setenv("PERPLEXITY_API_KEY", "k")
    ce_q = SECTION_QUERIES["Customer Experience"]
    by_query = {q: [] for q in SECTION_QUERIES.values()}
    by_query[ce_q] = [
        {"title": "a", "url": "https://t.com/ce-0", "snippet": "", "date": "2026-05-10"}
    ]

    with patch("services.news_fetcher.httpx.post") as mock_post, patch(
        "services.volume_probe.classify_articles"
    ) as mock_classify:
        mock_post.side_effect = _dispatch(by_query)
        result = measure_section_supply(db, classify=False)

    assert result["Customer Experience"] == {"raw": 1, "news": 1}
    mock_classify.assert_not_called()
