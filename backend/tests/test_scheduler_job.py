"""Tests for `_run_pipeline_job`: it writes `settings.next_run_at` after a
successful pipeline run and swallows exceptions so the scheduler thread
never dies.

We patch `scheduler.run_pipeline` (so the actual pipeline doesn't run)
and `scheduler.SessionLocal` to return a session bound to the test's
transactional connection — commits inside the job land on that same
connection and get rolled back at fixture teardown.
"""
import logging
from unittest.mock import patch

from sqlalchemy.orm import Session as SASession

import scheduler as scheduler_module
from models import Setting


def _session_factory_bound_to(db: SASession):
    connection = db.connection()
    return lambda: SASession(bind=connection)


def test_run_pipeline_job_persists_next_run_at(db: SASession) -> None:
    factory = _session_factory_bound_to(db)
    # Pin format so the job takes the run_pipeline branch regardless of weekday.
    with patch.object(scheduler_module, "_format_for", return_value="Deep Dive"), patch.object(
        scheduler_module, "run_pipeline", return_value=None
    ), patch.object(scheduler_module, "SessionLocal", side_effect=factory):
        scheduler_module._run_pipeline_job()

    db.expire_all()
    setting = db.query(Setting).filter(Setting.id == 1).one()
    assert setting.next_run_at is not None
    assert setting.next_run_at.tzinfo is not None
    assert setting.next_run_at.weekday() in {0, 3, 4}
    assert setting.next_run_at.hour == 8
    assert setting.next_run_at.minute == 0


def test_run_pipeline_job_swallows_pipeline_errors(
    db: SASession, caplog: object
) -> None:
    factory = _session_factory_bound_to(db)
    before = db.query(Setting).filter(Setting.id == 1).one().next_run_at

    def _boom(_db):
        raise RuntimeError("pipeline blew up")

    with caplog.at_level(logging.ERROR, logger="scheduler"):
        with patch.object(
            scheduler_module, "_format_for", return_value="Deep Dive"
        ), patch.object(
            scheduler_module, "run_pipeline", side_effect=_boom
        ), patch.object(scheduler_module, "SessionLocal", side_effect=factory):
            # Must not raise.
            scheduler_module._run_pipeline_job()

    assert any(
        "scheduled pipeline fire failed" in rec.message for rec in caplog.records
    )

    # next_run_at is only written *after* run_pipeline succeeds.
    db.expire_all()
    after = db.query(Setting).filter(Setting.id == 1).one().next_run_at
    assert after == before


def test_weekday_format_mapping() -> None:
    assert scheduler_module._format_for(0) == "Brief"  # Monday
    assert scheduler_module._format_for(3) == "Deep Dive"  # Thursday
    assert scheduler_module._format_for(4) == "Roundup"  # Friday
    # Unmapped days fall back to Deep Dive.
    assert scheduler_module._format_for(1) == "Deep Dive"


def test_run_pipeline_job_passes_a_format(db: SASession) -> None:
    factory = _session_factory_bound_to(db)
    with patch.object(
        scheduler_module, "_format_for", return_value="Deep Dive"
    ), patch.object(
        scheduler_module, "run_pipeline", return_value=None
    ) as mock_run, patch.object(
        scheduler_module, "SessionLocal", side_effect=factory
    ):
        scheduler_module._run_pipeline_job()

    assert mock_run.call_args.kwargs.get("format") == "Deep Dive"


def test_run_pipeline_job_roundup_branch_calls_run_roundup(db: SASession) -> None:
    factory = _session_factory_bound_to(db)
    with patch.object(
        scheduler_module, "_format_for", return_value="Roundup"
    ), patch.object(
        scheduler_module, "run_roundup", return_value=None
    ) as mock_roundup, patch.object(
        scheduler_module, "run_pipeline"
    ) as mock_pipeline, patch.object(
        scheduler_module, "SessionLocal", side_effect=factory
    ):
        scheduler_module._run_pipeline_job()

    assert mock_roundup.call_count == 1
    assert mock_pipeline.call_count == 0


def test_publish_scheduled_job_calls_service(db: SASession) -> None:
    """The interval-job wrapper opens a session, calls publish_due_posts."""
    factory = _session_factory_bound_to(db)
    with patch.object(
        scheduler_module, "publish_due_posts", return_value=0
    ) as mock_pub, patch.object(
        scheduler_module, "SessionLocal", side_effect=factory
    ):
        scheduler_module._publish_scheduled_job()

    assert mock_pub.call_count == 1


def test_publish_scheduled_job_logs_when_count_positive(
    db: SASession, caplog: object
) -> None:
    factory = _session_factory_bound_to(db)
    with caplog.at_level(logging.INFO, logger="scheduler"):
        with patch.object(
            scheduler_module, "publish_due_posts", return_value=2
        ), patch.object(scheduler_module, "SessionLocal", side_effect=factory):
            scheduler_module._publish_scheduled_job()

    assert any(
        "scheduled-publisher published 2 post(s)" in rec.message
        for rec in caplog.records
    )


def test_publish_scheduled_job_silent_when_count_zero(
    db: SASession, caplog: object
) -> None:
    factory = _session_factory_bound_to(db)
    with caplog.at_level(logging.INFO, logger="scheduler"):
        with patch.object(
            scheduler_module, "publish_due_posts", return_value=0
        ), patch.object(scheduler_module, "SessionLocal", side_effect=factory):
            scheduler_module._publish_scheduled_job()

    assert not any(
        "scheduled-publisher" in rec.message for rec in caplog.records
    )


def test_publish_scheduled_job_swallows_errors(
    db: SASession, caplog: object
) -> None:
    factory = _session_factory_bound_to(db)

    def _boom(_db):
        raise RuntimeError("publisher blew up")

    with caplog.at_level(logging.ERROR, logger="scheduler"):
        with patch.object(
            scheduler_module, "publish_due_posts", side_effect=_boom
        ), patch.object(scheduler_module, "SessionLocal", side_effect=factory):
            # Must not raise.
            scheduler_module._publish_scheduled_job()

    assert any(
        "scheduled-publisher tick failed" in rec.message for rec in caplog.records
    )
