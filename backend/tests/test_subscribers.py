"""Tests for the subscription endpoints (routers/subscribers.py).

`send_email` is patched at the router's import site so each test can assert
what (if anything) was sent without touching Resend or the logs.
"""
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_api_key
from main import app
from models import Subscriber
from services.email_sender import EmailSendError, OutgoingEmail


@pytest.fixture
def sent(monkeypatch: pytest.MonkeyPatch) -> list[OutgoingEmail]:
    outbox: list[OutgoingEmail] = []
    monkeypatch.setattr("routers.subscribers.send_email", outbox.append)
    return outbox


@pytest.fixture
def client(db: Session, sent: list[OutgoingEmail]) -> Generator[TestClient, None, None]:
    db.execute(delete(Subscriber))
    db.flush()

    def override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[require_api_key] = lambda: None
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def _get(db: Session, email: str) -> Subscriber:
    return db.query(Subscriber).filter(Subscriber.email == email).one()


def test_subscribe_creates_pending_and_sends_confirmation(
    client: TestClient, db: Session, sent: list[OutgoingEmail]
) -> None:
    r = client.post("/public/subscribe", json={"email": "  Reader@Example.COM "})
    assert r.status_code == 202
    assert r.json() == {"status": "ok"}

    sub = _get(db, "reader@example.com")
    assert sub.status == "pending"
    assert len(sent) == 1
    assert sent[0].to == "reader@example.com"
    assert f"/subscribe/confirm?token={sub.confirm_token}" in sent[0].text


def test_subscribe_rejects_invalid_email(client: TestClient) -> None:
    r = client.post("/public/subscribe", json={"email": "not-an-email"})
    assert r.status_code == 422


def test_resubscribe_pending_rearms_token_without_duplicate(
    client: TestClient, db: Session, sent: list[OutgoingEmail]
) -> None:
    client.post("/public/subscribe", json={"email": "a@example.com"})
    first_token = _get(db, "a@example.com").confirm_token
    client.post("/public/subscribe", json={"email": "a@example.com"})

    assert db.query(Subscriber).filter(Subscriber.email == "a@example.com").count() == 1
    assert _get(db, "a@example.com").confirm_token != first_token
    assert len(sent) == 2


def test_subscribe_active_address_is_silent_and_indistinguishable(
    client: TestClient, db: Session, sent: list[OutgoingEmail]
) -> None:
    db.add(Subscriber(email="on@example.com", status="active", confirm_token=None))
    db.flush()
    r = client.post("/public/subscribe", json={"email": "on@example.com"})
    assert r.status_code == 202
    assert r.json() == {"status": "ok"}
    assert sent == []


def test_subscribe_reports_send_failure(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    def boom(_: OutgoingEmail) -> None:
        raise EmailSendError("down")

    monkeypatch.setattr("routers.subscribers.send_email", boom)
    r = client.post("/public/subscribe", json={"email": "x@example.com"})
    assert r.status_code == 503


def test_confirm_activates_and_token_is_single_use(
    client: TestClient, db: Session
) -> None:
    client.post("/public/subscribe", json={"email": "c@example.com"})
    token = _get(db, "c@example.com").confirm_token

    r = client.post("/public/subscribe/confirm", json={"token": token})
    assert r.status_code == 200
    assert r.json() == {"status": "active"}
    sub = _get(db, "c@example.com")
    assert sub.status == "active"
    assert sub.confirmed_at is not None
    assert sub.confirm_token is None

    again = client.post("/public/subscribe/confirm", json={"token": token})
    assert again.status_code == 404


def test_confirm_unknown_token_404(client: TestClient) -> None:
    r = client.post("/public/subscribe/confirm", json={"token": "nope"})
    assert r.status_code == 404


def test_unsubscribe_is_idempotent(client: TestClient, db: Session) -> None:
    db.add(Subscriber(email="u@example.com", status="active", confirm_token=None))
    db.flush()
    token = _get(db, "u@example.com").unsubscribe_token

    for _ in range(2):
        r = client.post("/public/unsubscribe", json={"token": token})
        assert r.status_code == 200
        assert r.json() == {"status": "unsubscribed"}
    sub = _get(db, "u@example.com")
    assert sub.status == "unsubscribed"
    assert sub.unsubscribed_at is not None


def test_one_click_unsubscribe_reads_query_and_ignores_form_body(
    client: TestClient, db: Session
) -> None:
    db.add(Subscriber(email="o@example.com", status="active", confirm_token=None))
    db.flush()
    token = _get(db, "o@example.com").unsubscribe_token

    r = client.post(
        f"/public/unsubscribe/one-click?token={token}",
        data={"List-Unsubscribe": "One-Click"},
    )
    assert r.status_code == 200
    assert _get(db, "o@example.com").status == "unsubscribed"


def test_unsubscribe_unknown_token_404(client: TestClient) -> None:
    r = client.post("/public/unsubscribe", json={"token": "nope"})
    assert r.status_code == 404


def test_resubscribe_after_unsubscribe_goes_back_to_pending(
    client: TestClient, db: Session, sent: list[OutgoingEmail]
) -> None:
    db.add(Subscriber(email="back@example.com", status="unsubscribed", confirm_token=None))
    db.flush()
    client.post("/public/subscribe", json={"email": "back@example.com"})
    sub = _get(db, "back@example.com")
    assert sub.status == "pending"
    assert sub.confirm_token is not None
    assert sub.unsubscribed_at is None
    assert len(sent) == 1


def test_stats_counts_only_active(client: TestClient, db: Session) -> None:
    db.add_all(
        [
            Subscriber(email="s1@example.com", status="active", confirm_token=None),
            Subscriber(email="s2@example.com", status="active", confirm_token=None),
            Subscriber(email="s3@example.com"),
            Subscriber(email="s4@example.com", status="unsubscribed"),
        ]
    )
    db.flush()
    r = client.get("/subscribers/stats")
    assert r.status_code == 200
    assert r.json() == {"active": 2}


def test_send_email_logs_when_no_api_key(
    monkeypatch: pytest.MonkeyPatch, caplog: pytest.LogCaptureFixture
) -> None:
    from services.email_sender import send_email

    monkeypatch.delenv("RESEND_API_KEY", raising=False)
    with caplog.at_level("INFO"):
        send_email(OutgoingEmail(to="t@example.com", subject="Hi", html="<p>x</p>", text="x"))
    assert "log-only" in caplog.text
