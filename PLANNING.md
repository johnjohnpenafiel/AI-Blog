# AI-Blog (DeLorean) — Planning

> Long-form context about this project. CLAUDE.md `@`-imports this file, so every session has access to it. Update this file whenever you make an architectural decision.

## Project overview

DeLorean is an automated bi-weekly blog covering AI and operational technology developments in the automotive industry. The system has two surfaces: a public-facing blog where readers discover and share posts, and a private admin dashboard where a single operator manages the publishing pipeline, reviews AI-generated content, and configures system behavior. Content is generated end-to-end by an automated pipeline that fetches news from Perplexity Sonar, drafts a post with Claude, and either publishes immediately or routes to a review queue based on the configured publishing mode.

The audience is dealership operators, automotive tech executives, and industry observers — not car enthusiasts. Codebase intervention is reserved for bugs, updates, and new features only; the publishing loop runs without code changes.

## Architecture

```
                    ┌─────────────────────────┐
                    │   Perplexity Sonar API  │
                    └────────────┬────────────┘
                                 │ news fetch
                                 ▼
┌─────────────┐    HTTP    ┌─────────────┐    SQL    ┌──────────────┐
│  Frontend   │ ─────────► │   Backend   │ ────────► │  PostgreSQL  │
│  Next.js 14 │            │   FastAPI   │           │  (SQLAlchemy │
│  (App Rtr)  │ ◄───────── │   + APSch.  │ ◄──────── │   + Alembic) │
└─────────────┘   JSON     └─────┬───────┘   rows    └──────────────┘
                                 │ generate
                                 ▼
                    ┌─────────────────────────┐
                    │   Anthropic Claude API  │
                    │  (claude-sonnet-4-...)  │
                    └─────────────────────────┘
```

### Components

- **Frontend** (`frontend/`): Next.js 14 with App Router, Tailwind CSS, shadcn/ui. Two route groups: `(public)` for the DeLorean blog (homepage, post pages, about) and `dashboard/` for the admin UI (overview, queue, scheduled, published, settings). NextAuth handles credential-based login for the admin only.
- **Backend** (`backend/`): Python + FastAPI. Routers: `posts.py`, `pipeline.py`, `settings.py`, plus auth endpoints. Services: `news_fetcher.py` (Perplexity), `blog_writer.py` (Claude), `publisher.py` (status routing). `scheduler.py` runs APScheduler in-process for the bi-weekly cron.
- **Database**: PostgreSQL. Schema managed by SQLAlchemy models + Alembic migrations.
- **External services**:
  - Anthropic Claude API (`claude-sonnet-4-20250514`) — blog generation.
  - Perplexity Sonar API — news aggregation with intent-based queries.
- **Auth**: NextAuth.js, credentials provider, single seeded admin user, 2-hour session TTL. Passwords stored as bcrypt hashes via `passlib`.
- **Environment**: Docker Compose for local dev. Deployable to Railway, Render, or a VPS.

### Repository layout

```
/
├── frontend/                  # Next.js app
│   ├── app/
│   │   ├── (public)/                  # Public blog — DeLorean
│   │   │   ├── page.tsx               # Homepage / post list
│   │   │   ├── blog/[slug]/page.tsx   # Individual post page
│   │   │   └── about/page.tsx         # About DeLorean
│   │   ├── (auth)/login/
│   │   ├── dashboard/
│   │   │   ├── page.tsx               # Overview / stats
│   │   │   ├── queue/                 # Review queue
│   │   │   ├── scheduled/             # Scheduled posts
│   │   │   ├── published/             # Published posts
│   │   │   └── settings/              # System settings
│   │   └── layout.tsx
│   ├── components/
│   └── lib/
│
├── backend/                   # FastAPI app
│   ├── main.py
│   ├── routers/{posts.py, pipeline.py, settings.py}
│   ├── services/{news_fetcher.py, blog_writer.py, publisher.py}
│   ├── scripts/{seed_admin.py, reset_admin_password.py}
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── scheduler.py
│   └── database.py
│
├── docker-compose.yml
└── .env
```

## Stack decisions

