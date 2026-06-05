"""add post generation-eval score columns

Revision ID: d5e2b8c4a1f9
Revises: c4f1a2b3d6e7
Create Date: 2026-06-05 00:00:00.000000

Persists the in-loop generation-eval result on each post so the score is part
of the content record (queryable, shown in the dashboard). All columns are
nullable: NULL means "not scored" — pre-eval posts, runs where the fail-soft
eval was skipped, and regenerated posts (regen has no source excerpts to score
against, so its score is cleared). No backfill.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d5e2b8c4a1f9"
down_revision: Union[str, None] = "c4f1a2b3d6e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("posts", sa.Column("eval_pov", sa.SmallInteger(), nullable=True))
    op.add_column("posts", sa.Column("eval_format", sa.SmallInteger(), nullable=True))
    op.add_column(
        "posts", sa.Column("eval_grounding", sa.SmallInteger(), nullable=True)
    )
    op.add_column("posts", sa.Column("eval_passed", sa.Boolean(), nullable=True))
    op.add_column("posts", sa.Column("eval_notes", sa.Text(), nullable=True))
    op.add_column(
        "posts", sa.Column("eval_at", sa.DateTime(timezone=True), nullable=True)
    )


def downgrade() -> None:
    op.drop_column("posts", "eval_at")
    op.drop_column("posts", "eval_notes")
    op.drop_column("posts", "eval_passed")
    op.drop_column("posts", "eval_grounding")
    op.drop_column("posts", "eval_format")
    op.drop_column("posts", "eval_pov")
