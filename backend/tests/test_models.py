import uuid

from models import Post, Setting, User
from models.post import post_status_enum, publishing_mode_enum


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


def test_settings_row_seeded_by_migration(db):
    s = db.query(Setting).filter(Setting.id == 1).one()
    assert s.publishing_mode == "approve_only"
    assert s.schedule_frequency == "twice_weekly"
