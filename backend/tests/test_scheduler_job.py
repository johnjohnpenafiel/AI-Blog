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
    with patch.object(scheduler_module, "run_pipeline", return_value=None), patch.object(
        scheduler_module, "SessionLocal", side_effect=factory
    ):
        scheduler_module._run_pipeline_job()

    db.expire_all()
    setting = db.query(Setting).filter(Setting.id == 1).one()
    assert setting.next_run_at is not None
    assert setting.next_run_at.tzinfo is not None
    assert setting.next_run_at.weekday() in {0, 3}
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
        with patch.object(scheduler_module, "run_pipeline", side_effect=_boom), patch.object(
            scheduler_module, "SessionLocal", side_effect=factory
        ):
            # Must not raise.
            scheduler_module._run_pipeline_job()

    assert any(
        "scheduled pipeline fire failed" in rec.message for rec in caplog.records
    )

    # next_run_at is only written *after* run_pipeline succeeds.
    db.expire_all()
    after = db.query(Setting).filter(Setting.id == 1).one().next_run_at
    assert after == before
