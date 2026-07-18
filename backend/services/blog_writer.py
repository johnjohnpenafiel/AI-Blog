import json
import logging
import os

import anthropic
from pydantic import ValidationError

from schemas.blog_writer import GeneratedPost, GeneratedSource, RoundupDraft
from services.news_fetcher import Article
from taxonomy import STORY_TYPES


logger = logging.getLogger(__name__)

# claude-sonnet-4-20250514 was retired by Anthropic (404 as of 2026-07-06, killed
# the Mon Jul 6 scheduled run). claude-sonnet-5 is the designated replacement;
# no dated snapshot exists for it, so we pin the bare alias.
MODEL = "claude-sonnet-5"
MAX_TOKENS = 4096

# Sonnet 5 runs adaptive thinking by default when `thinking` is omitted; Sonnet 4
# ran without thinking. Disable it explicitly so behavior (and the max_tokens
# budget, which thinking would share) stays what the pipeline was tuned for.
# Sent via extra_body: the pinned anthropic==0.40.0 predates the typed
# `thinking` kwarg (passing it raises TypeError), but extra_body merges raw
# fields into the request JSON, which the API accepts fine.
THINKING_BODY = {"thinking": {"type": "disabled"}}
TOOL_NAME = "submit_post"

# Editorial point of view — threads through every post (PLANNING.md → v2 POV).
POV_BLOCK = """Editorial point of view — operator-first, proof-over-hype:
Write for a dealership operator. Make clear what this development means for
THEIR store — will it make money, save time, or retain customers? Be honest
about whether it actually works versus vendor hype: privilege evidence, real
deployments, and results over announcements and marketing claims."""

# Title spec — shared by the fresh-news and Roundup prompts. The title does
# three jobs: inform the reader, seed the cover-image art director (which
# derives its visual metaphor from title+summary — abstract titles produce
# generic covers), and carry the site's voice. Prompt-tested against an
# LLM-judge rubric (representation / image-support / voice, pass = all >= 4/5):
# the old one-liner ("punchy and informative") scored 0% pass; this spec scored
# 91% across two independent runs. See the 2026-07-18 decision-log entry.
TITLE_SPEC = """- Title — the title does three jobs at once; it fails unless it does all three:
  1. TELL THE STORY. A reader must know what happened and why it matters to
     their store without opening the post. Specific beats clever.
  2. FEED THE COVER ARTIST. An AI illustrator draws this post's cover from the
     title. Give it something drawable: a concrete object, a physical scene, or
     a collision of two concrete things. BANNED words: "revolution",
     "game-changer", "transformation", "reshaping", "the future of",
     "the rise of", "unleash", "landscape".
  3. SOUND LIKE US. Dry, operator-skeptical wit — a sharp colleague leaning on
     the service counter, not a press release. Sarcastic when vendors
     overpromise; genuinely impressed only when there's proof. Plain words,
     short clauses.

  Titles in our voice (style reference only — never reuse or imitate closely):
  - "Everyone Bought the AI. Nobody Wired It Together."
  - "The Phone Picks Up on the First Ring Now. It Isn't a Person."
  - "Your Used-Car Photos Took Three Days. The Robot Took Lunch."
  Notice the pattern: concrete nouns doing things (phones, photos, wiring),
  a twist or tension, no buzzwords, wit that comes from the situation itself.

  Hard rules:
  - At least one PHYSICAL, drawable object from the dealership world must
    appear in the title (a phone, keys, a lift, a sticker, a lot, a letter,
    a folder, a camera, a service bay...). Percentages, dollar figures, and
    company names are NOT drawable — if you use one, pair it with a physical
    object that carries the image.
  - If the post is a Roundup, the title must evoke the whole week's
    through-line, not just its single biggest story.
  - Vary the structure. The two-beat snap ("X did this. Y didn't.") is one
    tool, not the house formula — single-clause titles with a twist are just
    as welcome. Across many posts, titles should not all sound alike.

  Before submitting, verify — rewrite the title if any check fails:
  (a) Is there a physical, drawable object in the title, and is it the one
      DOING or RECEIVING the main action? The image lives in what the object
      does or what happens to it (letters landing on a desk, a phone answering
      itself, a sticker peeling off) — not in a decorative mention. A
      percentage or company name never counts. Never OPEN the title with a
      number.
  (b) If this is a Roundup: does the title span the week's through-line
      rather than one story?
  (c) Would a dealership operator know what happened from the title alone?"""

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
{title_spec}
- Summary: 2–3 sentences
- Body: markdown formatted, no fluff, matching the format above
- Tags: select 1–2 from [Voice AI, Pricing & Analytics, CRM, Merchandising,
  Sales Dev, OT & Infrastructure, Industry Move]
