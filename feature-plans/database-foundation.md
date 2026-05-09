---
status: done
started: 2026-05-09
completed: 2026-05-09
---

# Feature: database-foundation

## Goal

Stand up the persistent data layer: SQLAlchemy models for `users`, `posts`, `sources`, `settings`; an Alembic initial migration that creates the schema and seeds the single `settings` row; a thin `database.py` (engine + `SessionLocal` + `get_db` FastAPI dependency); and an idempotent `seed_admin.py` that creates the admin user from `ADMIN_EMAIL` / `ADMIN_PASSWORD`. Done when `alembic upgrade head` produces the schema and `seed_admin.py` creates-then-skips the admin without error.

## Scope

- `backend/database.py` — SQLAlchemy `engine` (reads `DATABASE_URL` from env), `SessionLocal`, `Base`, and a `get_db()` generator suitable for `Depends(get_db)`.
- SQLAlchemy 2.x models in `backend/models/`:
  - `user.py` — `users` table (id UUID PK, email unique, hashed_password, created_at).
  - `post.py` — `posts` table per PLANNING.md (id, slug unique, title, content, summary, status enum, publishing_mode enum, tags `VARCHAR[]`, scheduled_at, published_at, created_at, updated_at, meta_description, generation_attempt).
  - `source.py` — `sources` table (id, post_id FK → posts, title, url, publisher, published_date).
  - `setting.py` — `settings` table (id PK = 1, publishing_mode enum, schedule_day, schedule_frequency, last_run_at, next_run_at).
- Postgres native ENUM types: `post_status` (`draft`, `pending_review`, `accepted`, `rejected`, `published`) and `publishing_mode` (`auto`, `approve_only`). Reused on both `posts.publishing_mode` and `settings.publishing_mode`.
- UUID primary keys generated app-side via Python `uuid.uuid4` (no Postgres extension required).
- Alembic: `alembic init` under `backend/`, `alembic.ini` + `env.py` wired to read `DATABASE_URL` from env and to import `Base.metadata` from `backend.database`. One initial migration creating all 4 tables + ENUM types + an `INSERT` for the single `settings` row with defaults (`publishing_mode='approve_only'`, `schedule_day='monday'`, `schedule_frequency='biweekly'`).
- `backend/scripts/seed_admin.py` — reads `ADMIN_EMAIL` and `ADMIN_PASSWORD` from env, looks up the user by email, creates with bcrypt-hashed password if missing, prints `created` or `already exists`. Exits non-zero only on real errors (missing env vars, DB unreachable).
- Add to `backend/requirements.txt`: `sqlalchemy`, `alembic`, `psycopg2-binary`, `passlib[bcrypt]` (pinned).
- Update `CLAUDE.md` Bash commands: drop TBD markers for `alembic upgrade head` and `seed_admin.py`.
- Update `PLANNING.md` Decision log: ENUM-as-Postgres-type, app-side UUIDs, settings-seeded-in-migration, sync SQLAlchemy + psycopg2.

## Out of scope

- Auth routes (`/auth/login`, `/auth/logout`), FastAPI auth dependency, JWT/session middleware — `auth-login` feature.
- Pydantic request/response schemas in `backend/schemas/` — added with the routers that consume them.
- Any router or endpoint that reads/writes the new tables (`/posts`, `/settings`, `/pipeline`) — later features. `get_db` exists but is unused by any router for now.
- `backend/scripts/reset_admin_password.py` — defer until needed.
- Production migration tooling (separate Alembic container, CI gate, etc.) — Phase 5.

## Success criteria

- `docker compose up -d` followed by `docker compose exec backend alembic upgrade head` completes with no errors.
- `psql` (via `localhost:5433`) shows all 4 tables, both Postgres ENUM types, and exactly one row in `settings` with the documented defaults.
- `docker compose exec backend python scripts/seed_admin.py` creates the admin user the first time and prints "already exists" on a second run, with no duplicate row and no traceback.
- `cd backend && pytest` passes (existing `/health` test + new model/seed tests).
- `alembic downgrade base && alembic upgrade head` completes cleanly with no schema or ENUM-type leftovers.

## Dependencies

- `ADMIN_EMAIL` and `ADMIN_PASSWORD` set in `.env` (already documented in `.env.example` from `backend-skeleton`).
- Postgres 17 container from `backend-skeleton` running on host port 5433.

## Tasks

- [x] Add `sqlalchemy`, `alembic`, `psycopg2-binary`, `passlib[bcrypt]` (pinned) to `backend/requirements.txt`; rebuild the backend image.
- [x] Create `backend/database.py` with `engine` (from `DATABASE_URL`), `SessionLocal`, `Base = declarative_base()`, and a `get_db()` generator.
- [x] Implement `backend/models/user.py` (User model).
- [x] Implement `backend/models/post.py` (Post model + `post_status` and `publishing_mode` ENUM definitions, shared with Setting).
- [x] Implement `backend/models/source.py` (Source model with FK to Post).
- [x] Implement `backend/models/setting.py` (Setting model — single-row, `id` defaults to `1`).
- [x] Wire `backend/models/__init__.py` to import all models so Alembic autogenerate sees them.
- [x] `alembic init alembic` inside `backend/`; configure `alembic.ini` + `env.py` to read `DATABASE_URL` from env and use `Base.metadata` as the target.
- [x] Generate the initial migration (autogenerated, then hand-tightened) creating tables + ENUM types + INSERT of the single `settings` row with documented defaults; ensure `downgrade()` drops both tables and ENUM types.
- [x] Implement `backend/scripts/seed_admin.py`: read env, find-or-create admin by email, bcrypt-hash password via `passlib`, print `created`/`already exists`, exit 0 on success.
- [x] Add `backend/tests/test_models.py`: instantiate each model with valid fields; assert defaults (e.g., generated UUID, default enum values).
- [x] Add `backend/tests/test_seed_admin.py`: run the seed function twice against a test DB; assert one user row and a bcrypt-formatted hash (`$2b$...`) — never plain text.
- [x] Update `CLAUDE.md` "Bash commands": remove TBD on `alembic upgrade head` and `seed_admin.py`.
- [x] Update `PLANNING.md` Decision log with: Postgres native ENUMs, app-side UUIDs, settings row seeded in initial migration, sync SQLAlchemy + psycopg2 driver choice.

## Verification

- [x] `docker compose up -d && docker compose exec backend alembic upgrade head` succeeds.
- [x] `psql postgres://...@localhost:5433/...` (or `docker compose exec db psql ...`): `\dt` shows 4 tables; `\dT+` shows `post_status` and `publishing_mode`; `SELECT * FROM settings;` returns exactly one row with defaults.
- [x] `docker compose exec backend python scripts/seed_admin.py` prints `created`; second run prints `already exists`; `SELECT count(*) FROM users;` returns 1. (Verified with throwaway `test@example.com` row, then deleted; user must set real `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env` and run for the actual admin.)
- [x] `cd backend && pytest` passes. (Now run as `docker compose run --rm backend pytest` — see CLAUDE.md update; 8/8 passing.)
- [x] `docker compose exec backend alembic downgrade base && docker compose exec backend alembic upgrade head` completes cleanly with no errors and the schema returns to the post-upgrade state (4 tables + 2 ENUMs + seeded settings row).