- **Next.js 14 (App Router)**: Server components fit the public-blog use case (mostly read, SEO-sensitive); App Router lets us co-locate route groups for the public surface and admin dashboard cleanly. shadcn/ui chosen because we own the component code and can theme it freely.
- **Python + FastAPI**: The pipeline does heavy lifting against two LLM/AI APIs — Python's ecosystem (Anthropic SDK, `passlib`, APScheduler) is the path of least resistance. FastAPI gives us typed routers and Pydantic validation cheaply.
- **PostgreSQL 17**: Standard, well-supported on Railway/Render. Postgres array column type fits the `tags VARCHAR[]` field without a join table. Pinned to `postgres:17-alpine` in local Docker — matches the developer's host Homebrew client (17.7), so client/server versions stay aligned. The `db` service exposes host port **5433** (not 5432) to avoid a bind conflict with the host's local Postgres install.
- **SQLAlchemy + Alembic**: Mature combo; Alembic gives us migration history, which matters because schema changes flow through the architecture-change gate (see CLAUDE.md).
- **APScheduler in-process**: Simple deployment — no separate worker process for the bi-weekly cron. Tradeoff: a horizontally scaled backend would need to designate one scheduler-owning worker. Not a concern at MVP scale (single instance).
- **NextAuth credentials provider**: Single admin, no SSO, no third-party identity. Credentials provider is the lowest-friction option. 2-hour session TTL chosen to balance convenience against the risk of an unattended laptop with the admin dashboard open.
- **Anthropic Claude (`claude-sonnet-4-20250514`)**: Sonnet hits the cost/quality balance for 600–900-word posts. Pinned to a specific snapshot ID so generation behavior doesn't drift mid-cycle.
- **Perplexity Sonar**: Replaces a build-our-own news fetcher + relevance filter. Sonar understands intent and returns pre-filtered results with source citations, removing a whole layer of curation logic from our codebase.

## Data model

### `users`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| email | VARCHAR | unique |
| hashed_password | VARCHAR | bcrypt via passlib |
| created_at | TIMESTAMP | |

### `posts`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| slug | VARCHAR | unique, auto-generated from title |
| title | VARCHAR | AI-generated |
| content | TEXT | Markdown |
| summary | VARCHAR | 2–3 sentence summary |
| status | ENUM | `draft`, `pending_review`, `accepted`, `rejected`, `published` |
| publishing_mode | ENUM | `auto`, `approve_only` (snapshot at generation time) |
| tags | VARCHAR[] | Auto-generated topic tags |
| scheduled_at | TIMESTAMP | nullable |
| published_at | TIMESTAMP | nullable |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |
| meta_description | VARCHAR | Auto-generated for SEO |
| generation_attempt | INT | Tracks regeneration count |

### `sources`
| Column | Type | Notes |
|---|---|---|
| id | UUID | PK |
| post_id | UUID | FK → posts |
| title | VARCHAR | Article title |
| url | VARCHAR | Source URL |
| publisher | VARCHAR | e.g. "TechCrunch" |
| published_date | DATE | |

### `settings`
| Column | Type | Notes |
|---|---|---|
| id | INT | PK (single row) |
| publishing_mode | ENUM | `auto` or `approve_only` |
| schedule_day | VARCHAR | e.g. `monday` |
| schedule_frequency | VARCHAR | `biweekly` |
| last_run_at | TIMESTAMP | |
| next_run_at | TIMESTAMP | |

## API contracts

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Validate credentials, return session token |
| POST | `/auth/logout` | Invalidate session |

### Public (no auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/public/posts` | List published posts |
| GET | `/public/posts/{slug}` | Get single published post by slug |

### Posts (admin auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/posts` | List all posts (filterable by status) |
| GET | `/posts/{id}` | Get single post with sources |
| POST | `/posts/{id}/accept` | Accept post (optionally set scheduled_at) |
| POST | `/posts/{id}/reject` | Reject post |
| POST | `/posts/{id}/regenerate` | Regenerate with optional feedback |
| POST | `/posts/{id}/publish` | Manually publish an accepted post |

