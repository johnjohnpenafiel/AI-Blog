from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from database import Base
from models.post import publishing_mode_enum


class Setting(Base):
    __tablename__ = "settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    publishing_mode: Mapped[str] = mapped_column(
        publishing_mode_enum,
        nullable=False,
        default="approve_only",
    )
    schedule_day: Mapped[str] = mapped_column(String, nullable=False, default="monday")
    schedule_frequency: Mapped[str] = mapped_column(
        String,
        nullable=False,
        default="biweekly",
    )
    last_run_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    next_run_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
