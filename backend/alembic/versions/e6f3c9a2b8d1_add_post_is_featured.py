"""add post is_featured column

Revision ID: e6f3c9a2b8d1
Revises: d5e2b8c4a1f9
Create Date: 2026-06-09 00:00:00.000000

Adds the editor's-choice featured flag. NOT NULL with a server_default of false
so existing rows backfill to "not featured" and every future insert has an
explicit value. At most one row is true at a time, enforced in application code
(services/publisher.py `set_featured`), not by a DB constraint.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e6f3c9a2b8d1"
down_revision: Union[str, None] = "d5e2b8c4a1f9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "posts",
        sa.Column(
            "is_featured",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("posts", "is_featured")
