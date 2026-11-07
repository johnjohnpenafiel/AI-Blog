import uuid

import pytest
from sqlalchemy.exc import IntegrityError

from models import Post, Setting, Subscriber, User
from models.post import post_status_enum, publishing_mode_enum
from models.subscriber import subscriber_status_enum


def test_post_status_enum_values():
    assert set(post_status_enum.enums) == {
        "draft",
        "pending_review",
        "accepted",
        "rejected",
        "published",
    }


def test_publishing_mode_enum_values():
    assert set(publishing_mode_enum.enums) == {"auto", "approve_only"}


def test_user_insert_assigns_uuid_and_timestamp(db):
    user = User(email="alice@delorean.test", hashed_password="hash")
    db.add(user)
    db.flush()
    assert isinstance(user.id, uuid.UUID)
    assert user.created_at is not None


def test_post_defaults_apply_on_flush(db):
    post = Post(
        slug="hello-world",
        title="Hello",
        content="body",
        summary="summary",
        publishing_mode="auto",
        meta_description="meta",
    )
    db.add(post)
    db.flush()
    assert isinstance(post.id, uuid.UUID)
    assert post.status == "draft"
    assert post.tags == []
    assert post.generation_attempt == 1
    assert post.created_at is not None
    assert post.updated_at is not None


def test_subscriber_status_enum_values():
    assert set(subscriber_status_enum.enums) == {"pending", "active", "unsubscribed"}


def test_subscriber_defaults_apply_on_flush(db):
    sub = Subscriber(email="reader@delorean.test")
    db.add(sub)
    db.flush()
    assert isinstance(sub.id, uuid.UUID)
    assert sub.status == "pending"
    assert sub.confirm_token and sub.unsubscribe_token
    assert sub.confirm_token != sub.unsubscribe_token
    assert sub.created_at is not None
    assert sub.confirmed_at is None


def test_subscriber_email_is_unique(db):
    db.add(Subscriber(email="dup@delorean.test"))
    db.flush()
    db.add(Subscriber(email="dup@delorean.test"))
    with pytest.raises(IntegrityError):
        db.flush()


def test_post_emailed_at_defaults_to_null(db):
    post = Post(
        slug="not-emailed",
        title="T",
        content="body",
        summary="s",
        publishing_mode="auto",
        meta_description="m",
    )
    db.add(post)
    db.flush()
    assert post.emailed_at is None


def test_settings_row_seeded_by_migration(db):
    s = db.query(Setting).filter(Setting.id == 1).one()
    assert s.publishing_mode == "approve_only"
    assert s.schedule_frequency == "twice_weekly"
