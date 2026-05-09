---
status: done
started: 2026-05-08
completed: 2026-05-09
---

# Feature: backend-skeleton

## Goal

Stand up a runnable FastAPI app + Docker Compose + Postgres environment so every later backend feature has a foundation to build on. Done when `docker compose up` boots cleanly and `GET /health` returns 200.

## Scope

- `backend/` directory with FastAPI app structure: `main.py` plus empty packages for `routers/`, `services/`, `models/`, `schemas/`, `scripts/` (each with `__init__.py`) so later features have a place to land.
- `GET /health` endpoint returning `{"status": "ok"}` with HTTP 200.
- `docker-compose.yml` at the repo root with two services:
  - `backend` — FastAPI/uvicorn with hot reload, code mounted as a volume
  - `db` — Postgres 17 (`postgres:17-alpine`) with a named volume for persistence
- Python project files: `backend/requirements.txt` (fastapi, uvicorn[standard], pytest, httpx), `backend/Dockerfile`, `.env.example` documenting required vars.
- Update `CLAUDE.md` "Bash commands" section: remove TBD markers for the commands this feature makes real (`backend dev`, `backend tests`, `docker compose up`).

## Out of scope

- SQLAlchemy models, Alembic, any DB schema or migrations — deferred to `database-foundation`. Postgres runs in Docker but the app does not connect to it yet.
- Auth: no `/auth` routes, password hashing, or `seed_admin.py` — deferred to `auth-login`.
- Pipeline / external APIs: no Anthropic, Perplexity, or APScheduler — Phase 2.
- CI, production Dockerfile, healthcheck container directives, GitHub Actions — Phase 5.

## Success criteria

- `docker compose up -d` boots both services cleanly with no errors in logs.
- `curl http://localhost:8000/health` returns HTTP 200 with body `{"status":"ok"}`.
- Postgres container is reachable on its mapped port (e.g. `psql` or `pg_isready` from the host succeeds).

## Dependencies

- Docker Desktop installed and running (confirmed 2026-05-08: Docker 29.4.2, Compose v5.1.3).
- Python 3.13 available locally (already installed via pyenv).

## Tasks

- [x] Create `backend/` package skeleton: `main.py`, `routers/__init__.py`, `services/__init__.py`, `models/__init__.py`, `schemas/__init__.py`, `scripts/__init__.py`, `tests/__init__.py`.
- [x] Implement `GET /health` in `backend/main.py` returning `{"status": "ok"}`.
- [x] Write `backend/requirements.txt` with fastapi, uvicorn[standard], pytest, httpx (pinned versions).
- [x] Write `backend/Dockerfile` (slim Python 3.13 base, install requirements, run uvicorn with --reload).
- [x] Write `docker-compose.yml` at repo root with `backend` + `db` services, volume mount for backend code, named volume for Postgres data, `.env` referenced for DB credentials.
- [x] Write `.env.example` documenting `DATABASE_URL`, `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` (values blank or placeholder).
- [x] Write `backend/tests/test_health.py` — one test using FastAPI `TestClient` asserting `/health` returns 200 + `{"status":"ok"}`.
- [x] Update `CLAUDE.md` "Bash commands" section: drop "TBD" markers for the commands this feature makes real.
- [x] Update `PLANNING.md` Stack decisions + Decision log: pin Postgres 17 in local Docker; record the choice. (Same commit as `docker-compose.yml`.)

## Verification

- [x] `docker compose up -d` boots both services without error.
- [x] `curl http://localhost:8000/health` returns HTTP 200 with `{"status":"ok"}`.
- [x] `http://localhost:8000/docs` renders the FastAPI Swagger UI and shows the `/health` endpoint.
- [x] `docker compose down` followed by `docker compose up -d` boots cleanly with no state issues.
- [x] `cd backend && pytest` passes (1 test).

## Notes

- Added `backend/pytest.ini` (`pythonpath = .`, `testpaths = tests`) during verification — pytest couldn't import `main` from `tests/test_health.py` without `/app` on `sys.path`. Standard pytest idiom; expected to stay as more tests land.
- Added `backend/.dockerignore` (covered by Scope item #4 "Python project files").