### Pipeline
| Method | Path | Description |
|---|---|---|
| POST | `/pipeline/run` | Manually trigger a pipeline run |
| GET | `/pipeline/status` | Last run time, next scheduled run, current status |

### Settings
| Method | Path | Description |
|---|---|---|
| GET | `/settings` | Get current settings |
| PATCH | `/settings` | Update publishing mode, schedule |

## Pipeline logic

### Step 1 — News fetching (`backend/services/news_fetcher.py`)

Send intent-based queries to Perplexity Sonar:

- `"AI tools being used in car dealerships past 2 weeks"`
- `"AI voice agents for automotive sales and customer service"`
- `"dealership CRM modernization AI"`
- `"automotive merchandising inspection automation"`
- `"tech companies entering automotive operations"`

Sonar returns pre-filtered, relevant results with source citations. No additional relevance filtering. Minimum threshold: 3 qualifying articles to proceed; below threshold the run is skipped and logged.

### Step 2 — Blog generation (`backend/services/blog_writer.py`)

Send qualifying articles to Claude with the prompt below. Claude returns JSON with `title`, `slug`, `summary`, `meta_description`, `body` (Markdown), `tags` (2–4 of: Voice AI, Pricing & Analytics, CRM, Merchandising, Sales Dev, OT & Infrastructure, Industry Move), and `sources`.

#### Prompt

```
You are a professional tech journalist writing for an automotive industry blog.

Your audience: dealership operators, automotive tech executives, and industry
observers who want to stay current on AI and operational technology — not car
enthusiasts.

Using the following articles as source material, write a blog post.

Requirements:
- Title: punchy and informative
- Summary: 2–3 sentences
- Body: 600–900 words, markdown formatted, no fluff
- Tone: authoritative, clear, slightly forward-looking
- Tags: select 2–4 from [Voice AI, Pricing & Analytics, CRM, Merchandising,
  Sales Dev, OT & Infrastructure, Industry Move]
- Sources: list each article used

Articles:
{articles_json}

Respond in JSON only:
{
  "title": "",
  "slug": "",
  "summary": "",
  "meta_description": "",
  "body": "",
  "tags": [],
  "sources": [{"title": "", "url": "", "publisher": "", "published_date": ""}]
}
```

### Step 3 — Routing (`backend/services/publisher.py`)

- `publishing_mode = auto` → set `status = published`, `published_at = now()`.
- `publishing_mode = approve_only` → set `status = pending_review`. Post appears in admin review queue.

`publishing_mode` is snapshotted onto the post at generation time. Changing the global setting later does NOT retroactively change posts already in the queue.

## Conventions

### Naming
- Files: `kebab-case.tsx` for frontend, `snake_case.py` for backend.
- Database: `snake_case` columns, `plural` table names.
- API: `snake_case` JSON (Pydantic default), kebab-case URLs.
- Branches: `feature/<name>`, `bugfix/<name>`, `chore/<name>`.

### Auth & sessions
- Single admin, seeded via `backend/scripts/seed_admin.py`. Idempotent — safe to re-run.
- Passwords: bcrypt via `passlib`. Plain text never persisted.
- Session expiry: 2 hours (NextAuth setting). No "remember me," no SSO.
- Password resets: via `backend/scripts/reset_admin_password.py`. No forgot-password UI.

### Slugs & SEO
- Slugs auto-generated from titles, URL-safe (e.g. `ai-voice-agents-transforming-dealerships`). Stored unique on the `posts` table.
- Each post has an auto-generated `meta_description` (1 sentence, SEO).
- Open Graph tags rendered per post.

### Publishing modes
| Mode | Behavior |
|---|---|
| **Auto** | Post is generated and published immediately. No admin action required. |
| **Approve Only** | Post is generated and placed in the review queue. Admin must accept before it publishes. Once accepted, admin can publish instantly or schedule for a future date/time. |

### Scheduling
- APScheduler bi-weekly cron, default every other Monday at 8:00 AM.
- Day-of-week is configurable via Settings; frequency is fixed at bi-weekly (not exposed in UI).
- Manual trigger always available from the dashboard.

