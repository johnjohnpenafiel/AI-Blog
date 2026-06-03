"""Promo-vs-news content classifier (open-canvas safety gate).

Replaces the brittle domain allowlist with a judgment about what an article
*is*. One cheap Haiku call scores a batch of articles: ``is_news`` (drop
vendor promo / marketing / SEO filler) and an operator-relevance
``importance`` (0-2) used to rank topics. Judged through the editorial POV:
"what would a dealership operator most need to know," not media buzz.

Fail-open: if the classifier errors or omits an article, that article is
treated as news with importance 1 — we'd rather let a real story through
than silently drop the whole run on a transient API hiccup. The ≥3-article
threshold and the human review queue are the backstops.
"""
import json
import logging
import os
from typing import TYPE_CHECKING

import anthropic

from schemas.classifier import ArticleVerdict, ClassifierVerdicts

if TYPE_CHECKING:
    from services.news_fetcher import Article

logger = logging.getLogger(__name__)

MODEL = "claude-haiku-4-5-20251001"
MAX_TOKENS = 4096
TOOL_NAME = "submit_verdicts"

PROMPT_TEMPLATE = """You are a strict news editor for a blog about AI and \
operational technology in car dealerships. Your readers are dealership \
operators and automotive-tech executives who are tired of vendor hype.

For each article below, decide two things:

1. is_news — true only if it is genuine reporting (news, analysis, a field \
report, a funding/M&A item). false if it is a vendor product/marketing page, \
a press release written to sell, SEO filler, or a how-we-do-it promo.

2. importance — operator-relevance, NOT media buzz:
   - 2: a real, material development a dealership operator must know (broad \
coverage, a notable funding/acquisition, a capability that changes operations).
   - 1: useful but routine.
   - 0: marginal or thin.

Articles (index, title, publisher, snippet):
{articles_block}

Call {tool_name} with one verdict per article, echoing each article's url."""


def _build_tool_schema() -> dict:
    return {
        "name": TOOL_NAME,
        "description": "Submit one verdict per article.",
        "input_schema": ClassifierVerdicts.model_json_schema(),
    }


SUBMIT_VERDICTS_TOOL = _build_tool_schema()


def _render_prompt(articles: list["Article"]) -> str:
    lines = []
    for i, a in enumerate(articles):
        snippet = (a.snippet or "").strip().replace("\n", " ")[:300]
        lines.append(
            f"[{i}] url={a.url} | {a.title} | {a.publisher} | {snippet}"
        )
    return PROMPT_TEMPLATE.format(
        articles_block="\n".join(lines), tool_name=TOOL_NAME
    )


def _extract_tool_input(response) -> dict | None:
    for block in response.content:
        if getattr(block, "type", None) == "tool_use" and block.name == TOOL_NAME:
            return block.input
    return None


def classify_articles(articles: list["Article"]) -> dict[str, ArticleVerdict]:
    """Return {url: ArticleVerdict}. Fail-open on any error (see module docs)."""
    if not articles:
        return {}

    def _fallback() -> dict[str, ArticleVerdict]:
        return {
            a.url: ArticleVerdict(url=a.url, is_news=True, importance=1)
            for a in articles
        }

    try:
        client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
        response = client.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            tools=[SUBMIT_VERDICTS_TOOL],
            tool_choice={"type": "tool", "name": TOOL_NAME},
            messages=[{"role": "user", "content": _render_prompt(articles)}],
        )
        tool_input = _extract_tool_input(response)
        if tool_input is None:
            logger.warning("classifier did not call %s — failing open", TOOL_NAME)
            return _fallback()
        parsed = ClassifierVerdicts.model_validate(tool_input)
    except (anthropic.AnthropicError, json.JSONDecodeError, ValueError) as exc:
        logger.warning("classifier error (%s) — failing open", exc)
        return _fallback()

    by_url = {v.url: v for v in parsed.verdicts}
    # Fill any article the model skipped (fail-open per-article).
    for a in articles:
        by_url.setdefault(a.url, ArticleVerdict(url=a.url, is_news=True, importance=1))
    return by_url
