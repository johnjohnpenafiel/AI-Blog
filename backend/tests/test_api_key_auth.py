"""Tests for the `require_api_key` backend auth gate.

Unlike the other router tests, these do NOT override `require_api_key` — they
exercise the real gate. `BACKEND_API_SECRET` is set (or cleared) per-test via
monkeypatch so the env state can't leak between tests.
"""
from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from database import get_db
from main import app

SECRET = "test-secret-value"


@pytest.fixture
def client(db: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db

    # Note: require_api_key is intentionally NOT overridden here.
    app.dependency_overrides[get_db] = override_get_db
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def test_protected_route_rejects_missing_header(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("BACKEND_API_SECRET", SECRET)
    response = client.get("/settings")
    assert response.status_code == 401
    assert response.json()["detail"] == "missing or invalid API key"


def test_protected_route_rejects_wrong_secret(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("BACKEND_API_SECRET", SECRET)
    response = client.get(
        "/settings", headers={"Authorization": "Bearer not-the-secret"}
    )
    assert response.status_code == 401


def test_protected_route_accepts_correct_secret(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("BACKEND_API_SECRET", SECRET)
    response = client.get(
        "/settings", headers={"Authorization": f"Bearer {SECRET}"}
    )
    assert response.status_code == 200
    assert response.json()["publishing_mode"] == "approve_only"


def test_protected_post_route_rejects_missing_header(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.setenv("BACKEND_API_SECRET", SECRET)
    # The gate fires before the handler, so no pipeline work happens.
    response = client.post("/pipeline/run")
    assert response.status_code == 401


def test_misconfigured_secret_fails_closed(
    client: TestClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    monkeypatch.delenv("BACKEND_API_SECRET", raising=False)
    response = client.get(
        "/settings", headers={"Authorization": f"Bearer {SECRET}"}
    )
    assert response.status_code == 500


@pytest.mark.parametrize("path", ["/health", "/public/posts"])
def test_open_routes_need_no_api_key(
    client: TestClient, monkeypatch: pytest.MonkeyPatch, path: str
) -> None:
    # Even with a secret configured, public/health routes carry no gate.
    monkeypatch.setenv("BACKEND_API_SECRET", SECRET)
    response = client.get(path)
    assert response.status_code == 200
