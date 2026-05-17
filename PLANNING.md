# AI-Blog (DeLorean) — Planning

> Long-form context about this project. CLAUDE.md `@`-imports this file, so every session has access to it. Update this file whenever you make an architectural decision.

## Project overview

DeLorean is an automated twice-weekly blog covering AI and operational technology developments in the automotive industry. The system has two surfaces: a public-facing blog where readers discover and share posts, and a private admin dashboard where a single operator manages the publishing pipeline, reviews AI-generated content, and configures system behavior. Content is generated end-to-end by an automated pipeline that fetches news from Perplexity Sonar, drafts a post with Claude, and either publishes immediately or routes to a review queue based on the configured publishing mode.

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
│  Next.js 16 │            │   FastAPI   │           │  (SQLAlchemy │
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

- **Frontend** (`frontend/`): Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui. Source layout is `src/app/`. Two route groups: `(public)` for the DeLorean blog (homepage, post pages, about) and `dashboard/` for the admin UI (overview, queue, scheduled, published, settings). NextAuth handles credential-based login for the admin only.
- **Backend** (`backend/`): Python + FastAPI. Routers: `posts.py`, `pipeline.py`, `settings.py`, plus auth endpoints. Services: `news_fetcher.py` (Perplexity), `blog_writer.py` (Claude), `publisher.py` (status routing). `scheduler.py` runs APScheduler in-process for the twice-weekly (Mon + Thu) cron.
- **Database**: PostgreSQL. Schema managed by SQLAlchemy models + Alembic migrations.
- **External services**:
  - Anthropic Claude API (`claude-sonnet-4-20250514`) — blog generation.
  - Perplexity Sonar API — news aggregation with intent-based queries.
- **Auth**: NextAuth.js, credentials provider, single seeded admin user, 2-hour session TTL. Passwords stored as bcrypt hashes via `passlib`.
- **Environment**: Docker Compose for local dev. Production hosting is split across Vercel (frontend), Render (backend), and Neon (Postgres) — see the Hosting section below.

### Repository layout

```
/
├── frontend/                  # Next.js app
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/                  # Public blog — DeLorean
│   │   │   │   ├── page.tsx               # Homepage / post list
│   │   │   │   ├── blog/[slug]/page.tsx   # Individual post page
│   │   │   │   └── about/page.tsx         # About DeLorean
│   │   │   ├── (auth)/login/
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx               # Overview / stats
│   │   │   │   ├── queue/                 # Review queue
│   │   │   │   ├── scheduled/             # Scheduled posts
│   │   │   │   ├── published/             # Published posts
│   │   │   │   └── settings/              # System settings
│   │   │   ├── globals.css                # Tailwind v4 + design tokens via @theme
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   └── lib/
│   └── components.json                    # shadcn/ui config
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

- **Next.js 16 (App Router) + React 19 + Tailwind v4**: Server components fit the public-blog use case (mostly read, SEO-sensitive); App Router lets us co-locate route groups for the public surface and admin dashboard cleanly. Tailwind v4 is CSS-first — design tokens are declared with `@theme {}` in `globals.css`, not in a `tailwind.config.ts`. shadcn/ui chosen because we own the component code and can theme it freely; initialized at scaffold time but components are added on demand by features that need them.
- **Python + FastAPI**: The pipeline does heavy lifting against two LLM/AI APIs — Python's ecosystem (Anthropic SDK, `passlib`, APScheduler) is the path of least resistance. FastAPI gives us typed routers and Pydantic validation cheaply.
- **PostgreSQL 17**: Standard, well-supported on Railway/Render. Postgres array column type fits the `tags VARCHAR[]` field without a join table. Pinned to `postgres:17-alpine` in local Docker — matches the developer's host Homebrew client (17.7), so client/server versions stay aligned. The `db` service exposes host port **5433** (not 5432) to avoid a bind conflict with the host's local Postgres install.
- **SQLAlchemy + Alembic**: Mature combo; Alembic gives us migration history, which matters because schema changes flow through the architecture-change gate (see CLAUDE.md).
- **APScheduler in-process**: Simple deployment — no separate worker process for the twice-weekly cron. Tradeoff: a horizontally scaled backend would need to designate one scheduler-owning worker. Not a concern at MVP scale (single instance).
- **NextAuth credentials provider**: Single admin, no SSO, no third-party identity. Credentials provider is the lowest-friction option. 2-hour session TTL chosen to balance convenience against the risk of an unattended laptop with the admin dashboard open.
- **Anthropic Claude (`claude-sonnet-4-20250514`)**: Sonnet hits the cost/quality balance for 600–900-word posts. Pinned to a specific snapshot ID so generation behavior doesn't drift mid-cycle.
- **Perplexity Sonar (`/search` endpoint)**: Replaces a build-our-own news fetcher + relevance filter. Sonar's hybrid semantic + LLM-ranked retrieval understands intent and returns pre-filtered results with source citations, removing a whole layer of curation logic from our codebase. We target the dedicated `/search` endpoint (not `/chat/completions`) — it returns raw retrieved articles without the LLM synthesis step we'd otherwise discard, and accepts batched queries so the 5 intent queries fit in one HTTP call. See the 2026-05-13 decision-log entry for the full rationale.

## Hosting

Production deployment splits across three vendors, each picked for what it does best. Total cost ≈ **$8–10/mo** at MVP scale.

| Layer | Service | Tier | Cost |
|---|---|---|---|
| Frontend (Next.js 16) | Vercel | Free | $0 |
| Backend (FastAPI + APScheduler) | Render | Starter (always-on web service) | $7/mo |
| Database (Postgres 17) | Neon | Free (3 GB) | $0 |
| Post generation | Anthropic Claude Sonnet 4 | Pay-per-use | ~$0.50–1.50/mo |
| News fetching | Perplexity Sonar | Pay-per-use | ~$0.50–1.50/mo |

Notes:
- Render Starter is required (not Free) because APScheduler runs in-process and must stay resident to fire the Mon/Thu cron — Render's free tier spins down after 15 min of idle.
- Pin Render and Neon to the same US region to keep backend↔DB latency in the single-digit-ms range.
- Neon's free tier autosuspends on inactivity; first query after idle has a small wake-up cost (~500 ms–2 s). Invisible at this traffic level.
- The choice of vendor for each layer is independent of the architecture — swapping any one (e.g. Render → Fly.io for backend, Neon → Supabase for DB) is a deployment-config change, not a code change.

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
| schedule_frequency | VARCHAR | `twice_weekly` (cadence days are hardcoded Mon + Thu in the scheduler — not stored here) |
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

Send intent-based queries to Perplexity Sonar's `/search` endpoint in a single batched call (`query: string[]`, `search_recency_filter: "week"`):

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
- APScheduler twice-weekly cron — fires every Monday and every Thursday at 8:00 AM.
- Both the days (Mon + Thu) and the frequency are fixed in code. Neither is exposed in the Settings UI.
- Manual trigger always available from the dashboard.

## Constraints and non-negotiables

- **Single dark theme.** No light/dark toggle. Color tokens defined in `Design/README.md`.
- **No images in the UI.** Typography and color carry the design across both surfaces.
- **Single admin user.** No registration flow, no multi-user roles.
- **Twice-weekly cadence is fixed.** The pipeline fires every Monday and Thursday at 8 AM. Neither the days nor the frequency are exposed in the Settings UI.
- **Source transparency.** Every post must list its sources (title, publisher, link, date) — this is part of the editorial contract with the audience.
- **Secrets stay in `.env`.** `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL` never committed.

## Decision log

The full decision log lives in `PLANNING-decisions.md` (not `@`-imported, to keep this file under the auto-load size threshold). Read it on demand when you need the *why* behind a past architectural or product choice. New entries go at the top of that file.

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

### Phase 1 — Foundation - **COMPLETED**

#### `backend-skeleton` *Done*
- **Goal:** FastAPI app + Docker Compose + Postgres running locally
- **Done when:** `docker compose up` boots; `GET /health` returns 200

#### `database-foundation` *Done*
- **Goal:** SQLAlchemy models for all 4 tables + Alembic initial migration + `seed_admin.py`
- **Done when:** `alembic upgrade head` creates tables; seed script creates the admin user idempotently

#### `frontend-skeleton` *Done*
- **Goal:** Next.js 14 + Tailwind + shadcn/ui + design tokens wired in
- **Done when:** `npm run dev` boots; color tokens render; layout shell exists

#### `auth-login` *Done*
- **Goal:** `/auth/login` + `/auth/logout` + NextAuth wiring + login page
- **Done when:** Sign in as the seeded admin and reach `/dashboard`; 2-hour session enforced

#### `ci-pipeline` *Done*
- **Goal:** GitHub Actions workflow at `.github/workflows/ci.yml` that runs backend (`pytest` against a Postgres service container, after `alembic upgrade head`) and frontend (`lint` + `typecheck` + `test` + `build`) on every PR and on pushes to `main`. Branch protection on `main` requires this check to pass before merging.
- **Done when:** A PR with a deliberately broken test shows a red ✗ and is blocked from merging; a clean PR shows green and merges normally.

---

### Phase 2 — Pipeline **COMPLETED**

#### `news-fetcher` *Done*
- **Goal:** Perplexity Sonar service running the 5 intent queries with ≥3-article threshold
- **Done when:** `fetch_qualifying_articles()` returns articles or logs a skip; mocked tests cover both paths

#### `blog-writer` *Done*
- **Goal:** Claude service that returns the structured post JSON (title/slug/summary/body/tags/sources)
- **Done when:** `generate_post(articles)` returns valid schema; malformed responses fail loud

#### `pipeline-orchestrator` *Done*
- **Goal:** End-to-end fetch → generate → route + `POST /pipeline/run` + `GET /pipeline/status`
- **Done when:** Manual trigger creates a `posts` row at the correct status per `publishing_mode`

#### `scheduler-cron` *Done*
- **Goal:** APScheduler twice-weekly cron in-process — Mon + Thu at 8 AM, both days hardcoded
- **Done when:** Scheduler boots with FastAPI; both Mon and Thu fire the pipeline at 8 AM; no settings field is consulted for cadence

---

### Phase 3 — Admin UI

#### `dashboard-shell`
- **Goal:** Persistent sidebar + main shell + design-token v2.0 overhaul + Chakra Petch font + body grid + auth `proxy.ts` + placeholder pages + `ChamferedPanel` primitive + bottom pipeline status dot.
- **Done when:** Sidebar renders on every `/dashboard/*` route; unauthenticated `/dashboard` redirects to `/login`; status dot reflects `GET /pipeline/status`; tokens + chamfer geometry match `Design/README.md` v2.0.

#### `review-queue`
- **Goal:** Pending-review list + review panel with Accept (publish-now or schedule), Reject, Regenerate with feedback. Builds `GET /posts` (status filter + `total`); wires sidebar QUEUE badge live.
- **Done when:** All three actions hit backend endpoints and update post status; QUEUE badge reflects DB.

#### `scheduled-and-published`
- **Goal:** `/dashboard/scheduled` (edit-schedule, publish-now, back-to-queue) + `/dashboard/published` (read-only with view-post link). Reuses `GET /posts`.
- **Done when:** Per-row actions work; published list links to `/blog/[slug]`.

#### `settings-page`
- **Goal:** Publishing mode toggle + manual trigger + session/logout. Schedule is shown read-only ("Mon + Thu at 8 AM") since cadence is hardcoded. Builds `GET /settings` + `PATCH /settings`.
- **Done when:** `PATCH /settings` persists publishing mode; trigger fires the pipeline; logout ends session.

#### `dashboard-overview`
- **Goal:** 4 Tier 2 stat cards (Posts Published, Pending Review — orange-activated when >0, Last Run, Next Run) + Trigger Pipeline + conditional Go To Queue. Composes endpoints built by earlier phase-3 features.
- **Done when:** All 4 cards display values pulled from the backend; trigger fires a run and status dot flips to RUNNING; live-ish refresh while running.

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

#### `news-fetcher-quality-filter`
- **Goal:** Filter non-news content (vendor product pages, marketing landing pages) out of Sonar `/search` results inside `news_fetcher` itself, so the ≥3 threshold counts only real news. Approach TBD — options include: tighter Sonar query phrasing, `search_domain_filter` blocklist of known vendor domains, a small Claude classification call per result, or a rule-based heuristic on URL/snippet patterns.
- **Why:** First smoke test (2026-05-15) of news-fetcher returned 10 articles, 3 of which were vendor product pages (e.g. `owini.ai`, `drivecentric.com`, `spyne.ai`) rather than news articles. Filtering downstream in `blog-writer` would entangle relevance with synthesis and would let marketing pages consume slots that real news could've filled — pushing borderline runs under the threshold for the wrong reason. Per PLANNING.md, news-fetcher's job is news aggregation; this is a fetch-layer correctness gap.
- **Done when:** Across a representative sample of real Sonar runs, ≥80% of returned articles are news (not vendor/marketing); the threshold logic operates on filtered counts.

#### `ui-polish`
- **Goal:** Loading skeletons + empty states across both surfaces
- **Done when:** Every async list shows a skeleton while loading and an empty-state when no data

#### `production-config`
- **Goal:** Production env handling + Docker profiles + healthchecks + build hardening
- **Done when:** App boots from production `.env`; healthchecks pass; no dev-mode warnings

#### `deploy`
- **Goal:** Deploy to Railway or Render with persistent Postgres + DNS
- **Done when:** Production URL serves the blog; admin login works; scheduler fires on schedule
