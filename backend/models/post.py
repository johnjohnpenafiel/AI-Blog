import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, DateTime, Enum, Integer, SmallInteger, String, Text, false, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates

from database import Base
from taxonomy import is_valid_format, is_valid_section, is_valid_story_type

if TYPE_CHECKING:
    from models.source import Source

post_status_enum = Enum(
    "draft",
    "pending_review",
    "accepted",
    "rejected",
    "published",
    name="post_status",
)

publishing_mode_enum = Enum(
    "auto",
    "approve_only",
    name="publishing_mode",
)


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    slug: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    summary: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(
        post_status_enum,
        nullable=False,
        default="draft",
    )
    publishing_mode: Mapped[str] = mapped_column(
        publishing_mode_enum,
        nullable=False,
    )
    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
        default=list,
    )
    scheduled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    published_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    meta_description: Mapped[str] = mapped_column(String, nullable=False)
    generation_attempt: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Editor's choice — the single post pinned to the homepage featured (★) band.
    # At most one row is true at a time (enforced by `set_featured` in
    # services/publisher.py, which clears any prior pin). NOT NULL with a false
    # default so every post has an explicit value; existing rows backfill to
    # false. Drives only the featured band — hero + index stay newest-first.
    is_featured: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default=false(),
    )

    # v2 taxonomy — single-value categorization. Plain text validated against
    # the code-level vocabulary in `taxonomy.py` (not DB enums), so categories
    # can graduate without a migration. Nullable: the pipeline starts setting
    # these in Phase 2 (multi-format-generation); pre-v2 posts are backfilled.
    section: Mapped[str | None] = mapped_column(String, nullable=True)
    format: Mapped[str | None] = mapped_column(String, nullable=True)
    story_type: Mapped[str | None] = mapped_column(String, nullable=True)

    # v2 generation-eval scores (the in-loop Haiku judge). All nullable —
    # NULL means "not scored": pre-eval posts, runs where the fail-soft eval was
    # skipped, and regenerated posts (regen has no source excerpts, so its stale
    # score is cleared rather than re-run source-blind). Each axis is 0–2.
    eval_pov: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    eval_format: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    eval_grounding: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)
    eval_passed: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    eval_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    eval_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    sources: Mapped[list["Source"]] = relationship(
        "Source",
        back_populates="post",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    @validates("section", "format", "story_type")
    def _validate_taxonomy(self, key: str, value: str | None) -> str | None:
        """Reject out-of-vocabulary values on assignment. Fires on Python
        assignment, not on DB load — so backfilled rows are never re-checked."""
        if value is None:
            return value
        checker = {
            "section": is_valid_section,
            "format": is_valid_format,
            "story_type": is_valid_story_type,
        }[key]
        if not checker(value):
            raise ValueError(f"unknown {key}: {value!r}")
        return value
