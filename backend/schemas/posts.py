"""Pydantic schemas for the /posts endpoints."""
import uuid
from datetime import date, datetime, timezone
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator

from taxonomy import (
    is_valid_format,
    is_valid_section,
    is_valid_story_type,
    is_valid_tag,
)


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
    section: str | None = None
    format: str | None = None
    story_type: str | None = None
    status: PostStatus
    created_at: datetime
    scheduled_at: datetime | None = None
    published_at: datetime | None = None
    generation_attempt: int
    # Editor's choice — true on the single post pinned to the homepage featured
    # band. Drives the dashboard FEATURE/FEATURED toggle + header readout.
    is_featured: bool = False
    # Generation-eval scores (0–2 each; None = not scored). Enough for the card
    # badge; the explanatory `eval_notes` lives on the detail shape (PostOut).
    eval_pov: int | None = None
    eval_format: int | None = None
    eval_grounding: int | None = None
    eval_passed: bool | None = None


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
    section: str | None = None
    format: str | None = None
    story_type: str | None = None
    status: PostStatus
    publishing_mode: PublishingMode
    scheduled_at: datetime | None
    published_at: datetime | None
    created_at: datetime
    updated_at: datetime
    generation_attempt: int
    is_featured: bool = False
    eval_pov: int | None = None
    eval_format: int | None = None
    eval_grounding: int | None = None
    eval_passed: bool | None = None
    eval_notes: str | None = None
    eval_at: datetime | None = None
    sources: list[PostSourceOut] = Field(default_factory=list)


class PostListResponse(BaseModel):
    items: list[PostListItem]
    total: int


def _validate_future_aware(value: datetime) -> datetime:
    if value.tzinfo is None or value.tzinfo.utcoffset(value) is None:
        raise ValueError("scheduled_at must be timezone-aware")
    if value <= datetime.now(timezone.utc):
        raise ValueError("scheduled_at must be in the future")
    return value


class AcceptRequest(BaseModel):
    """Body for POST /posts/{id}/accept. Empty body = publish now."""

    scheduled_at: datetime | None = None

    @field_validator("scheduled_at")
    @classmethod
    def _must_be_future_aware(cls, value: datetime | None) -> datetime | None:
        if value is None:
            return value
        return _validate_future_aware(value)


class RescheduleRequest(BaseModel):
    """Body for POST /posts/{id}/reschedule. scheduled_at is required."""

    scheduled_at: datetime

    @field_validator("scheduled_at")
    @classmethod
    def _must_be_future_aware(cls, value: datetime) -> datetime:
        return _validate_future_aware(value)


class RegenerateRequest(BaseModel):
    feedback: str | None = Field(default=None, max_length=2000)


class PostTaxonomyIn(BaseModel):
    """Write-path validation for the v2 taxonomy fields. Mirrors the model's
    `@validates` guards at the API boundary, against the code-level vocabulary
    in `taxonomy.py`. All optional — a partial assignment is allowed."""

    section: str | None = None
    format: str | None = None
    story_type: str | None = None
    tags: list[str] | None = None

    @field_validator("section")
    @classmethod
    def _check_section(cls, value: str | None) -> str | None:
        if value is not None and not is_valid_section(value):
            raise ValueError(f"unknown section: {value!r}")
        return value

    @field_validator("format")
    @classmethod
    def _check_format(cls, value: str | None) -> str | None:
        if value is not None and not is_valid_format(value):
            raise ValueError(f"unknown format: {value!r}")
        return value

    @field_validator("story_type")
    @classmethod
    def _check_story_type(cls, value: str | None) -> str | None:
        if value is not None and not is_valid_story_type(value):
            raise ValueError(f"unknown story_type: {value!r}")
        return value

    @field_validator("tags")
    @classmethod
    def _check_tags(cls, value: list[str] | None) -> list[str] | None:
        if value is None:
            return value
        unknown = [t for t in value if not is_valid_tag(t)]
        if unknown:
            raise ValueError(f"unknown tag(s): {unknown!r}")
        return value
