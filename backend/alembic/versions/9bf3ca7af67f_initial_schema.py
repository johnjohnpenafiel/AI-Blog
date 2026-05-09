"""initial schema

Revision ID: 9bf3ca7af67f
Revises:
Create Date: 2026-05-09 05:04:13.936905

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "9bf3ca7af67f"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


post_status = postgresql.ENUM(
    "draft",
    "pending_review",
    "accepted",
    "rejected",
    "published",
    name="post_status",
    create_type=False,
)
publishing_mode = postgresql.ENUM(
    "auto",
    "approve_only",
    name="publishing_mode",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()
    post_status.create(bind, checkfirst=True)
    publishing_mode.create(bind, checkfirst=True)

    op.create_table(
        "posts",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("summary", sa.String(), nullable=False),
        sa.Column("status", post_status, nullable=False),
        sa.Column("publishing_mode", publishing_mode, nullable=False),
        sa.Column("tags", postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column("scheduled_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("meta_description", sa.String(), nullable=False),
        sa.Column("generation_attempt", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_posts_slug"), "posts", ["slug"], unique=True)

    op.create_table(
        "settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("publishing_mode", publishing_mode, nullable=False),
        sa.Column("schedule_day", sa.String(), nullable=False),
        sa.Column("schedule_frequency", sa.String(), nullable=False),
        sa.Column("last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("next_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "sources",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("post_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("url", sa.String(), nullable=False),
        sa.Column("publisher", sa.String(), nullable=False),
        sa.Column("published_date", sa.Date(), nullable=True),
        sa.ForeignKeyConstraint(["post_id"], ["posts.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_sources_post_id"), "sources", ["post_id"], unique=False)

    op.execute(
        """
        INSERT INTO settings (id, publishing_mode, schedule_day, schedule_frequency)
        VALUES (1, 'approve_only', 'monday', 'biweekly')
        """
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_sources_post_id"), table_name="sources")
    op.drop_table("sources")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")
    op.drop_table("settings")
    op.drop_index(op.f("ix_posts_slug"), table_name="posts")
    op.drop_table("posts")

    bind = op.get_bind()
    publishing_mode.drop(bind, checkfirst=True)
    post_status.drop(bind, checkfirst=True)
