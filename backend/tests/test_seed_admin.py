from models import User
from scripts.seed_admin import seed_admin


def test_seed_admin_creates_then_skips(db):
    email = "creates-then-skips@delorean.test"

    first = seed_admin(db, email, "pw-12345")
    assert first == "created"

    second = seed_admin(db, email, "pw-12345")
    assert second == "already_exists"

    rows = db.query(User).filter(User.email == email).all()
    assert len(rows) == 1


def test_seed_admin_stores_bcrypt_hash(db):
    email = "hash-format@delorean.test"
    plain = "another-throwaway-pw"

    seed_admin(db, email, plain)

    user = db.query(User).filter(User.email == email).one()
    assert user.hashed_password.startswith("$2b$")
    assert user.hashed_password != plain
    assert len(user.hashed_password) == 60
