"""Shared pytest fixtures.

The `db` fixture wraps each test in a connection-level transaction that is
rolled back at teardown — tests can flush to Postgres (so server defaults,
ENUM constraints, and FKs all apply) without polluting the dev database.
"""
from collections.abc import Generator

import pytest
from sqlalchemy.orm import Session

from database import engine


@pytest.fixture
def db() -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()
