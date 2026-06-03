"""add post taxonomy fields: section, format, story_type + backfill

Revision ID: c4f1a2b3d6e7
Revises: 7e4a9f2b1c83
Create Date: 2026-06-03 00:00:00.000000

Adds the v2 single-value categorization columns and backfills pre-v2 posts:
- ``section``    mapped from the legacy topic tag (default Customer Experience)
- ``format``     defaulted to Deep Dive (pre-v2 posts were deep-dive shaped)
- ``story_type`` relocated from the legacy ``Industry Move`` tag, which is
  then removed from ``tags``

Forward-only in spirit: ``downgrade`` drops the columns but does not restore
the relocated ``Industry Move`` tag.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c4f1a2b3d6e7"
down_revision: Union[str, None] = "7e4a9f2b1c83"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("posts", sa.Column("section", sa.String(), nullable=True))
    op.add_column("posts", sa.Column("format", sa.String(), nullable=True))
    op.add_column("posts", sa.Column("story_type", sa.String(), nullable=True))

    # Map the legacy topic tag -> v2 section; default for anything unmapped.
    op.execute(
        """
        UPDATE posts SET section = CASE
            WHEN 'Voice AI' = ANY(tags) THEN 'Customer Experience'
            WHEN 'CRM' = ANY(tags) THEN 'CRM & Marketing'
            WHEN 'Merchandising' = ANY(tags) THEN 'Inventory & Merchandising'
            WHEN 'Pricing & Analytics' = ANY(tags) THEN 'Pricing & Analytics'
            WHEN 'Sales Dev' = ANY(tags) THEN 'Sales & Lead Gen / BDC'
            WHEN 'OT & Infrastructure' = ANY(tags) THEN 'Back Office / DMS & Infrastructure'
            ELSE 'Customer Experience'
        END
        WHERE section IS NULL
        """
    )

    # Pre-v2 posts were ~600-900w deep-dive shaped.
    op.execute("UPDATE posts SET format = 'Deep Dive' WHERE format IS NULL")

    # 'Industry Move' was never a topic — it's a story type. Relocate it.
    op.execute(
        "UPDATE posts SET story_type = 'Industry Move' "
        "WHERE 'Industry Move' = ANY(tags)"
    )
    op.execute(
        "UPDATE posts SET tags = array_remove(tags, 'Industry Move') "
        "WHERE 'Industry Move' = ANY(tags)"
    )


def downgrade() -> None:
    op.drop_column("posts", "story_type")
    op.drop_column("posts", "format")
    op.drop_column("posts", "section")
