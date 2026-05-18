"""Tests for the /settings endpoints.

The `db` fixture (conftest.py) wraps each test in a connection-level
transaction; the endpoint's `db.commit()` releases a SAVEPOINT but the
outer transaction is rolled back at teardown, so committed mutations
from one test don't leak into others. The seeded `settings` row (id=1)
inserted by the initial migration is therefore always visible at its
default state at the start of each test.
"""
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from database import get_db
from main import app
from models import Setting


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def test_get_settings_returns_seeded_defaults(
    client: TestClient, db: Session
) -> None:
    response = client.get("/settings")
    assert response.status_code == 200
    body = response.json()
    assert set(body.keys()) == {
        "publishing_mode",
        "schedule_frequency",
        "last_run_at",
        "next_run_at",
    }
    assert body["publishing_mode"] == "approve_only"
    assert body["schedule_frequency"] == "twice_weekly"


def test_patch_publishing_mode_persists(
    client: TestClient, db: Session
) -> None:
    response = client.patch("/settings", json={"publishing_mode": "auto"})
    assert response.status_code == 200
    assert response.json()["publishing_mode"] == "auto"

    db.expire_all()
    settings = db.query(Setting).filter(Setting.id == 1).one()
    assert settings.publishing_mode == "auto"


def test_patch_invalid_publishing_mode_returns_422(
    client: TestClient, db: Session
) -> None:
    response = client.patch(
        "/settings", json={"publishing_mode": "not-a-mode"}
    )
    assert response.status_code == 422


def test_patch_empty_body_is_noop(client: TestClient, db: Session) -> None:
    before = client.get("/settings").json()
    response = client.patch("/settings", json={})
    assert response.status_code == 200
    assert response.json() == before
