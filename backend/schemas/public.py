"""Pydantic schemas for the public-facing /public/* endpoints.

Distinct from `schemas/posts.py` (admin) because the public surface omits
admin-only fields (status, publishing_mode, generation_attempt, scheduled_at,
content, meta_description) and adds a derived `read_time_minutes`.
"""
import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict


class PublicPostListItem(BaseModel):
    """Lightweight published-post shape for the public blog index."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    summary: str
    tags: list[str]
    section: str | None = None
    format: str | None = None
    published_at: datetime
    read_time_minutes: int


class PublicPostListResponse(BaseModel):
    items: list[PublicPostListItem]
    total: int


class PublicFeaturedPost(PublicPostListItem):
    """The homepage featured-band post. Same shape as a list item, plus a flag
    telling the band whether this is a real editor's-choice pin (`true`) or the
    most-recent fallback shown when nothing is pinned (`false`)."""

    is_featured: bool


class PublicPostSource(BaseModel):
    """Single source citation on a published post."""

    model_config = ConfigDict(from_attributes=True)

    title: str
    url: str
    publisher: str
    published_date: date | None


class PublicPostDetail(BaseModel):
    """Full published-post shape for the individual post page."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    summary: str
    meta_description: str
    content: str
    tags: list[str]
    section: str | None = None
    format: str | None = None
    published_at: datetime
    read_time_minutes: int
    sources: list[PublicPostSource]
