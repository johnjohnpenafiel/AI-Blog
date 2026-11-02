import secrets
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

subscriber_status_enum = Enum(
    "pending",
    "active",
    "unsubscribed",
    name="subscriber_status",
)


def new_token() -> str:
    """URL-safe random token for confirm / unsubscribe links (256 bits)."""
    return secrets.token_urlsafe(32)


class Subscriber(Base):
    """An email-newsletter reader. Double opt-in: a row starts `pending` and
    only becomes `active` (eligible for post emails) once the confirm link is
    clicked. Unsubscribing keeps the row (status `unsubscribed`) so a later
    re-signup reuses it instead of creating a duplicate."""

    __tablename__ = "subscribers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    # Stored lowercased + trimmed (normalized in the subscribe route) so the
    # unique constraint catches case-variant duplicates.
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False, index=True)
    status: Mapped[str] = mapped_column(
        subscriber_status_enum,
        nullable=False,
        default="pending",
    )
    # Single-use: cleared once the subscriber confirms.
    confirm_token: Mapped[str | None] = mapped_column(
        String, unique=True, nullable=True, default=new_token
    )
    # Long-lived: embedded in every post email's unsubscribe link.
    unsubscribe_token: Mapped[str] = mapped_column(
        String, unique=True, nullable=False, default=new_token
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    confirmed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    unsubscribed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
