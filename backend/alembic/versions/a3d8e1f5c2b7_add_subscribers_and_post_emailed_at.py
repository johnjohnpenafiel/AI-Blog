"""add subscribers table and post emailed_at column

Revision ID: a3d8e1f5c2b7
Revises: f7a1c9d3e2b4
Create Date: 2026-11-02 00:00:00.000000

Email subscriptions (feature-plans/email-subscriptions.md). Creates the
`subscribers` table (double opt-in: pending → active → unsubscribed) and adds
`posts.emailed_at`, which the subscriber-email scheduler job uses to send each
published post exactly once.

Backfill: every post already `published` gets `emailed_at` stamped, so turning
the feature on never emails the back catalog to new subscribers. Posts still
queued/accepted at migration time stay NULL — they'll email when they publish.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "a3d8e1f5c2b7"
down_revision: Union[str, None] = "f7a1c9d3e2b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "subscribers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column(
            "status",
            sa.Enum("pending", "active", "unsubscribed", name="subscriber_status"),
            nullable=False,
        ),
        sa.Column("confirm_token", sa.String(), nullable=True),
        sa.Column("unsubscribe_token", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("unsubscribed_at", sa.DateTime(timezone=True), nullable=True),
        sa.UniqueConstraint("confirm_token"),
        sa.UniqueConstraint("unsubscribe_token"),
    )
    op.create_index("ix_subscribers_email", "subscribers", ["email"], unique=True)

    op.add_column(
        "posts",
        sa.Column("emailed_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute(
        "UPDATE posts SET emailed_at = COALESCE(published_at, now()) "
        "WHERE status = 'published'"
    )


def downgrade() -> None:
    op.drop_column("posts", "emailed_at")
    op.drop_index("ix_subscribers_email", table_name="subscribers")
    op.drop_table("subscribers")
    sa.Enum(name="subscriber_status").drop(op.get_bind(), checkfirst=True)
