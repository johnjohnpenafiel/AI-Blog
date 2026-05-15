"""Trigger-shape tests: CronTrigger fires Mon/Thu 08:00 UTC; helper matches.

No real waiting — we ask the trigger and the helper what the *next* fire
time is for hand-rolled inputs and compare against the expected weekday
and hour.
"""
from datetime import datetime, timezone

import pytest
from apscheduler.triggers.cron import CronTrigger

from scheduler import compute_next_run_at


def _utc(year, month, day, hour=0, minute=0) -> datetime:
    return datetime(year, month, day, hour, minute, tzinfo=timezone.utc)


# May 2026: Mon = 4, 11, 18, 25 ; Thu = 7, 14, 21, 28.
@pytest.mark.parametrize(
    "now, expected",
    [
        # Sunday late night → next is Monday 08:00.
        (_utc(2026, 5, 3, 23, 0), _utc(2026, 5, 4, 8, 0)),
        # Monday 07:59 → same-day Monday 08:00.
        (_utc(2026, 5, 4, 7, 59), _utc(2026, 5, 4, 8, 0)),
        # Monday 08:01 → next Thursday 08:00.
        (_utc(2026, 5, 4, 8, 1), _utc(2026, 5, 7, 8, 0)),
        # Tuesday noon → next Thursday 08:00.
        (_utc(2026, 5, 5, 12, 0), _utc(2026, 5, 7, 8, 0)),
        # Thursday 07:59 → same-day Thursday 08:00.
        (_utc(2026, 5, 7, 7, 59), _utc(2026, 5, 7, 8, 0)),
        # Thursday 08:00 exactly → next Monday 08:00 (strictly after `now`).
        (_utc(2026, 5, 7, 8, 0), _utc(2026, 5, 11, 8, 0)),
        # Friday → next Monday 08:00.
        (_utc(2026, 5, 8, 10, 0), _utc(2026, 5, 11, 8, 0)),
    ],
)
def test_compute_next_run_at(now: datetime, expected: datetime) -> None:
    result = compute_next_run_at(now)
    assert result == expected
    assert result.tzinfo is not None
    assert result.utcoffset() == expected.utcoffset()


@pytest.mark.parametrize(
    "previous, expected",
    [
        (_utc(2026, 5, 3, 23, 0), _utc(2026, 5, 4, 8, 0)),
        (_utc(2026, 5, 4, 7, 59), _utc(2026, 5, 4, 8, 0)),
        (_utc(2026, 5, 4, 8, 1), _utc(2026, 5, 7, 8, 0)),
        (_utc(2026, 5, 7, 7, 59), _utc(2026, 5, 7, 8, 0)),
        (_utc(2026, 5, 8, 10, 0), _utc(2026, 5, 11, 8, 0)),
    ],
)
def test_cron_trigger_next_fire_time(previous: datetime, expected: datetime) -> None:
    trigger = CronTrigger(
        day_of_week="mon,thu", hour=8, minute=0, timezone="UTC"
    )
    next_fire = trigger.get_next_fire_time(None, previous)
    assert next_fire is not None
    assert next_fire == expected
    assert next_fire.weekday() in {0, 3}
    assert next_fire.hour == 8
    assert next_fire.minute == 0
