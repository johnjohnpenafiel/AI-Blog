"""Tests for services/subscriber_emailer.py — the new-post email sweep.

`send_batch` is patched at the emailer's import site; each test inspects the
captured batches instead of hitting Resend or the logs.
"""
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy import delete
from sqlalchemy.orm import Session

import services.subscriber_emailer as emailer
from models import Post, Subscriber
from services.email_sender import EmailSendError, OutgoingEmail
from services.publisher import publish_due_posts, route_post


@pytest.fixture
def batches(monkeypatch: pytest.MonkeyPatch, db: Session) -> list[list[OutgoingEmail]]:
    db.execute(delete(Subscriber))
    db.flush()
    calls: list[list[OutgoingEmail]] = []
    monkeypatch.setattr(emailer, "send_batch", lambda msgs: calls.append(list(msgs)))
    monkeypatch.setattr(emailer, "BATCH_PAUSE_SECONDS", 0)
    return calls


def _post(db: Session, slug: str, **kw: object) -> Post:
    post = Post(
        slug=slug,
        title=kw.pop("title", f"Title {slug}"),
        content="body",
        summary="A summary.",
        publishing_mode="auto",
        meta_description="m",
        **kw,
    )
    db.add(post)
    db.flush()
    return post


def _published(db: Session, slug: str, *, ago: timedelta = timedelta(minutes=5)) -> Post:
    return _post(
        db,
        slug,
        status="published",
        published_at=datetime.now(timezone.utc) - ago,
        format="Brief",
    )


def _subscribers(db: Session, n: int, status: str = "active") -> list[Subscriber]:
    subs = [
        Subscriber(email=f"{status}{i}@example.com", status=status, confirm_token=None)
        for i in range(n)
    ]
    db.add_all(subs)
    db.flush()
    return subs


def test_emails_new_post_to_active_subscribers_only(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    _subscribers(db, 2)
    _subscribers(db, 1, status="pending")
    _subscribers(db, 1, status="unsubscribed")
    post = _published(db, "fresh")

    assert emailer.email_new_posts(db) == 1

    assert len(batches) == 1
    assert sorted(m.to for m in batches[0]) == ["active0@example.com", "active1@example.com"]
    assert post.emailed_at is not None


def test_each_message_has_its_own_unsubscribe_link_and_headers(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    subs = _subscribers(db, 2)
    _published(db, "links")
    emailer.email_new_posts(db)

    by_to = {m.to: m for m in batches[0]}
    for sub in subs:
        msg = by_to[sub.email]
        assert f"/unsubscribe?token={sub.unsubscribe_token}" in msg.text
        assert sub.unsubscribe_token in msg.headers["List-Unsubscribe"]
        assert msg.headers["List-Unsubscribe-Post"] == "List-Unsubscribe=One-Click"
        assert "/blog/links" in msg.text
        assert msg.subject == "Title links"


def test_second_sweep_sends_nothing(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    _subscribers(db, 1)
    _published(db, "once")
    emailer.email_new_posts(db)
    assert emailer.email_new_posts(db) == 0
    assert len(batches) == 1


def test_unpublished_posts_are_not_emailed(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    _subscribers(db, 1)
    _post(db, "queued", status="pending_review")
    _post(db, "accepted", status="accepted")
    assert emailer.email_new_posts(db) == 0
    assert batches == []


def test_auto_mode_routing_is_picked_up(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    _subscribers(db, 1)
    post = _post(db, "auto-run")
    route_post(post, "auto")
    db.flush()
    assert emailer.email_new_posts(db) == 1


def test_scheduled_publisher_path_is_picked_up(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    _subscribers(db, 1)
    _post(
        db,
        "scheduled",
        status="accepted",
        scheduled_at=datetime.now(timezone.utc) - timedelta(minutes=1),
    )
    assert publish_due_posts(db) == 1
    assert emailer.email_new_posts(db) == 1
    assert len(batches) == 1


def test_large_lists_are_chunked(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    _subscribers(db, emailer.BATCH_MAX + 5)
    _published(db, "big")
    emailer.email_new_posts(db)
    assert [len(b) for b in batches] == [emailer.BATCH_MAX, 5]


def test_stale_post_is_stamped_without_sending(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    _subscribers(db, 1)
    post = _published(db, "old", ago=emailer.STALE_AFTER + timedelta(hours=1))
    assert emailer.email_new_posts(db) == 0
    assert batches == []
    assert post.emailed_at is not None


def test_no_subscribers_stamps_post(
    db: Session, batches: list[list[OutgoingEmail]]
) -> None:
    post = _published(db, "lonely")
    assert emailer.email_new_posts(db) == 0
    assert post.emailed_at is not None


def test_total_failure_releases_claim_for_retry(
    db: Session, monkeypatch: pytest.MonkeyPatch, batches: list[list[OutgoingEmail]]
) -> None:
    _subscribers(db, 1)
    post = _published(db, "retry")

    def down(_msgs: list[OutgoingEmail]) -> None:
        raise EmailSendError("provider down")

    monkeypatch.setattr(emailer, "send_batch", down)
    assert emailer.email_new_posts(db) == 0
    db.refresh(post)
    assert post.emailed_at is None

    monkeypatch.setattr(emailer, "send_batch", lambda msgs: batches.append(list(msgs)))
    assert emailer.email_new_posts(db) == 1


def test_partial_failure_is_not_retried(
    db: Session, monkeypatch: pytest.MonkeyPatch
) -> None:
    db.execute(delete(Subscriber))
    _subscribers(db, emailer.BATCH_MAX + 1)
    post = _published(db, "partial")
    monkeypatch.setattr(emailer, "BATCH_PAUSE_SECONDS", 0)
    calls: list[int] = []

    def flaky(msgs: list[OutgoingEmail]) -> None:
        calls.append(len(msgs))
        if len(calls) == 2:
            raise EmailSendError("rate limited")

    monkeypatch.setattr(emailer, "send_batch", flaky)
    assert emailer.email_new_posts(db) == 1
    db.refresh(post)
    assert post.emailed_at is not None
    assert emailer.email_new_posts(db) == 0
    assert len(calls) == 2
