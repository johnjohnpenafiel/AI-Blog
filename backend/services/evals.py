"""Generation quality eval — an LLM-judge over a generated post.

Scores three axes the rest of the v2 pipeline is built around:
- pov_adherence    — operator-first / proof-over-hype (the editorial POV)
- format_adherence — does the body match its declared format's shape + length
- source_grounding — are the claims supported by the listed sources (no invented facts)

This is a *runnable QA tool*, not (yet) a hard publish gate — it surfaces weak
posts for review. Unlike the content classifier it fails CLOSED: a judge error
raises `EvalError` rather than silently passing a post.
"""
import logging
import os

import anthropic
from pydantic import ValidationError

from schemas.evals import EvalResult

logger = logging.getLogger(__name__)

MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 1024
TOOL_NAME = "submit_eval"

PROMPT_TEMPLATE = """You are a strict editorial QA reviewer for a blog about AI \
and operational technology in car dealerships. Score the post below on three \
axes, each 0–2:

- pov_adherence: is it operator-first and proof-over-hype? (2 = clearly written
  for a dealership operator and honest about what actually works vs. vendor hype)
- format_adherence: does it match its declared format ({format})? Judge length
  and structure. (A Brief is ~200–400w and scannable; a Deep Dive is 600–900w
  with sub-sections; a Roundup is a week-in-review.)
- source_grounding: are the claims supported by the listed sources, with no
  invented facts, names, or numbers?

Set passed=true only if pov_adherence and source_grounding are both >= 1 and no
axis is 0. Give a one-or-two-sentence `notes` explaining the main deduction, or
"clean" if none.

FORMAT: {format}
SECTION: {section}
SOURCES:
{sources_block}

POST TITLE: {title}

POST BODY:
{body}

Call {tool_name} with your scores."""


class EvalError(Exception):
    """Raised when the judge cannot produce a valid EvalResult."""


def _build_tool_schema() -> dict:
    return {
        "name": TOOL_NAME,
        "description": "Submit the editorial QA scores for the post.",
        "input_schema": EvalResult.model_json_schema(),
    }


SUBMIT_EVAL_TOOL = _build_tool_schema()


def _render_prompt(post: dict) -> str:
    sources = post.get("sources") or []
    if sources:
        sources_block = "\n".join(
            f"- {s.get('title', '')} ({s.get('publisher', '')}) {s.get('url', '')}"
            for s in sources
        )
    else:
        sources_block = "(none listed)"
    return PROMPT_TEMPLATE.format(
        format=post.get("format") or "(unspecified)",
        section=post.get("section") or "(unspecified)",
        sources_block=sources_block,
        title=post.get("title", ""),
        body=post.get("body", ""),
        tool_name=TOOL_NAME,
    )


def _extract_tool_input(response) -> dict:
    for block in response.content:
        if getattr(block, "type", None) == "tool_use" and block.name == TOOL_NAME:
            return block.input
    raise EvalError(
        f"judge did not call {TOOL_NAME}; "
        f"stop_reason={getattr(response, 'stop_reason', None)!r}"
    )


def evaluate_post(post: dict) -> EvalResult:
    """Judge one post. `post` keys: title, body, format, section, sources."""
    api_key = os.environ["ANTHROPIC_API_KEY"]
    client = anthropic.Anthropic(api_key=api_key)

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        tools=[SUBMIT_EVAL_TOOL],
        tool_choice={"type": "tool", "name": TOOL_NAME},
        messages=[{"role": "user", "content": _render_prompt(post)}],
    )

    tool_input = _extract_tool_input(response)
    try:
        result = EvalResult.model_validate(tool_input)
    except ValidationError as exc:
        raise EvalError(f"judge response failed EvalResult validation: {exc}") from exc

    logger.info(
        "eval: pov=%d format=%d grounding=%d passed=%s",
        result.pov_adherence,
        result.format_adherence,
        result.source_grounding,
        result.passed,
    )
    return result
