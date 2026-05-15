from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


AllowedTag = Literal[
    "Voice AI",
    "Pricing & Analytics",
    "CRM",
    "Merchandising",
    "Sales Dev",
    "OT & Infrastructure",
    "Industry Move",
]


class GeneratedSource(BaseModel):
    title: str
    url: str
    publisher: str
    published_date: date | None = None


class GeneratedPost(BaseModel):
    title: str = Field(min_length=1)
    slug: str = Field(min_length=1, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    summary: str = Field(min_length=1)
    meta_description: str = Field(min_length=1)
    body: str = Field(min_length=1)
    tags: list[AllowedTag] = Field(min_length=2, max_length=4)
    sources: list[GeneratedSource] = Field(min_length=1)
