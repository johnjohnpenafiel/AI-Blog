"""Shared pytest fixtures.

The `db` fixture wraps each test in a connection-level transaction that is
rolled back at teardown — tests can flush to Postgres (so server defaults,
ENUM constraints, and FKs all apply) without polluting the dev database.

Two details make that promise hold even for code under test that commits
(the pipeline/roundup orchestrators call ``session.commit()``):

- ``join_transaction_mode="create_savepoint"`` makes the session emit a
  SAVEPOINT for each ``commit()`` instead of committing the real transaction,
  so the outer ``transaction.rollback()`` can still undo everything. Without
  this, an auto-mode pipeline/roundup test would leak its committed post into
  the dev database.
- The posts/sources tables are cleared at the start of each test (inside the
  rolled-back transaction). Roundup/pipeline queries read *real* published
  rows, so any pre-existing or previously-leaked dev rows would otherwise make
  "skip when empty" tests find phantom posts. Real dev data is restored on
  rollback.
"""
from collections.abc import Generator

import pytest
from sqlalchemy import delete
from sqlalchemy.orm import Session

from database import engine
from models import Post, Source


@pytest.fixture
def db() -> Generator[Session, None, None]:
    connection = engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection, join_transaction_mode="create_savepoint")
    # Start every test from an empty posts table — isolates tests from
    # pre-existing dev rows and from any post a sibling test committed.
    # Sources first (FK → posts). Rolled back with the outer transaction.
    session.execute(delete(Source))
    session.execute(delete(Post))
    session.flush()
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()
