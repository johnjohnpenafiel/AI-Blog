from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


AllowedTag = Literal[
    "Voice AI",
    "Pricing & Analytics",
    "CRM",
    "Merchandising",
    "Sales Dev",
    "OT & Infrastructure",
    "Industry Move",
]

# Mirrors taxonomy.STORY_TYPES (kept in sync by test_blog_writer). The post tool
# requires it; Roundups leave it NULL (none of the three fit a week-in-review).
StoryType = Literal[
    "Vendor Launch",
    "Field Report",
    "Industry Move",
]


class GeneratedSource(BaseModel):
    title: str
    url: str
    publisher: str
    published_date: date | None = None


class GeneratedPost(BaseModel):
    title: str = Field(min_length=1)
    slug: str = Field(min_length=1, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    summary: str = Field(min_length=1)
    meta_description: str = Field(min_length=1)
    body: str = Field(min_length=1)
    tags: list[AllowedTag] = Field(min_length=1, max_length=2)
    # Optional on the model so Roundups (built from RoundupDraft) validate without
    # it; the post tool's schema marks it required so fresh-news posts always set it.
    story_type: StoryType | None = None
    sources: list[GeneratedSource] = Field(min_length=1)


class RoundupDraft(BaseModel):
    """Claude's output for a weekly Roundup. No `sources` — the roundup's
    sources are the week's own posts, derived programmatically from the input."""

    title: str = Field(min_length=1)
    slug: str = Field(min_length=1, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    summary: str = Field(min_length=1)
    meta_description: str = Field(min_length=1)
    body: str = Field(min_length=1)
    tags: list[AllowedTag] = Field(min_length=1, max_length=2)
