"""Outbound email — a small seam in front of Resend.

Everything that sends mail (subscription confirmations now, post emails in
the `subscriber-emailer` job) calls `send_email`. With `RESEND_API_KEY` unset
the message is logged instead of sent, so local dev and the test suite never
reach Resend. Swapping providers means changing only this module.

`send_email` raises `EmailSendError` on a provider failure — callers decide
whether that's fatal (a subscribe request reports it; the emailer job logs and
retries on its next sweep).
"""
import logging
import os
from dataclasses import dataclass, field

import httpx

logger = logging.getLogger(__name__)

RESEND_URL = "https://api.resend.com/emails"
DEFAULT_FROM = "The Garage AI <dispatch@localhost>"


class EmailSendError(Exception):
    """The provider rejected or failed to accept the message."""


@dataclass
class OutgoingEmail:
    to: str
    subject: str
    html: str
    text: str
    headers: dict[str, str] = field(default_factory=dict)


def public_site_url() -> str:
    """Base URL for links inside emails (confirm / unsubscribe / post links)."""
    url = os.getenv("PUBLIC_SITE_URL") or os.getenv(
        "FRONTEND_URL", "http://localhost:3000"
    )
    return url.rstrip("/")


def send_email(message: OutgoingEmail) -> None:
    api_key = os.getenv("RESEND_API_KEY")
    if not api_key:
        logger.info(
            "email (log-only, RESEND_API_KEY unset): to=%s subject=%r\n%s",
            message.to,
            message.subject,
            message.text,
        )
        return

    payload: dict[str, object] = {
        "from": os.getenv("EMAIL_FROM", DEFAULT_FROM),
        "to": [message.to],
        "subject": message.subject,
        "html": message.html,
        "text": message.text,
    }
    if message.headers:
        payload["headers"] = message.headers

    try:
        response = httpx.post(
            RESEND_URL,
            json=payload,
            headers={"Authorization": f"Bearer {api_key}"},
            timeout=15.0,
        )
    except httpx.HTTPError as exc:
        raise EmailSendError(f"resend request failed: {exc}") from exc
    if response.status_code >= 400:
        raise EmailSendError(
            f"resend returned {response.status_code}: {response.text[:200]}"
        )
