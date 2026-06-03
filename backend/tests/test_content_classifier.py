"""Tests for the Haiku promo-vs-news classifier (mocked Anthropic client)."""
from unittest.mock import MagicMock, patch

import anthropic

from services.content_classifier import TOOL_NAME, classify_articles
from services.news_fetcher import Article


def _article(url: str, section: str = "Customer Experience") -> Article:
    return Article(
        title=f"t {url}",
        url=url,
        publisher="techcrunch.com",
        published_date=None,
        snippet="snippet",
        section=section,
    )


def _tool_response(verdicts: list[dict]) -> MagicMock:
    block = MagicMock()
    block.type = "tool_use"
    block.name = TOOL_NAME
    block.input = {"verdicts": verdicts}
    response = MagicMock()
    response.content = [block]
    return response


def _client_returning(response) -> MagicMock:
    client = MagicMock()
    client.messages.create.return_value = response
    return client


def test_returns_verdicts_keyed_by_url(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    arts = [_article("https://x.com/a"), _article("https://x.com/b")]
    response = _tool_response(
        [
            {"url": "https://x.com/a", "is_news": True, "importance": 2},
            {"url": "https://x.com/b", "is_news": False, "importance": 0},
        ]
    )
    with patch(
        "services.content_classifier.anthropic.Anthropic",
        return_value=_client_returning(response),
    ):
        verdicts = classify_articles(arts)

    assert verdicts["https://x.com/a"].is_news is True
    assert verdicts["https://x.com/a"].importance == 2
    assert verdicts["https://x.com/b"].is_news is False


def test_empty_input_returns_empty():
    assert classify_articles([]) == {}


def test_fails_open_when_no_tool_call(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    arts = [_article("https://x.com/a")]
    response = MagicMock()
    response.content = []  # no tool_use block
    with patch(
        "services.content_classifier.anthropic.Anthropic",
        return_value=_client_returning(response),
    ):
        verdicts = classify_articles(arts)

    # Fail-open: treated as news so we don't lose the whole run.
    assert verdicts["https://x.com/a"].is_news is True
    assert verdicts["https://x.com/a"].importance == 1


def test_fails_open_on_api_error(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    arts = [_article("https://x.com/a")]
    client = MagicMock()
    client.messages.create.side_effect = anthropic.AnthropicError("boom")
    with patch(
        "services.content_classifier.anthropic.Anthropic", return_value=client
    ):
        verdicts = classify_articles(arts)

    assert verdicts["https://x.com/a"].is_news is True


def test_fills_in_articles_the_model_skipped(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    arts = [_article("https://x.com/a"), _article("https://x.com/b")]
    # Model only returned a verdict for /a.
    response = _tool_response(
        [{"url": "https://x.com/a", "is_news": False, "importance": 0}]
    )
    with patch(
        "services.content_classifier.anthropic.Anthropic",
        return_value=_client_returning(response),
    ):
        verdicts = classify_articles(arts)

    assert verdicts["https://x.com/a"].is_news is False
    # /b was skipped → fail-open default.
    assert verdicts["https://x.com/b"].is_news is True
    assert verdicts["https://x.com/b"].importance == 1
