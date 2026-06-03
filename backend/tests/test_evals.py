"""Tests for the generation eval LLM-judge (mocked Anthropic client)."""
from unittest.mock import MagicMock, patch

import pytest

from services.evals import TOOL_NAME, EvalError, evaluate_post


def _post() -> dict:
    return {
        "title": "AI voice agents land on the service drive",
        "body": "## What's new\n\nbody text",
        "format": "Brief",
        "section": "Customer Experience",
        "sources": [
            {"title": "Source A", "url": "https://x.com/a", "publisher": "x.com"}
        ],
    }


def _tool_response(payload: dict) -> MagicMock:
    block = MagicMock()
    block.type = "tool_use"
    block.name = TOOL_NAME
    block.input = payload
    response = MagicMock()
    response.content = [block]
    return response


def _client(response) -> MagicMock:
    client = MagicMock()
    client.messages.create.return_value = response
    return client


def test_evaluate_post_returns_scores(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    response = _tool_response(
        {
            "pov_adherence": 2,
            "format_adherence": 1,
            "source_grounding": 2,
            "passed": True,
            "notes": "clean",
        }
    )
    with patch("services.evals.anthropic.Anthropic", return_value=_client(response)):
        result = evaluate_post(_post())

    assert result.pov_adherence == 2
    assert result.format_adherence == 1
    assert result.source_grounding == 2
    assert result.passed is True
    assert result.notes == "clean"


def test_missing_tool_call_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    response = MagicMock()
    response.content = []
    response.stop_reason = "end_turn"
    with patch("services.evals.anthropic.Anthropic", return_value=_client(response)):
        with pytest.raises(EvalError, match="did not call"):
            evaluate_post(_post())


def test_out_of_range_score_raises(monkeypatch):
    monkeypatch.setenv("ANTHROPIC_API_KEY", "k")
    response = _tool_response(
        {
            "pov_adherence": 5,  # out of 0–2 range
            "format_adherence": 1,
            "source_grounding": 2,
            "passed": True,
            "notes": "",
        }
    )
    with patch("services.evals.anthropic.Anthropic", return_value=_client(response)):
        with pytest.raises(EvalError, match="validation"):
            evaluate_post(_post())