## Constraints and non-negotiables

- **Single dark theme.** No light/dark toggle. Color tokens defined in `Design/README.md`.
- **No images in the UI.** Typography and color carry the design across both surfaces.
- **Single admin user.** No registration flow, no multi-user roles.
- **Bi-weekly cadence is fixed.** Day-of-week configurable; frequency is not.
- **Source transparency.** Every post must list its sources (title, publisher, link, date) — this is part of the editorial contract with the audience.
- **Secrets stay in `.env`.** `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL` never committed.

## Decision log

New entries at the top.

### 2026-05-08 — Postgres 17 pinned; host port 5433 in local Docker
**Context**: `backend-skeleton` feature scaffolds `docker-compose.yml`. Developer machine already runs Homebrew Postgres 17.7 as a launchd service bound to host port 5432.
**Decision**: Pin the `db` service to `postgres:17-alpine` and map host port **5433 → container 5432**. Container-internal connection string remains `postgresql://...@db:5432/...`; host-side tools connect via `localhost:5433`.
**Rationale**: Matching major versions (host client 17.7 ↔ container server 17.x) avoids client/server warnings and behavior drift. Host port 5433 sidesteps the bind conflict without requiring the developer to stop the local Postgres service.
**Tradeoffs**: Anyone joining the project who *doesn't* have a local Postgres on 5432 will still connect via 5433 — slight surprise, but documented in `.env.example` and PLANNING.md. If the project later moves to managed Postgres on Railway/Render, the host port mapping is irrelevant.

### 2026-05-08 — Initial stack and architecture frozen
**Context**: First session on the project. SPEC.md and DELOREAN_UI_BRIEF.md describe the system in detail; ai-workflow toolkit prescribes the foundation files.
**Decision**: Adopt the full SPEC.md stack as-is — Next.js 14 (App Router) + FastAPI + Postgres + SQLAlchemy/Alembic + NextAuth credentials + APScheduler + Claude `claude-sonnet-4-20250514` + Perplexity Sonar. Fold SPEC.md into this PLANNING.md (delete SPEC.md). Move DELOREAN_UI_BRIEF.md to `Design/README.md`. Adopt the full ai-workflow toolkit (CLAUDE.md, PLANNING.md, slash commands, block-new-feature-plan hook).
**Rationale**: The SPEC was already comprehensive and self-consistent. Folding it into PLANNING.md keeps a single architectural source of truth that travels with the architecture-change gate. Putting the UI brief at `Design/README.md` matches the `@Design/README.md` convention referenced in CLAUDE.md.
**Tradeoffs**: SPEC.md disappears as a standalone overview document. The original SPEC text is preserved verbatim in this file (the data-model, API, pipeline, and prompt sections), so nothing is lost — but anyone looking for "the spec" needs to know to read PLANNING.md.

---

## Out of scope

Explicitly NOT in MVP. These were considered and deferred — do not infer them from the architecture.

- **Manual article submission** — no UI to paste text or submit a URL for ingestion. The pipeline is fully automated from Perplexity → Claude → publish.
- **Email digest / subscriber notifications** — no newsletter, no email list.
- **Multi-variant post generation** — Claude returns one post per run, not several to choose from.
- **Post analytics / read metrics** — no view counts, no engagement tracking.
- **Generation audit log** — no detailed log of which articles fed which post beyond the `sources` table.
- **Multi-user / role-based access** — single admin only. No editor role, no contributor role.
- **Light theme / theme toggle** — dark only.
- **Photographic or illustrative imagery** — typography and color carry the design.

## Roadmap (development phases)

Each entry below is one `/start-feature <name>` plan. Features are sized to ship in 1–3 sessions and one PR. Sequence top-to-bottom within a phase; the 2-plan concurrency cap allows occasional parallelism on independent features (e.g. `backend-skeleton` and `frontend-skeleton`).

### Phase 1 — Foundation

#### `backend-skeleton`
- **Goal:** FastAPI app + Docker Compose + Postgres running locally
- **Done when:** `docker compose up` boots; `GET /health` returns 200

