"""Idempotent seed script for the single admin user.

Reads ADMIN_EMAIL and ADMIN_PASSWORD from the environment, looks up the user
by email, and creates them with a bcrypt-hashed password if missing. Safe to
re-run.
"""
import os
import sys
from pathlib import Path

# Allow `python scripts/seed_admin.py` from /app (no PYTHONPATH=.)
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from passlib.hash import bcrypt  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from models import User  # noqa: E402


def seed_admin(session: Session, email: str, password: str) -> str:
    """Find-or-create the admin user. Returns 'created' or 'already_exists'.

    Caller is responsible for committing the session.
    """
    existing = session.query(User).filter(User.email == email).one_or_none()
    if existing is not None:
        return "already_exists"

    user = User(email=email, hashed_password=bcrypt.hash(password))
    session.add(user)
    session.flush()
    return "created"


def main() -> int:
    email = os.environ.get("ADMIN_EMAIL")
    password = os.environ.get("ADMIN_PASSWORD")
    if not email or not password:
        print(
            "error: ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment",
            file=sys.stderr,
        )
        return 1

    from database import SessionLocal

    db = SessionLocal()
    try:
        result = seed_admin(db, email, password)
        db.commit()
        if result == "created":
            print(f"admin user created: {email}")
        else:
            print(f"admin user already exists: {email}")
        return 0
    finally:
        db.close()


if __name__ == "__main__":
    sys.exit(main())
