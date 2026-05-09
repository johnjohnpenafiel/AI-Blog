# AI-Blog (DeLorean)

Automated bi-weekly blog on AI and operational technology in the automotive industry. Two surfaces: a public-facing blog (DeLorean) and a private admin dashboard for the single operator.

# Bash commands

> The frontend and backend are not yet scaffolded. Update each entry below as soon as the corresponding scaffold lands. Don't run a command from this list until it's been confirmed to exist.

- Frontend dev: `cd frontend && npm run dev` — TBD (no Next.js scaffold yet)
- Frontend build: `cd frontend && npm run build` — TBD
- Frontend typecheck: `cd frontend && npm run typecheck` — TBD
- Frontend lint: `cd frontend && npm run lint` — TBD
- Backend dev: `cd backend && uvicorn main:app --reload` (or run via Docker — see below)
- Backend tests: `cd backend && pytest`
- DB migrations: `cd backend && alembic upgrade head` — TBD (lands in `database-foundation`)
- Stack up (Docker): `docker compose up -d --build` (backend on `:8000`, Postgres on host `:5433`)
- Stack down: `docker compose down` (add `-v` to wipe Postgres data)
- Seed admin: `cd backend && python scripts/seed_admin.py` — TBD (lands in `database-foundation`)

# Collaboration mode

The user is new to **FastAPI** and **Docker Compose** and is learning both while building this project. When work touches either of these technologies:

- Be an educator and guide alongside being an implementer.
- Briefly explain the *why* behind non-obvious choices (decorator behavior, dependency injection, container networking, volume mounts, env var passing, etc.) before or just after applying them.
- Call out FastAPI/Docker idioms when they first appear so the user builds a mental model, not just a working file.
- Keep moving — this is a real project on a schedule. Default to short, in-line teaching beats long lectures. If a concept needs more depth, offer "want me to expand on this?" instead of dumping it.
- Other technologies in the stack (Next.js, TypeScript, Postgres, etc.) do NOT need this treatment unless the user asks.

# Code style

- Python: standard PEP 8, snake_case, type-hinted public functions.
- TypeScript / React: kebab-case file names, PascalCase components, camelCase variables.
- DB columns: snake_case. JSON API responses: snake_case (Pydantic default).
- Tailwind: prefer design tokens (`--bg`, `--surface`, `--accent`, etc. — see `@Design/README.md`) over inline color values.
- Keep files under ~500 lines — split when approaching the limit.

# Workflow

- Branch naming: `feature/<name>`, `bugfix/<name>`, `chore/<name>`.
- Commit style: present-tense imperative (`add ...`, `fix ...`, `update ...`). One logical change per commit.
- Never commit secrets. `.env` is git-ignored — values for `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL` live there only.
- Never use `--no-verify` on commits.
- Before claiming a task complete: list what was asked vs. what was done; explicitly call out anything skipped.

# Architecture context

See @PLANNING.md for the system architecture, stack decisions, data model, API contracts, pipeline logic, and decision log.

Before making architectural changes (new tables, new endpoints, schema migrations, scheduler behavior changes, new top-level modules): STOP, confirm with the user, then update @PLANNING.md in the same commit. Documentation drift here is the most common source of stale context.

# UI / design work

For any frontend or UI work, read @Design/README.md first. The design system (color tokens, typography, decorative elements, page-by-page UI structure for both surfaces) is the source of truth for visual decisions.

# Feature Plan Workflow

A "feature" is net-new user-facing functionality. Bugs, hotfixes, dependency upgrades, and refactors are NOT features and don't need a plan — track those in GitHub Issues (or a tracker) instead.

- Each feature gets `feature-plans/<name>.md` with frontmatter `status:` (in-progress, blocked, paused, abandoned, done).
- Before starting a new feature, run `/start-feature <name>`. It checks the open-plan limit, interviews you for scope, and creates the plan file.
- When done, run `/complete-feature <name>`. It audits checkboxes, verifies against the original goal, and prepares cleanup.
- Hard limit: max 2 plans `in-progress` at once. A `PreToolUse` hook enforces this (`.claude/hooks/block-new-feature-plan.py`).
- A plan in `blocked` or `paused` doesn't count against the limit, but the user must have explicitly set the status.
- When a feature merges, delete the file in the merge commit.

# Gotchas

- The single admin user is created via `backend/scripts/seed_admin.py`, not through any UI. There is no registration flow. Password resets go through `backend/scripts/reset_admin_password.py`.
- APScheduler must run inside the FastAPI process — if you split the backend across workers, only one worker should own the scheduler, or jobs will fire multiple times.
- The pipeline (`POST /pipeline/run`) requires both `ANTHROPIC_API_KEY` and `PERPLEXITY_API_KEY` set in `.env`. A run with fewer than 3 qualifying articles from Perplexity skips the run entirely (logged, not retried).
- `publishing_mode` is snapshotted onto the post at generation time — changing the global setting later does NOT retroactively change posts already in the queue.
- NextAuth session expiry is 2 hours; do not extend without confirming with the user.
- Single dark theme. No images in UI. Don't add a light/dark toggle or photographic assets.