#### `database-foundation`
- **Goal:** SQLAlchemy models for all 4 tables + Alembic initial migration + `seed_admin.py`
- **Done when:** `alembic upgrade head` creates tables; seed script creates the admin user idempotently

#### `frontend-skeleton`
- **Goal:** Next.js 14 + Tailwind + shadcn/ui + design tokens wired in
- **Done when:** `npm run dev` boots; color tokens render; layout shell exists

#### `auth-login`
- **Goal:** `/auth/login` + `/auth/logout` + NextAuth wiring + login page
- **Done when:** Sign in as the seeded admin and reach `/dashboard`; 2-hour session enforced

---

### Phase 2 — Pipeline

#### `news-fetcher`
- **Goal:** Perplexity Sonar service running the 5 intent queries with ≥3-article threshold
- **Done when:** `fetch_qualifying_articles()` returns articles or logs a skip; mocked tests cover both paths

#### `blog-writer`
- **Goal:** Claude service that returns the structured post JSON (title/slug/summary/body/tags/sources)
- **Done when:** `generate_post(articles)` returns valid schema; malformed responses fail loud

#### `pipeline-orchestrator`
- **Goal:** End-to-end fetch → generate → route + `POST /pipeline/run` + `GET /pipeline/status`
- **Done when:** Manual trigger creates a `posts` row at the correct status per `publishing_mode`

#### `scheduler-cron`
- **Goal:** APScheduler bi-weekly cron in-process + settings PATCH for day-of-week
- **Done when:** Scheduler boots with FastAPI; configured day fires the pipeline at 8 AM

---

### Phase 3 — Admin UI

#### `dashboard-shell-and-overview`
- **Goal:** Persistent sidebar + pipeline status dot + 4 stat cards + Trigger Pipeline / Go To Queue actions
- **Done when:** Sidebar renders on every `/dashboard` route; stats reflect DB; trigger fires a run

#### `review-queue`
- **Goal:** Pending-review list + review panel with Accept (publish-now or schedule), Reject, Regenerate with feedback
- **Done when:** All three actions hit backend endpoints and update post status

#### `scheduled-and-published`
- **Goal:** `/dashboard/scheduled` (edit-schedule, publish-now, back-to-queue) + `/dashboard/published` (read-only with view-post link)
- **Done when:** Per-row actions work; published list links to `/blog/[slug]`

#### `settings-page`
- **Goal:** Publishing mode toggle + schedule day selector + manual trigger + session/logout
- **Done when:** `PATCH /settings` persists; trigger fires the pipeline; logout ends session

---

### Phase 4 — Public blog (DeLorean)

#### `public-shell-and-homepage`
- **Goal:** Public nav + footer + homepage (hero, tag filter, posts grid, grid overlay, glow orb)
- **Done when:** `/` renders with the latest post in the hero; tag filter narrows the grid client-side; design tokens applied throughout

#### `post-page`
- **Goal:** `/blog/[slug]` with header, markdown body, share bar (X/LinkedIn/Copy), sources, plus per-post meta + OG tags
- **Done when:** Any published slug renders fully; share buttons + copy-link confirmation work; OG tags visible in page source

#### `about-page`
- **Goal:** `/about` with atmospheric hero + content sections per `Design/README.md`
- **Done when:** Page renders; nav and footer links resolve

---

### Phase 5 — Polish & deploy

#### `pipeline-resilience`
- **Goal:** Retry + backoff on Claude/Perplexity failures + structured error logs + graceful skip on permanent failure
- **Done when:** Forced failure triggers retry; permanent failure logs and skips cleanly without partial DB state

#### `ui-polish`
- **Goal:** Loading skeletons + empty states across both surfaces
- **Done when:** Every async list shows a skeleton while loading and an empty-state when no data

#### `production-config`
- **Goal:** Production env handling + Docker profiles + healthchecks + build hardening
- **Done when:** App boots from production `.env`; healthchecks pass; no dev-mode warnings

#### `deploy`
- **Goal:** Deploy to Railway or Render with persistent Postgres + DNS
- **Done when:** Production URL serves the blog; admin login works; scheduler fires on schedule
