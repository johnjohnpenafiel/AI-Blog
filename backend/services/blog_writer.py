import json
import logging
import os

import anthropic
from pydantic import ValidationError

from schemas.blog_writer import GeneratedPost
from services.news_fetcher import Article


logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"
MAX_TOKENS = 4096
TOOL_NAME = "submit_post"

# Editorial point of view — threads through every post (PLANNING.md → v2 POV).
POV_BLOCK = """Editorial point of view — operator-first, proof-over-hype:
Write for a dealership operator. Make clear what this development means for
THEIR store — will it make money, save time, or retain customers? Be honest
about whether it actually works versus vendor hype: privilege evidence, real
deployments, and results over announcements and marketing claims."""

# Per-format structure + length. Each format's skeleton doubles as the
# generation spec (see notes/v2-ideas.md Format index). Only the formats we
# generate from fresh news live here; the Roundup uses a different input path.
FORMAT_SPECS: dict[str, dict[str, str]] = {
    "Brief": {
        "length": "200–400 words",
        "structure": (
            "Smart Brevity. Open with a one-sentence 'what's new' lead, then a "
            "bold **Why it matters** line, then 2–4 tight bullets. Scannable — "
            "no long paragraphs."
        ),
    },
    "Deep Dive": {
        "length": "600–900 words",
        "structure": (
            "Multi-source synthesis. Punchy title, a 2–3 sentence summary, then "
            "clear sub-sections with bold sub-heads. Authoritative and slightly "
            "forward-looking."
        ),
    },
}

PROMPT_TEMPLATE = """You are a professional tech journalist writing for an automotive industry blog.

Your audience: dealership operators, automotive tech executives, and industry
observers who want to stay current on AI and operational technology — not car
enthusiasts.

{pov_block}

Using the following articles as source material, write a **{format}**. All
source articles have been pre-filtered to a single dealership section,
visible in each article's `section` field. Keep the post tightly focused on
that section — one tag is the default; use two only when a secondary tag
genuinely applies to the angle you take.

Format — {format}:
- Length: {length}
- Structure: {structure}

Requirements:
- Title: punchy and informative
- Summary: 2–3 sentences
- Body: markdown formatted, no fluff, matching the format above
- Tags: select 1–2 from [Voice AI, Pricing & Analytics, CRM, Merchandising,
  Sales Dev, OT & Infrastructure, Industry Move]
- Sources: list each article used

Articles:
{articles_json}
{feedback_block}
Call the submit_post tool with your finished post."""

FEEDBACK_BLOCK_TEMPLATE = """
Editor revision feedback (apply this when revising the post):
{feedback}
"""


def _build_tool_schema() -> dict:
    schema = GeneratedPost.model_json_schema()
    return {
        "name": TOOL_NAME,
        "description": "Submit the finished blog post for publication.",
        "input_schema": schema,
    }


SUBMIT_POST_TOOL = _build_tool_schema()


class BlogWriterError(Exception):
    """Raised when Claude's response cannot be turned into a valid GeneratedPost."""


def _render_prompt(
    articles: list[Article], fmt: str, feedback: str | None = None
) -> str:
    spec = FORMAT_SPECS[fmt]
    articles_payload = [a.model_dump(mode="json") for a in articles]
    articles_json = json.dumps(articles_payload, indent=2)
    feedback_block = (
        FEEDBACK_BLOCK_TEMPLATE.format(feedback=feedback.strip())
        if feedback and feedback.strip()
        else ""
    )
    return PROMPT_TEMPLATE.format(
        pov_block=POV_BLOCK,
        format=fmt,
        length=spec["length"],
        structure=spec["structure"],
        articles_json=articles_json,
        feedback_block=feedback_block,
    )


def _extract_tool_input(response) -> dict:
    for block in response.content:
        if getattr(block, "type", None) == "tool_use" and block.name == TOOL_NAME:
            return block.input
    raise BlogWriterError(
        f"Claude did not call {TOOL_NAME}; stop_reason={getattr(response, 'stop_reason', None)!r}"
    )


def generate_post(
    articles: list[Article],
    *,
    format: str = "Deep Dive",
    feedback: str | None = None,
) -> GeneratedPost:
    if format not in FORMAT_SPECS:
        raise BlogWriterError(
            f"unsupported format {format!r}; expected one of {sorted(FORMAT_SPECS)}"
        )

    api_key = os.environ["ANTHROPIC_API_KEY"]
    client = anthropic.Anthropic(api_key=api_key)

    prompt = _render_prompt(articles, format, feedback=feedback)
    logger.info(
        "calling Claude (%s) format=%s with %d articles, feedback=%s",
        MODEL,
        format,
        len(articles),
        bool(feedback and feedback.strip()),
    )

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        tools=[SUBMIT_POST_TOOL],
        tool_choice={"type": "tool", "name": TOOL_NAME},
        messages=[{"role": "user", "content": prompt}],
    )

    tool_input = _extract_tool_input(response)

    try:
        post = GeneratedPost.model_validate(tool_input)
    except ValidationError as exc:
        raise BlogWriterError(
            f"Claude response failed GeneratedPost validation: {exc}"
        ) from exc

    logger.info("Claude returned valid post: slug=%s, tags=%s", post.slug, post.tags)
    return post
