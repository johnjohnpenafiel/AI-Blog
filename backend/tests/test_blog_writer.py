from datetime import date
from unittest.mock import MagicMock, patch

import pytest

from schemas.blog_writer import GeneratedPost
from services.blog_writer import (
    SUBMIT_POST_TOOL,
    TOOL_NAME,
    BlogWriterError,
    generate_post,
)
from services.news_fetcher import Article


VALID_TOOL_INPUT: dict = {
    "title": "Voice Agents Reshape the Service Drive",
    "slug": "voice-agents-reshape-service-drive",
    "summary": "Dealerships are deploying AI voice agents to triage service calls. Early adopters report higher capture rates. The trend is accelerating.",
    "meta_description": "How AI voice agents are changing dealership service operations.",
    "body": "## Intro\n\nVoice AI is now in the lane...\n\n" + ("Filler paragraph. " * 50),
    "tags": ["Voice AI", "CRM"],
    "sources": [
        {
            "title": "Voice AI hits the dealership floor",
            "url": "https://example.com/voice-ai",
            "publisher": "example.com",
            "published_date": "2026-05-10",
        }
    ],
}


def _article() -> Article:
    return Article(
        title="Voice AI hits the dealership floor",
        url="https://example.com/voice-ai",
        publisher="example.com",
        published_date=date(2026, 5, 10),
        snippet="Voice agents are now answering service calls...",
        section="Customer Experience",
    )


def _tool_use_block(tool_input: dict) -> MagicMock:
    block = MagicMock()
    block.type = "tool_use"
    block.name = TOOL_NAME
    block.input = tool_input
    return block


def _text_block(text: str) -> MagicMock:
    block = MagicMock()
    block.type = "text"
    block.text = text
    return block


def _fake_response(blocks: list, stop_reason: str = "tool_use") -> MagicMock:
    response = MagicMock()
    response.content = blocks
    response.stop_reason = stop_reason
    return response


def _patch_anthropic(response: MagicMock):
    """Return a context-manager patch on services.blog_writer.anthropic.Anthropic.

    The mocked client's messages.create() returns the supplied response.
    """
    patcher = patch("services.blog_writer.anthropic.Anthropic")
    mock_class = patcher.start()
    mock_client = MagicMock()
    mock_client.messages.create.return_value = response
    mock_class.return_value = mock_client
    return patcher, mock_client


def test_happy_path_returns_validated_post(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    response = _fake_response([_tool_use_block(VALID_TOOL_INPUT)])
    patcher, mock_client = _patch_anthropic(response)
    try:
        post = generate_post([_article()])
    finally:
        patcher.stop()

    assert isinstance(post, GeneratedPost)
    assert post.slug == "voice-agents-reshape-service-drive"
    assert post.tags == ["Voice AI", "CRM"]
    assert post.sources[0].url == "https://example.com/voice-ai"

    create_kwargs = mock_client.messages.create.call_args.kwargs
    assert create_kwargs["model"] == "claude-sonnet-4-20250514"
    assert create_kwargs["tools"] == [SUBMIT_POST_TOOL]
    assert create_kwargs["tool_choice"] == {"type": "tool", "name": TOOL_NAME}


def test_missing_tool_use_block_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    response = _fake_response(
        [_text_block("I refuse to call the tool.")], stop_reason="end_turn"
    )
    patcher, _ = _patch_anthropic(response)
    try:
        with pytest.raises(BlogWriterError, match="did not call"):
            generate_post([_article()])
    finally:
        patcher.stop()


def test_invalid_tag_value_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    bad_input = {**VALID_TOOL_INPUT, "tags": ["Voice AI", "Bogus Tag"]}
    response = _fake_response([_tool_use_block(bad_input)])
    patcher, _ = _patch_anthropic(response)
    try:
        with pytest.raises(BlogWriterError, match="validation"):
            generate_post([_article()])
    finally:
        patcher.stop()


def test_zero_tags_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    bad_input = {**VALID_TOOL_INPUT, "tags": []}
    response = _fake_response([_tool_use_block(bad_input)])
    patcher, _ = _patch_anthropic(response)
    try:
        with pytest.raises(BlogWriterError, match="validation"):
            generate_post([_article()])
    finally:
        patcher.stop()


def test_too_many_tags_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    bad_input = {
        **VALID_TOOL_INPUT,
        "tags": ["Voice AI", "CRM", "Merchandising"],
    }
    response = _fake_response([_tool_use_block(bad_input)])
    patcher, _ = _patch_anthropic(response)
    try:
        with pytest.raises(BlogWriterError, match="validation"):
            generate_post([_article()])
    finally:
        patcher.stop()


def test_missing_required_field_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    bad_input = {k: v for k, v in VALID_TOOL_INPUT.items() if k != "slug"}
    response = _fake_response([_tool_use_block(bad_input)])
    patcher, _ = _patch_anthropic(response)
    try:
        with pytest.raises(BlogWriterError, match="validation"):
            generate_post([_article()])
    finally:
        patcher.stop()


def test_invalid_slug_pattern_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-key")
    bad_input = {**VALID_TOOL_INPUT, "slug": "Not A Slug"}
    response = _fake_response([_tool_use_block(bad_input)])
    patcher, _ = _patch_anthropic(response)
    try:
        with pytest.raises(BlogWriterError, match="validation"):
            generate_post([_article()])
    finally:
        patcher.stop()
