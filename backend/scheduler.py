"""APScheduler in-process cron — fires `run_pipeline` Mon + Thu at 08:00 UTC.

We use `AsyncIOScheduler` because FastAPI/uvicorn already runs an asyncio
event loop; the scheduler hooks into it and shuts down cleanly from the
lifespan handler in `main.py`. The cron job itself is sync (it calls the
sync `run_pipeline`), so APScheduler dispatches it through its thread
executor — the event loop stays unblocked.

`run_pipeline` is responsible for `settings.last_run_at`. The scheduler
owns `settings.next_run_at` — that field is schedule-derived and the
manual `POST /pipeline/run` route shouldn't be touching it.
"""
import logging
import time
from datetime import datetime, timedelta, timezone

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger

from database import SessionLocal
from models import Setting
from services.pipeline import run_pipeline
from services.publisher import publish_due_posts

logger = logging.getLogger(__name__)

_CRON_DAYS_OF_WEEK = "mon,thu"
_CRON_HOUR = 8
_CRON_MINUTE = 0
_FIRE_WEEKDAYS = {0, 3}  # Monday, Thursday

scheduler: AsyncIOScheduler | None = None


def compute_next_run_at(now: datetime) -> datetime:
    """Next Mon/Thu at 08:00 UTC strictly after `now` (same-day if before 08:00)."""
    today_at_8 = now.astimezone(timezone.utc).replace(
        hour=_CRON_HOUR, minute=_CRON_MINUTE, second=0, microsecond=0
    )
    if now < today_at_8 and now.weekday() in _FIRE_WEEKDAYS:
        return today_at_8
    for offset in range(1, 8):
        candidate = today_at_8 + timedelta(days=offset)
        if candidate.weekday() in _FIRE_WEEKDAYS:
            return candidate
    raise RuntimeError("unreachable: a Mon or Thu must exist within 7 days")


def _persist_next_run_at(when: datetime) -> None:
    db = SessionLocal()
    try:
        settings = db.query(Setting).filter(Setting.id == 1).one()
        settings.next_run_at = when
        db.commit()
    finally:
        db.close()


def _run_pipeline_job() -> None:
    """Cron entry point. Never propagates — keeps the scheduler thread alive."""
    started = time.monotonic()
    logger.info("scheduled pipeline fire starting")
    try:
        db = SessionLocal()
        try:
            result = run_pipeline(db)
        finally:
            db.close()

        duration = time.monotonic() - started
        logger.info(
            "scheduled pipeline fire complete (duration=%.2fs, result=%s)",
            duration,
            type(result).__name__,
        )

        _persist_next_run_at(compute_next_run_at(datetime.now(timezone.utc)))
    except Exception:
        logger.exception("scheduled pipeline fire failed")


def _publish_scheduled_job() -> None:
    """Interval-job entry point. Flips due posts to published; silent on no-op."""
    try:
        db = SessionLocal()
        try:
            count = publish_due_posts(db)
            if count > 0:
                logger.info("scheduled-publisher published %d post(s)", count)
        finally:
            db.close()
    except Exception:
        logger.exception("scheduled-publisher tick failed")


def start_scheduler() -> None:
    global scheduler
    if scheduler is not None and scheduler.running:
        logger.warning("start_scheduler called but scheduler is already running")
        return

    scheduler = AsyncIOScheduler(timezone="UTC")
    scheduler.add_job(
        _run_pipeline_job,
        CronTrigger(
            day_of_week=_CRON_DAYS_OF_WEEK,
            hour=_CRON_HOUR,
            minute=_CRON_MINUTE,
            timezone="UTC",
        ),
        id="pipeline-cron",
        replace_existing=True,
        coalesce=True,
        misfire_grace_time=3600,
    )
    scheduler.add_job(
        _publish_scheduled_job,
        IntervalTrigger(minutes=1),
        id="scheduled-publisher",
        replace_existing=True,
        coalesce=True,
        misfire_grace_time=300,
    )
    scheduler.start()

    for job in scheduler.get_jobs():
        logger.info(
            "scheduler job registered: id=%s next_run_time=%s",
            job.id,
            job.next_run_time,
        )

    try:
        _persist_next_run_at(compute_next_run_at(datetime.now(timezone.utc)))
        logger.info("next_run_at persisted on boot")
    except Exception:
        # DB may not be ready on first boot; the next scheduled fire heals it.
        logger.warning("failed to persist next_run_at on boot", exc_info=True)


def shutdown_scheduler() -> None:
    global scheduler
    if scheduler is None:
        return
    scheduler.shutdown(wait=False)
    scheduler = None
