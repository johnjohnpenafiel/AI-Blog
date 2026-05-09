"""Tests for the auth router.

The `db` fixture (see conftest.py) wraps each test in a connection-level
transaction. We override FastAPI's `get_db` dependency to yield that same
session so HTTP requests through TestClient see the seeded admin.
"""
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from database import get_db
from main import app
from scripts.seed_admin import seed_admin


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db

    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def test_login_valid_credentials(client: TestClient, db: Session) -> None:
    email = "valid-creds@example.com"
    password = "correct-horse-battery"
    seed_admin(db, email, password)

    response = client.post("/auth/login", json={"email": email, "password": password})

    assert response.status_code == 200
    body = response.json()
    assert body["email"] == email
    assert "id" in body and len(body["id"]) == 36  # UUID string


def test_login_unknown_email(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"email": "nobody@example.com", "password": "whatever"},
    )

    assert response.status_code == 401


def test_login_wrong_password(client: TestClient, db: Session) -> None:
    email = "wrong-pw@example.com"
    seed_admin(db, email, "the-real-password")

    response = client.post(
        "/auth/login",
        json={"email": email, "password": "not-the-real-password"},
    )

    assert response.status_code == 401


def test_logout_returns_ok(client: TestClient) -> None:
    response = client.post("/auth/logout")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