- Story type: classify the post as exactly one of:
    - "Vendor Launch" — a company announces or ships an AI product or feature.
    - "Field Report" — a real dealership using a tool, with results or evidence
      ("does it actually work"). This is the proof-over-hype signal.
    - "Industry Move" — funding, M&A, partnerships, earnings, or market shifts.
  Pick the single best fit for the dominant angle of the post.
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
    # story_type is optional on the model (so Roundups validate without it), but
    # for a fresh-news post we want Claude to always classify it — override the
    # property to a plain required enum sourced from the canonical taxonomy.
    schema["properties"]["story_type"] = {
        "type": "string",
        "enum": list(STORY_TYPES),
        "description": "What kind of event this post is.",
    }
    required = schema.setdefault("required", [])
    if "story_type" not in required:
        required.append("story_type")
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
        title_spec=TITLE_SPEC,
        format=fmt,
        length=spec["length"],
        structure=spec["structure"],
        articles_json=articles_json,
        feedback_block=feedback_block,
    )


def _extract_tool_input(response, tool_name: str = TOOL_NAME) -> dict:
    for block in response.content:
        if getattr(block, "type", None) == "tool_use" and block.name == tool_name:
            return block.input
    raise BlogWriterError(
        f"Claude did not call {tool_name}; stop_reason={getattr(response, 'stop_reason', None)!r}"
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
        extra_body=THINKING_BODY,
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

    logger.info(
        "Claude returned valid post: slug=%s, tags=%s, story_type=%s",
        post.slug,
        post.tags,
        post.story_type,
    )
    return post


ROUNDUP_TOOL_NAME = "submit_roundup"

ROUNDUP_PROMPT_TEMPLATE = """You are the editor of a blog covering AI and \
operational technology in car dealerships, writing the weekly roundup.

Your audience: dealership operators and automotive-tech executives.

{pov_block}

Below are the posts published this week. Write a Roundup (~500–600 words, \
markdown) that ties them together. Structure:
- A short through-line intro framing the week.
- **The Big Story** — the single most important item, and why it matters to a store.
- **Also This Week** — tight bullets for the rest, each tagged with its section.
- **Worth Watching** — a forward-looking line or two.

Requirements:
{title_spec}
- Summary: 2–3 sentences.
- Tags: select 1–2 from [Voice AI, Pricing & Analytics, CRM, Merchandising,
  Sales Dev, OT & Infrastructure, Industry Move].

This week's posts:
{posts_json}

Call the submit_roundup tool with your finished roundup."""


def _build_roundup_tool_schema() -> dict:
    return {
        "name": ROUNDUP_TOOL_NAME,
        "description": "Submit the finished weekly roundup.",
        "input_schema": RoundupDraft.model_json_schema(),
    }


SUBMIT_ROUNDUP_TOOL = _build_roundup_tool_schema()


def generate_roundup(posts: list[dict]) -> GeneratedPost:
    """Generate the weekly Roundup from the week's published posts.

    `posts` is a list of dicts with keys title, summary, section, slug. The
    roundup's sources are derived from those posts (links to /blog/{slug}) —
    Claude only writes the prose.
    """
    if not posts:
        raise BlogWriterError("generate_roundup called with no posts")

    api_key = os.environ["ANTHROPIC_API_KEY"]
    client = anthropic.Anthropic(api_key=api_key)

    prompt = ROUNDUP_PROMPT_TEMPLATE.format(
        pov_block=POV_BLOCK,
        title_spec=TITLE_SPEC,
        posts_json=json.dumps(posts, indent=2),
    )
    logger.info("calling Claude (%s) for weekly roundup of %d posts", MODEL, len(posts))

    response = client.messages.create(
        model=MODEL,
        max_tokens=MAX_TOKENS,
        extra_body=THINKING_BODY,
        tools=[SUBMIT_ROUNDUP_TOOL],
        tool_choice={"type": "tool", "name": ROUNDUP_TOOL_NAME},
        messages=[{"role": "user", "content": prompt}],
    )

    tool_input = _extract_tool_input(response, ROUNDUP_TOOL_NAME)
    try:
        draft = RoundupDraft.model_validate(tool_input)
    except ValidationError as exc:
        raise BlogWriterError(
            f"Claude roundup failed RoundupDraft validation: {exc}"
        ) from exc

    sources = [
        GeneratedSource(
            title=p["title"],
            url=f"/blog/{p['slug']}",
            publisher="The Garage AI",
        )
        for p in posts
    ]
    logger.info("Claude returned valid roundup: slug=%s", draft.slug)
    return GeneratedPost(**draft.model_dump(), sources=sources)
