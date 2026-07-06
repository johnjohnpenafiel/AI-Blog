"""Pipeline orchestrator: news_fetcher -> blog_writer -> persist -> route.

Single entry point `run_pipeline(db)` used by both the manual trigger
(`POST /pipeline/run`) and the scheduler cron (next feature). The whole
run is one DB transaction: either we end up with Post + Sources + an
updated `settings.last_run_at`, or none of it.
"""
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from models import Post, Setting, Source
from schemas.blog_writer import GeneratedPost
from schemas.evals import EvalResult
from services import publisher
from services.blog_writer import generate_post, generate_roundup
from services.evals import evaluate_post
from services.image_generator import generate_post_image
from services.news_fetcher import fetch_qualifying_articles

logger = logging.getLogger(__name__)

ROUNDUP_LOOKBACK_DAYS = 7


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
        story_type=generated.story_type,
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
    post.story_type = generated.story_type

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


def _evaluate_generated(
    generated: GeneratedPost,
    *,
    fmt: str,
    section: str | None,
    excerpts_by_url: dict[str, str],
) -> EvalResult | None:
    """Score a freshly generated post against the source text it was written
    from. Returns the EvalResult, or None if scoring was skipped — it NEVER
    raises, because a QA score must not break a real run.

    Feeding the in-hand excerpts (the Article snippets / week-post summaries we
    still have here) is the gate-free way to make the eval's grounding axis
    meaningful without persisting an excerpt column. See the 2026-06-05 decision.
    """
    try:
        result = evaluate_post(
            {
                "title": generated.title,
                "body": generated.body,
                "format": fmt,
                "section": section,
                "sources": [
                    {
                        "title": s.title,
                        "publisher": s.publisher,
                        "url": s.url,
                        "excerpt": excerpts_by_url.get(s.url, ""),
                    }
                    for s in generated.sources
                ],
            }
        )
    except Exception as exc:  # noqa: BLE001 — observability must never break a run
        logger.warning("post-generation eval skipped: %s", exc)
        return None

    log = logger.info if result.passed else logger.warning
    log(
        "post-generation eval: pov=%d format=%d grounding=%d passed=%s — %s",
        result.pov_adherence,
        result.format_adherence,
        result.source_grounding,
        result.passed,
        result.notes,
    )
    return result


def apply_eval(post: Post, result: EvalResult | None) -> None:
    """Persist an eval result onto a post (or clear it when result is None).

    Clearing to NULL is deliberate: a regenerated post has no source excerpts to
    score against, so we drop the stale score rather than show it as still valid
    or re-run the eval source-blind. NULL reads as "not scored" everywhere."""
    if result is None:
        post.eval_pov = None
        post.eval_format = None
        post.eval_grounding = None
        post.eval_passed = None
        post.eval_notes = None
        post.eval_at = None
        return
    post.eval_pov = result.pov_adherence
    post.eval_format = result.format_adherence
    post.eval_grounding = result.source_grounding
    post.eval_passed = result.passed
    post.eval_notes = result.notes
    post.eval_at = datetime.now(timezone.utc)


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
    eval_result = _evaluate_generated(
        generated,
        fmt=format,
        section=section,
        excerpts_by_url={a.url: a.snippet for a in articles},
    )
    # Rotation index for the image art director — count of prior posts, so device
    # and backdrop advance across the run history. Read before persist (which adds
    # this post) so it's the new post's 0-based index.
    post_index = db.query(Post).count()
    post = persist_generated_post(
        db, generated, mode=mode, attempt=1, section=section, format=format
    )
    apply_eval(post, eval_result)
    # Cover image — fail-soft: a failure returns None, leaving image_url NULL and the
    # run intact. Included in the single commit below (no extra commit needed).
    post.image_url = generate_post_image(
        title=post.title, summary=post.summary, section=post.section, index=post_index
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


def run_roundup(db: Session) -> PipelineResult:
    """Weekly Roundup: synthesize the week's published posts (not fresh news)
    into one post. Skips cleanly if nothing was published in the window."""
    settings = db.query(Setting).filter(Setting.id == 1).one()
    mode = settings.publishing_mode
    cutoff = datetime.now(timezone.utc) - timedelta(days=ROUNDUP_LOOKBACK_DAYS)

    week_posts = (
        db.query(Post)
        .filter(
            Post.status == "published",
            Post.published_at >= cutoff,
            Post.format.is_distinct_from("Roundup"),  # don't round up roundups
        )
        .order_by(Post.published_at)
        .all()
    )

    if not week_posts:
        settings.last_run_at = datetime.now(timezone.utc)
        db.commit()
        logger.info(
            "roundup skipped: no posts published in last %d days",
            ROUNDUP_LOOKBACK_DAYS,
        )
        return PipelineSkipResult(reason="no_posts_this_week", article_count=0)

    payload = [
        {
            "title": p.title,
            "summary": p.summary,
            "section": p.section,
            "slug": p.slug,
        }
        for p in week_posts
    ]
    generated = generate_roundup(payload)
    # Roundup sources are our own posts (url = /blog/{slug}); the excerpt is the
    # summary the roundup was synthesized from.
    eval_result = _evaluate_generated(
        generated,
        fmt="Roundup",
        section=None,
        excerpts_by_url={f"/blog/{p.slug}": (p.summary or "") for p in week_posts},
    )
    post_index = db.query(Post).count()
    post = persist_generated_post(
        db, generated, mode=mode, attempt=1, section=None, format="Roundup"
    )
    apply_eval(post, eval_result)
    # Cover image — fail-soft (see run_pipeline). Roundup has no section (None).
    post.image_url = generate_post_image(
        title=post.title, summary=post.summary, section=post.section, index=post_index
    )

    publisher.route_post(post, mode)
    settings.last_run_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(post)
    logger.info(
        "roundup complete: post_id=%s slug=%s status=%s (from %d posts)",
        post.id,
        post.slug,
        post.status,
        len(week_posts),
    )
    return PipelineSuccessResult(post=post)
