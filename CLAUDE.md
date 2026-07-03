# AI-Blog (The Garage AI)

Automated blog on AI and operational technology in the automotive industry, publishing three times a week. The pipeline runs on a fixed Monday / Thursday / Friday cadence at 8 AM — a Brief on Monday, a Deep Dive on Thursday, and a Roundup on Friday. Two surfaces: a public-facing blog (The Garage AI) and a private admin dashboard for the single operator.

> **Naming:** "The Garage AI" is the public brand used everywhere in code and user-facing surfaces. "DeLorean" is the internal codename, retained only in the design language (`Design/README.md`) and historical decision-log entries.

# Bash commands

> Update each entry below as soon as the corresponding scaffold lands. Don't run a command from this list until it's been confirmed to exist.

- Frontend dev: `cd frontend && npm run dev` (boots Next.js on `:3000`)
- Frontend build: `cd frontend && npm run build`
- Frontend typecheck: `cd frontend && npm run typecheck`
- Frontend lint: `cd frontend && npm run lint`
- Frontend tests: `cd frontend && npm test` (Vitest, headless)
- Backend dev: `cd backend && uvicorn main:app --reload` (or run via Docker — see below)
- Backend tests: `docker compose run --rm backend pytest` (needs the `db` service running for DB-touching tests)
- DB migrations: `docker compose run --rm backend alembic upgrade head`
- Stack up (Docker): `docker compose up -d --build` (backend on `:8000`, Postgres on host `:5433`)
- Stack down: `docker compose down` (add `-v` to wipe Postgres data)
- Seed admin: `docker compose run --rm backend python scripts/seed_admin.py` (reads `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`; idempotent)

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
- Never commit secrets. `.env` is git-ignored — values for `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL`, `BACKEND_API_SECRET`, `TRELLO_API_KEY`, `TRELLO_TOKEN` live there only (the frontend's copy of `BACKEND_API_SECRET` lives in the git-ignored `frontend/.env.local`).
- Never use `--no-verify` on commits.
- Before claiming a task complete: list what was asked vs. what was done; explicitly call out anything skipped.

# Trello (idea & task tracking)

**Trello is the source of truth for future ideas and action items.** When the user shares an idea or future action to track (or says "add this to Trello"), create a card via the REST API below — default to the **Backlog** list. Do **not** add new ideas to `notes/v2-ideas.md`: that doc is **frozen/historical** as of 2026-06-08 (its pending ideas were ported to Trello) and `notes/` is gitignored scratch anyway. Read `v2-ideas.md` only for the *why* behind a past decision.

- **Auth:** `TRELLO_API_KEY` + `TRELLO_TOKEN` live in the root `.env` (git-ignored secrets — never print or commit them). Read them inline; never echo: `K=$(grep '^TRELLO_API_KEY=' .env | cut -d= -f2-); T=$(grep '^TRELLO_TOKEN=' .env | cut -d= -f2-)`. Token is `read,write` scope, 30-day expiry — re-authorize when it lapses (cards start 401ing).
- **Board id:** `6a2706e706ae9d3f9804f73f`
- **List ids:** Backlog `6a2706e706ae9d3f9804f755` · Up Next `6a2706e706ae9d3f9804f756` · In Progress `6a2706e706ae9d3f9804f757` · Blocked `6a27070d3199301e737b92f0` · Done `6a2707105fd49468e7e1b4e2`
- **Default landing list for new ideas:** **Backlog** (unless the user names another).
- **Label:** tag every card *you* create with the **`Claude`** label (orange, id `6a27768225fcdee5d2365202`) via `idLabels=6a27768225fcdee5d2365202` on create. That's the only label — no area/topic labels. Never add `Claude` to cards the user created themselves.
- IDs are not secret — safe to keep here. Only the key/token are secret (in `.env`).

Common calls (always pass secrets via `--data-urlencode`, never in a printed URL):
```bash
# Create a card
curl -s -X POST "https://api.trello.com/1/cards" \
  --data-urlencode "idList=$LIST_ID" --data-urlencode "name=Title" \
  --data-urlencode "desc=Body" --data-urlencode "key=$K" --data-urlencode "token=$T"
# List cards in a list
curl -s "https://api.trello.com/1/lists/$LIST_ID/cards?fields=name,id,desc&key=$K&token=$T"
# Move/rename a card
curl -s -X PUT "https://api.trello.com/1/cards/$CARD_ID?idList=$LIST_ID&key=$K&token=$T"
```

# Architecture context

See @PLANNING.md for the system architecture, stack decisions, data model, API contracts, and pipeline logic. The full decision log is in `PLANNING-decisions.md` (not `@`-imported — read it on demand when you need the *why* behind a past choice).

Before making architectural changes (new tables, new endpoints, schema migrations, scheduler behavior changes, new top-level modules): STOP, confirm with the user, then update both files in the same commit — PLANNING.md to reflect the *new state*, and PLANNING-decisions.md with a dated entry capturing the *why and tradeoffs*. Documentation drift here is the most common source of stale context.

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
- The slash commands and hooks under `.claude/` are synced from the canonical toolkit at `~/Development/ai-workflow/`. Look there for the upstream source, additional templates (e.g. `feature-plan.template.md`), and workflow docs.

# Gotchas

- The single admin user is created via `backend/scripts/seed_admin.py`, not through any UI. There is no registration flow. There is no password-reset script or UI yet — `seed_admin.py` is find-or-create and won't update an existing user's password (delete the `users` row and re-seed with a new `ADMIN_PASSWORD`, or update the row directly).
- APScheduler must run inside the FastAPI process — if you split the backend across workers, only one worker should own the scheduler, or jobs will fire multiple times.
- The DB engine must keep `pool_pre_ping=True` (`backend/database.py`) — Neon autosuspends on idle and kills connections; without the ping, the first DB call after a wake-up (usually the 8 AM cron) fails silently. This caused the Jun 18–Jul 2, 2026 outage (2026-07-03 decision-log entry).
- The pipeline (`POST /pipeline/run`) requires both `ANTHROPIC_API_KEY` and `PERPLEXITY_API_KEY` set in `.env`. A run with fewer than 3 qualifying articles from Perplexity skips the run entirely (logged, not retried).
- `publishing_mode` is snapshotted onto the post at generation time — changing the global setting later does NOT retroactively change posts already in the queue.
- NextAuth session expiry is 2 hours; do not extend without confirming with the user.
- Backend auth is a shared secret, not per-user. Protected routes (`/posts/*`, `/pipeline/*`, `/settings`) require `BACKEND_API_SECRET` via `Authorization: Bearer <secret>`, enforced by `require_api_key` (`backend/dependencies.py`); `/public/*`, `/auth/*`, and `/health` stay open. The secret must be set **identically** on both sides — backend (`.env` → Render) and frontend (`frontend/.env.local` → Vercel) — or the admin dashboard 401s/500s (the public blog is unaffected). The backend fails closed: a missing secret returns 500, never an open route. The Next.js `/api/*` proxy also checks the NextAuth session before forwarding. See the 2026-05-29 decision-log entry for why shared-secret over JWT verification.
- Single dark theme. No images in UI. Don't add a light/dark toggle or photographic assets.
