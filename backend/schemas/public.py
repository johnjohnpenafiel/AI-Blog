"""Pydantic schemas for the public-facing /public/* endpoints.

Distinct from `schemas/posts.py` (admin) because the public surface omits
admin-only fields (status, publishing_mode, generation_attempt, scheduled_at,
content, meta_description) and adds a derived `read_time_minutes`.
"""
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class PublicPostListItem(BaseModel):
    """Lightweight published-post shape for the public blog index."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    summary: str
    tags: list[str]
    published_at: datetime
    read_time_minutes: int


class PublicPostListResponse(BaseModel):
    items: list[PublicPostListItem]
    total: int
