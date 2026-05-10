"""cadence twice-weekly: drop schedule_day, update schedule_frequency

Revision ID: 7e4a9f2b1c83
Revises: 9bf3ca7af67f
Create Date: 2026-05-09 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7e4a9f2b1c83"
down_revision: Union[str, None] = "9bf3ca7af67f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("settings", "schedule_day")
    op.execute(
        "UPDATE settings SET schedule_frequency = 'twice_weekly' WHERE id = 1"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE settings SET schedule_frequency = 'biweekly' WHERE id = 1"
    )
    op.add_column(
        "settings",
        sa.Column(
            "schedule_day",
            sa.String(),
            nullable=False,
            server_default="monday",
        ),
    )
    op.alter_column("settings", "schedule_day", server_default=None)
