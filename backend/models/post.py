import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base

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

    sources: Mapped[list["Source"]] = relationship(
        "Source",
        back_populates="post",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
