"""Pipeline orchestrator: news_fetcher -> blog_writer -> persist -> route.

Single entry point `run_pipeline(db)` used by both the manual trigger
(`POST /pipeline/run`) and the scheduler cron (next feature). The whole
run is one DB transaction: either we end up with Post + Sources + an
updated `settings.last_run_at`, or none of it.
"""
import logging
from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from models import Post, Setting, Source
from schemas.blog_writer import GeneratedPost
from services import publisher
from services.blog_writer import generate_post
from services.news_fetcher import fetch_qualifying_articles

logger = logging.getLogger(__name__)


@dataclass
class PipelineSkipResult:
    reason: str
    article_count: int


@dataclass
class PipelineSuccessResult:
    post: Post


PipelineResult = PipelineSkipResult | PipelineSuccessResult


def persist_generated_post(
    db: Session,
    generated: GeneratedPost,
    *,
    mode: str,
    attempt: int = 1,
    section: str | None = None,
    format: str | None = None,
) -> Post:
    """Create a new Post + Source rows from a generated payload.

    `section` is the winning section chosen during fetch; `format` is the
    post format the run was generated as. Does NOT commit — caller owns the txn.
    """
    post = Post(
        slug=generated.slug,
        title=generated.title,
        content=generated.body,
        summary=generated.summary,
        meta_description=generated.meta_description,
        tags=list(generated.tags),
        section=section,
        format=format,
        publishing_mode=mode,
        generation_attempt=attempt,
    )
    db.add(post)
    db.flush()

    for src in generated.sources:
        db.add(
            Source(
                post_id=post.id,
                title=src.title,
                url=src.url,
                publisher=src.publisher,
                published_date=src.published_date,
            )
        )

    return post


def overwrite_generated_post(
    db: Session, post: Post, generated: GeneratedPost
) -> None:
    """Replace an existing post's content and sources in-place.

    Mutates `post` and rewrites its source rows. Does NOT bump
    `generation_attempt` or change `status` — the caller owns those.
    Does NOT commit.
    """
    post.slug = generated.slug
    post.title = generated.title
    post.content = generated.body
    post.summary = generated.summary
    post.meta_description = generated.meta_description
    post.tags = list(generated.tags)

    db.query(Source).filter(Source.post_id == post.id).delete(
        synchronize_session=False
    )
    db.flush()

    for src in generated.sources:
        db.add(
            Source(
                post_id=post.id,
                title=src.title,
                url=src.url,
                publisher=src.publisher,
                published_date=src.published_date,
            )
        )


def run_pipeline(db: Session, *, format: str = "Deep Dive") -> PipelineResult:
    settings = db.query(Setting).filter(Setting.id == 1).one()
    mode = settings.publishing_mode
    logger.info("pipeline run starting (publishing_mode=%s, format=%s)", mode, format)

    articles = fetch_qualifying_articles(db)

    if not articles:
        settings.last_run_at = datetime.now(timezone.utc)
        db.commit()
        logger.info("pipeline run skipped: below_threshold (article_count=0)")
        return PipelineSkipResult(reason="below_threshold", article_count=0)

    generated = generate_post(articles, format=format)

    # All winning-cluster articles share one section; attribute the post to it.
    section = articles[0].section
    post = persist_generated_post(
        db, generated, mode=mode, attempt=1, section=section, format=format
    )

    publisher.route_post(post, mode)
    settings.last_run_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(post)
    logger.info(
        "pipeline run complete: post_id=%s slug=%s status=%s",
        post.id,
        post.slug,
        post.status,
    )
    return PipelineSuccessResult(post=post)
