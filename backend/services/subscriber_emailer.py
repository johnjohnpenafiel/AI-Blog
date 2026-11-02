"""Email newly published posts to active subscribers.

`email_new_posts` sweeps for `published` posts whose `emailed_at` is NULL —
one mechanism that covers every publish path (auto-mode pipeline routing,
accept-with-publish, manual /publish, and the bulk scheduled publisher).
It runs from the scheduler: right after each pipeline fire and on every
scheduled-publisher tick (see scheduler.py), so it adds no extra DB wake-ups.

Delivery is at-most-once per post: the post is *claimed* (emailed_at stamped
in a conditional UPDATE and committed) before any email goes out, so a crash
or a concurrent sweep can never send it twice. If the very first batch fails
— the provider is down, nothing was delivered — the claim is released so the
next tick retries. A failure after some batches went out is logged and not
retried, since a retry would double-send to the readers already reached.
"""
import logging
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy import update
from sqlalchemy.orm import Session

from models import Post, Subscriber
from services.email_sender import BATCH_MAX, EmailSendError, send_batch
from services.email_templates import post_email

logger = logging.getLogger(__name__)

# A post that's been published this long without being emailed is stamped and
# skipped rather than sent — guards against a surprise blast of old posts
# (e.g. after an outage, or a post re-published from the archive).
STALE_AFTER = timedelta(days=3)

# Pause between batch calls — stays under the provider's per-second rate
# limit. Patched to 0 in tests.
BATCH_PAUSE_SECONDS = 0.6


def _claim(db: Session, post: Post, now: datetime) -> bool:
    result = db.execute(
        update(Post)
        .where(Post.id == post.id, Post.emailed_at.is_(None))
        .values(emailed_at=now)
        .execution_options(synchronize_session=False)
    )
    db.commit()
    return (result.rowcount or 0) == 1


def _release(db: Session, post: Post) -> None:
    db.execute(
        update(Post)
        .where(Post.id == post.id)
        .values(emailed_at=None)
        .execution_options(synchronize_session=False)
    )
    db.commit()


def _send_post(db: Session, post: Post, subscribers: list[Subscriber]) -> int:
    """Send `post` to `subscribers` in batches. Returns the number delivered
    to the provider. Raises EmailSendError only if the FIRST batch fails."""
    sent = 0
    for start in range(0, len(subscribers), BATCH_MAX):
        chunk = subscribers[start : start + BATCH_MAX]
        messages = [
            post_email(
                sub.email,
                sub.unsubscribe_token,
                title=post.title,
                summary=post.summary,
                slug=post.slug,
                format=post.format,
                image_url=post.image_url,
            )
            for sub in chunk
        ]
        if start > 0 and BATCH_PAUSE_SECONDS:
            time.sleep(BATCH_PAUSE_SECONDS)
        try:
            send_batch(messages)
        except EmailSendError:
            if sent == 0:
                raise
            logger.exception(
                "post email partially sent: post=%s delivered=%d of %d",
                post.id,
                sent,
                len(subscribers),
            )
            return sent
        sent += len(chunk)
    return sent


def email_new_posts(db: Session) -> int:
    """Email every unsent published post. Returns the number of posts emailed."""
    now = datetime.now(timezone.utc)
    pending = (
        db.query(Post)
        .filter(Post.status == "published", Post.emailed_at.is_(None))
        .order_by(Post.published_at.asc())
        .all()
    )
    if not pending:
        return 0

    subscribers = (
        db.query(Subscriber)
        .filter(Subscriber.status == "active")
        .order_by(Subscriber.created_at.asc())
        .all()
    )

    emailed = 0
    for post in pending:
        if not _claim(db, post, now):
            continue  # another sweep got it first
        if post.published_at is not None and now - post.published_at > STALE_AFTER:
            logger.info("post email skipped (stale): post=%s", post.id)
            continue
        if not subscribers:
            continue  # nothing to send; stamped so it isn't re-checked
        try:
            sent = _send_post(db, post, subscribers)
        except EmailSendError:
            logger.exception("post email failed, will retry: post=%s", post.id)
            _release(db, post)
            continue
        emailed += 1
        logger.info("post emailed: post=%s recipients=%d", post.id, sent)
    return emailed
