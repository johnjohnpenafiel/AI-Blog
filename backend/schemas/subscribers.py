"""Pydantic schemas for the subscription endpoints."""
from pydantic import BaseModel, EmailStr


class SubscribeIn(BaseModel):
    email: EmailStr


class TokenIn(BaseModel):
    token: str


class SubscriptionStatusOut(BaseModel):
    """`ok` for subscribe (deliberately the same for every address), else the
    subscriber's resulting status."""

    status: str


class SubscriberStatsOut(BaseModel):
    active: int
