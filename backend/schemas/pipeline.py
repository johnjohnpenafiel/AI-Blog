from datetime import datetime
from typing import Annotated, Literal, Union
from uuid import UUID

from pydantic import BaseModel, Field


class PipelineRunRequest(BaseModel):
    """Optional body for POST /pipeline/run. Manual runs default to Deep Dive."""

    format: Literal["Brief", "Deep Dive"] = "Deep Dive"


class PipelineRunSuccess(BaseModel):
    skipped: Literal[False] = False
    post_id: UUID
    slug: str
    status: str
    publishing_mode: str
    published_at: datetime | None = None


class PipelineRunSkipped(BaseModel):
    skipped: Literal[True] = True
    reason: str
    article_count: int


PipelineRunResponse = Annotated[
    Union[PipelineRunSuccess, PipelineRunSkipped],
    Field(discriminator="skipped"),
]


class PipelineStatusResponse(BaseModel):
    last_run_at: datetime | None = None
    next_run_at: datetime | None = None
    state: Literal["idle", "running"]
