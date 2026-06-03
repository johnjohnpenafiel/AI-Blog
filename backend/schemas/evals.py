"""Schema for the generation quality eval (LLM-judge)."""
from pydantic import BaseModel, Field


class EvalResult(BaseModel):
    """A judge's score of one generated post. Each axis is 0 (bad) to 2 (good)."""

    pov_adherence: int = Field(ge=0, le=2)
    format_adherence: int = Field(ge=0, le=2)
    source_grounding: int = Field(ge=0, le=2)
    passed: bool
    notes: str = ""
