"""add post image_url column

Revision ID: f7a1c9d3e2b4
Revises: e6f3c9a2b8d1
Create Date: 2026-07-06 00:00:00.000000

Adds the AI-generated cover image URL set by the pipeline's image step
(fal.ai/Recraft). Nullable with no default — pre-feature posts and any run where
the fail-soft image step failed stay NULL, and the UI renders a placeholder.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f7a1c9d3e2b4"
down_revision: Union[str, None] = "e6f3c9a2b8d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "posts",
        sa.Column("image_url", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("posts", "image_url")
