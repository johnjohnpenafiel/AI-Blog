"""Pydantic schemas for the /settings endpoints."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from schemas.posts import PublishingMode


class SettingsOut(BaseModel):
    """Current global settings row."""

    model_config = ConfigDict(from_attributes=True)

    publishing_mode: PublishingMode
    schedule_frequency: str
    last_run_at: datetime | None = None
    next_run_at: datetime | None = None


class SettingsUpdate(BaseModel):
    """Partial update body. Only `publishing_mode` is admin-editable;
    `schedule_frequency` is hardcoded and `last_run_at`/`next_run_at` are
    owned by the pipeline."""

    publishing_mode: PublishingMode | None = None
