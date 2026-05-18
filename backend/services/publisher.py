"""Status routing for a freshly generated post + the scheduled-post publisher.

`route_post` sets a fresh post's status + published_at in memory at the end
of a pipeline run (caller commits).

`publish_due_posts` is the inverse direction: an atomic bulk UPDATE that
flips every accepted post whose `scheduled_at` has passed to `published`.
Called every minute by the scheduler interval job in `scheduler.py`. The
status filter in the WHERE clause is what makes this race-safe against a
concurrent manual `POST /posts/{id}/publish` — whichever transaction
commits first wins; the loser's UPDATE matches 0 rows.
"""
from datetime import datetime, timezone

from sqlalchemy import update
from sqlalchemy.orm import Session

from models import Post


def route_post(post: Post, mode: str) -> None:
    if mode == "auto":
        post.status = "published"
        post.published_at = datetime.now(timezone.utc)
    elif mode == "approve_only":
        post.status = "pending_review"
        post.published_at = None
    else:
        raise ValueError(f"unknown publishing mode: {mode!r}")


def publish_due_posts(db: Session) -> int:
    """Flip all due accepted posts to published. Returns count of rows updated."""
    now = datetime.now(timezone.utc)
    stmt = (
        update(Post)
        .where(Post.status == "accepted", Post.scheduled_at <= now)
        .values(status="published", published_at=now, scheduled_at=None)
        .execution_options(synchronize_session=False)
    )
    result = db.execute(stmt)
    db.commit()
    return result.rowcount or 0
