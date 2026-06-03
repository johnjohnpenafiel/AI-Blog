"""Schemas for the content classifier (promo-vs-news + importance)."""
from pydantic import BaseModel, Field


class ArticleVerdict(BaseModel):
    """One article's classification.

    `is_news` gates promotional / marketing / SEO-filler content out (the
    open-canvas replacement for the domain allowlist). `importance` is an
    operator-relevance score — 0 low, 1 medium, 2 high — used to rank which
    topic a run should cover (proof-over-hype, not media buzz).
    """

    url: str
    is_news: bool
    importance: int = Field(ge=0, le=2)


class ClassifierVerdicts(BaseModel):
    verdicts: list[ArticleVerdict]
