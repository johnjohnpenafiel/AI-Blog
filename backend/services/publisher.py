"""Status routing for a freshly generated post.

Given the global publishing mode snapshotted at generation time, this sets
the post's status + published_at in memory. The caller owns the commit so
the entire pipeline run lands in one transaction.
"""
from datetime import datetime, timezone

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
