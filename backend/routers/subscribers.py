"""Email-subscription endpoints.

Two routers in one module because they share the `Subscriber` model but not
an auth story:

- `public_router` (`/public/...`) — open, token-addressed, used by the public
  blog's /subscribe, /subscribe/confirm, and /unsubscribe pages. No login: the
  random tokens in the emailed links ARE the credential.
- `admin_router` (`/subscribers`) — behind `require_api_key`, read-only stats
  for the dashboard Overview.
"""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from database import get_db
from dependencies import require_api_key
from models import Subscriber
from models.subscriber import new_token
from schemas.subscribers import (
    SubscribeIn,
    SubscriberStatsOut,
    SubscriptionStatusOut,
    TokenIn,
)
from services.email_sender import EmailSendError, send_email
from services.email_templates import confirmation_email

logger = logging.getLogger(__name__)

public_router = APIRouter(prefix="/public", tags=["subscriptions"])
admin_router = APIRouter(
    prefix="/subscribers",
    tags=["subscribers"],
    dependencies=[Depends(require_api_key)],
)


@public_router.post(
    "/subscribe",
    response_model=SubscriptionStatusOut,
    status_code=status.HTTP_202_ACCEPTED,
)
def subscribe(body: SubscribeIn, db: Session = Depends(get_db)) -> SubscriptionStatusOut:
    """Start (or restart) double opt-in for an address.

    The response is identical for a new, pending, unsubscribed, or already
    active address, so the endpoint can't be used to probe who's on the list.
    An active subscriber is left alone (no email) — re-confirming would be noise.
    """
    email = body.email.strip().lower()
    sub = db.query(Subscriber).filter(Subscriber.email == email).one_or_none()

    if sub is not None and sub.status == "active":
        return SubscriptionStatusOut(status="ok")

    if sub is None:
        sub = Subscriber(email=email)
        db.add(sub)
    else:
        # Pending (lost the first email) or previously unsubscribed: re-arm
        # with a fresh token so any old confirm link stops working.
        sub.status = "pending"
        sub.confirm_token = new_token()
        sub.unsubscribed_at = None

    try:
        db.commit()
    except IntegrityError:
        # A concurrent request inserted the same address first — that request
        # owns the confirmation email; answer the same as always.
        db.rollback()
        return SubscriptionStatusOut(status="ok")

    assert sub.confirm_token is not None
    try:
        send_email(confirmation_email(sub.email, sub.confirm_token))
    except EmailSendError:
        logger.exception("confirmation email failed: subscriber=%s", sub.id)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="could not send the confirmation email — please try again",
        )
    logger.info("subscriber pending confirmation: id=%s", sub.id)
    return SubscriptionStatusOut(status="ok")


@public_router.post("/subscribe/confirm", response_model=SubscriptionStatusOut)
def confirm_subscription(
    body: TokenIn, db: Session = Depends(get_db)
) -> SubscriptionStatusOut:
    sub = (
        db.query(Subscriber)
        .filter(Subscriber.confirm_token == body.token)
        .one_or_none()
    )
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="confirmation link is invalid or already used",
        )
    sub.status = "active"
    sub.confirm_token = None
    sub.confirmed_at = datetime.now(timezone.utc)
    db.commit()
    logger.info("subscriber confirmed: id=%s", sub.id)
    return SubscriptionStatusOut(status="active")


def _unsubscribe(db: Session, token: str) -> SubscriptionStatusOut:
    sub = (
        db.query(Subscriber)
        .filter(Subscriber.unsubscribe_token == token)
        .one_or_none()
    )
    if sub is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="unsubscribe link is invalid",
        )
    if sub.status != "unsubscribed":
        sub.status = "unsubscribed"
        sub.confirm_token = None
        sub.unsubscribed_at = datetime.now(timezone.utc)
        db.commit()
        logger.info("subscriber unsubscribed: id=%s", sub.id)
    return SubscriptionStatusOut(status="unsubscribed")


@public_router.post("/unsubscribe", response_model=SubscriptionStatusOut)
def unsubscribe(body: TokenIn, db: Session = Depends(get_db)) -> SubscriptionStatusOut:
    """The /unsubscribe page's button. Idempotent."""
    return _unsubscribe(db, body.token)


@public_router.post("/unsubscribe/one-click", response_model=SubscriptionStatusOut)
def unsubscribe_one_click(
    token: str = Query(...), db: Session = Depends(get_db)
) -> SubscriptionStatusOut:
    """RFC 8058 one-click target for the `List-Unsubscribe` header.

    Mail clients POST here with a form body (`List-Unsubscribe=One-Click`) and
    the token in the URL, so this route reads only the query string and
    ignores the body.
    """
    return _unsubscribe(db, token)


@admin_router.get("/stats", response_model=SubscriberStatsOut)
def subscriber_stats(db: Session = Depends(get_db)) -> SubscriberStatsOut:
    active = db.query(Subscriber).filter(Subscriber.status == "active").count()
    return SubscriberStatsOut(active=active)
