"""Pydantic schemas for the /posts endpoints."""
import uuid
from datetime import date, datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator


PostStatus = Literal[
    "draft",
    "pending_review",
    "accepted",
    "rejected",
    "published",
]

PublishingMode = Literal["auto", "approve_only"]


class PostSourceOut(BaseModel):
    """A source row attached to a post."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    title: str
    url: str
    publisher: str
    published_date: date | None = None


class PostListItem(BaseModel):
    """Lightweight post shape for list responses — no body, no sources."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    summary: str
    tags: list[str]
    status: PostStatus
    created_at: datetime
    generation_attempt: int


class PostOut(BaseModel):
    """Full post detail, including content and sources."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    summary: str
    meta_description: str
    content: str
    tags: list[str]
    status: PostStatus
    publishing_mode: PublishingMode
    scheduled_at: datetime | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    generation_attempt: int
    sources: list[PostSourceOut] = Field(default_factory=list)


class PostListResponse(BaseModel):
    items: list[PostListItem]
    total: int


class AcceptRequest(BaseModel):
    """Body for POST /posts/{id}/accept. Empty body = publish now."""

    scheduled_at: datetime | None = None

    @field_validator("scheduled_at")
    @classmethod
    def _must_be_future_aware(cls, value: datetime | None) -> datetime | None:
        if value is None:
            return value
        if value.tzinfo is None or value.tzinfo.utcoffset(value) is None:
            raise ValueError("scheduled_at must be timezone-aware")
        if value <= datetime.now(timezone.utc):
            raise ValueError("scheduled_at must be in the future")
        return value


class RegenerateRequest(BaseModel):
    feedback: str | None = Field(default=None, max_length=2000)
