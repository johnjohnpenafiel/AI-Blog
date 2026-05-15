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

PROMPT_TEMPLATE = """You are a professional tech journalist writing for an automotive industry blog.

Your audience: dealership operators, automotive tech executives, and industry
observers who want to stay current on AI and operational technology — not car
enthusiasts.

Using the following articles as source material, write a blog post.

Requirements:
- Title: punchy and informative
- Summary: 2–3 sentences
- Body: 600–900 words, markdown formatted, no fluff
- Tone: authoritative, clear, slightly forward-looking
- Tags: select 2–4 from [Voice AI, Pricing & Analytics, CRM, Merchandising,
  Sales Dev, OT & Infrastructure, Industry Move]
- Sources: list each article used

Articles:
{articles_json}

Call the submit_post tool with your finished post."""


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


def _render_prompt(articles: list[Article]) -> str:
    articles_payload = [a.model_dump(mode="json") for a in articles]
    articles_json = json.dumps(articles_payload, indent=2)
    return PROMPT_TEMPLATE.format(articles_json=articles_json)


def _extract_tool_input(response) -> dict:
    for block in response.content:
        if getattr(block, "type", None) == "tool_use" and block.name == TOOL_NAME:
            return block.input
    raise BlogWriterError(
        f"Claude did not call {TOOL_NAME}; stop_reason={getattr(response, 'stop_reason', None)!r}"
    )


def generate_post(articles: list[Article]) -> GeneratedPost:
    api_key = os.environ["ANTHROPIC_API_KEY"]
    client = anthropic.Anthropic(api_key=api_key)

    prompt = _render_prompt(articles)
    logger.info("calling Claude (%s) with %d articles", MODEL, len(articles))

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
