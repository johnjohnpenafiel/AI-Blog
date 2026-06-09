# AI-Blog (The Garage AI) — Planning (v2)

> Long-form context about this project. CLAUDE.md `@`-imports this file, so every session has access to it. Update this file whenever you make an architectural decision.
>
> **This is the v2 planning doc.** The MVP shipped (public blog + admin dashboard + automated pipeline, deployed across Vercel / Render / Neon). v2 evolves that working system — a richer content taxonomy, multi-format generation, smarter news selection, and an editorial point of view — without re-litigating the parts that still hold.
>
> **Where the detail lives:**
> - `notes/v2-master.md` — the five pillars + the editorial POV theme.
> - `notes/v2-ideas.md` — the locked v2 decisions (taxonomy, formats, data model, sourcing, run model), each with its rationale.
> - `notes/v2-integration-plan.md` — the build sequence those decisions map onto (mirrored in the Roadmap below).
> - `PLANNING-decisions.md` — the dated decision log (read on demand).
> - `archive/PLANNING-MVP.md` — the original MVP planning doc (full MVP roadmap + completion history). Archived, not `@`-imported; everything still in use is restated here. Referenced only if you need MVP-era detail.

## Project overview

The Garage AI is an automated blog covering AI and operational technology developments in the automotive industry, publishing three times a week (a Brief on Monday, a Deep Dive on Thursday, and a Roundup on Friday). The system has two surfaces: a public-facing blog where readers discover and share posts, and a private admin dashboard where a single operator manages the publishing pipeline, reviews AI-generated content, and configures system behavior. Content is generated end-to-end by an automated pipeline that fetches news from Perplexity Sonar, drafts a post with Claude, and either publishes immediately or routes to a review queue based on the configured publishing mode.

> **Naming:** "The Garage AI" is the public brand used across all user-facing surfaces and the codebase. "DeLorean" is the internal codename and survives only in the design language (`Design/README.md`) and in historical decision-log entries.

The audience is dealership operators, automotive tech executives, and industry observers — not car enthusiasts. Codebase intervention is reserved for bugs, updates, and new features only; the publishing loop runs without code changes.

### v2 direction (North Star + POV)

- **North Star — "AI as the dealership operating system."** v2 stays inside the niche the project was commissioned for: AI used *in car dealerships*, told department by department. It does **not** expand into adjacent automotive beats (OEM/manufacturing, SDV/OTA, connected-vehicle data, EVs, autonomy).
- **Editorial POV — operator-first, proof-over-hype.** Every post answers *"what does this actually mean for my store — will it make money, save time, retain customers — and does it actually work, or is it vendor noise?"* This is a cross-cutting theme that threads through both content selection and the generation voice. See `notes/v2-master.md`.

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

- **Frontend** (`frontend/`): Next.js 16 (App Router) + React 19 + Tailwind CSS v4 + shadcn/ui. Source layout is `src/app/`. Two route groups: `(public)` for The Garage AI blog (homepage, post pages, about) and `dashboard/` for the admin UI (overview, queue, scheduled, published, settings). NextAuth handles credential-based login for the admin only.
- **Backend** (`backend/`): Python + FastAPI. Routers: `auth.py`, `posts.py` (admin), `public.py` (public read-only), `pipeline.py`, `settings.py`. Services: `news_fetcher.py` (Perplexity, open-canvas sourcing), `content_classifier.py` (Haiku promo-vs-news + importance classifier), `blog_writer.py` (Claude, format-aware generation + Roundup), `pipeline.py` (`run_pipeline` + `run_roundup` orchestrators), `publisher.py` (status routing + `publish_due_posts` bulk-publisher), `evals.py` (in-loop generation-quality judge). Canonical category vocabulary lives in `taxonomy.py`. `scheduler.py` runs APScheduler in-process for the **Mon / Thu / Fri** cron — each day mapped to a format (Mon → Brief, Thu → Deep Dive, Fri → Roundup) — AND a 1-minute interval job (`scheduled-publisher`) that flips accepted posts whose `scheduled_at` has passed to `published`.
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
│   │   │   ├── (public)/                  # Public blog — The Garage AI
│   │   │   │   ├── page.tsx               # Homepage / post list
│   │   │   │   ├── blog/[slug]/page.tsx   # Individual post page
│   │   │   │   └── about/page.tsx         # About The Garage AI
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
│   ├── routers/{auth.py, posts.py, public.py, pipeline.py, settings.py}
│   ├── services/{news_fetcher.py, blog_writer.py, pipeline.py, publisher.py}
│   ├── scripts/seed_admin.py
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── scheduler.py
│   └── database.py
│
├── notes/                     # Planning / research scratch (v2 thinking)
├── archive/                   # Archived docs (PLANNING-MVP.md)
├── docker-compose.yml
└── .env
```

## Stack decisions

- **Next.js 16 (App Router) + React 19 + Tailwind v4**: Server components fit the public-blog use case (mostly read, SEO-sensitive); App Router lets us co-locate route groups for the public surface and admin dashboard cleanly. Tailwind v4 is CSS-first — design tokens are declared with `@theme {}` in `globals.css`, not in a `tailwind.config.ts`. shadcn/ui chosen because we own the component code and can theme it freely; initialized at scaffold time but components are added on demand by features that need them.
- **Python + FastAPI**: The pipeline does heavy lifting against two LLM/AI APIs — Python's ecosystem (Anthropic SDK, `passlib`, APScheduler) is the path of least resistance. FastAPI gives us typed routers and Pydantic validation cheaply.
- **PostgreSQL 17**: Standard, well-supported on Railway/Render. Postgres array column type fits the `tags VARCHAR[]` field without a join table. Pinned to `postgres:17-alpine` in local Docker — matches the developer's host Homebrew client (17.7), so client/server versions stay aligned. The `db` service exposes host port **5433** (not 5432) to avoid a bind conflict with the host's local Postgres install.
- **SQLAlchemy + Alembic**: Mature combo; Alembic gives us migration history, which matters because schema changes flow through the architecture-change gate (see CLAUDE.md).
- **APScheduler in-process**: Simple deployment — no separate worker process for the cron. Tradeoff: a horizontally scaled backend would need to designate one scheduler-owning worker. Not a concern at current scale (single instance).
- **NextAuth credentials provider**: Single admin, no SSO, no third-party identity. Credentials provider is the lowest-friction option. 2-hour session TTL chosen to balance convenience against the risk of an unattended laptop with the admin dashboard open.
- **Anthropic Claude (`claude-sonnet-4-20250514`)**: Sonnet hits the cost/quality balance for 600–900-word posts. Pinned to a specific snapshot ID so generation behavior doesn't drift mid-cycle.
- **Perplexity Sonar (`/search` endpoint)**: Replaces a build-our-own news fetcher + relevance filter. Sonar's hybrid semantic + LLM-ranked retrieval understands intent and returns pre-filtered results with source citations, removing a whole layer of curation logic from our codebase. We target the dedicated `/search` endpoint (not `/chat/completions`) — it returns raw retrieved articles without the LLM synthesis step we'd otherwise discard. See the 2026-05-13 decision-log entry for the full rationale.

## Hosting

Production deployment splits across three vendors, each picked for what it does best. Total cost ≈ **$8–10/mo** at current scale.

| Layer | Service | Tier | Cost |
|---|---|---|---|
| Frontend (Next.js 16) | Vercel | Free | $0 |
| Backend (FastAPI + APScheduler) | Render | Starter (always-on web service) | $7/mo |
| Database (Postgres 17) | Neon | Free (3 GB) | $0 |
| Post generation | Anthropic Claude Sonnet 4 | Pay-per-use | ~$0.50–1.50/mo |
| News fetching | Perplexity Sonar | Pay-per-use | ~$0.50–1.50/mo |

Notes:
- Render Starter is required (not Free) because APScheduler runs in-process and must stay resident to fire the cron — Render's free tier spins down after 15 min of idle.
- Pin Render and Neon to the same US region to keep backend↔DB latency in the single-digit-ms range.
- Neon's free tier autosuspends on inactivity; first query after idle has a small wake-up cost (~500 ms–2 s). Invisible at this traffic level.
- The choice of vendor for each layer is independent of the architecture — swapping any one (e.g. Render → Fly.io for backend, Neon → Supabase for DB) is a deployment-config change, not a code change.

## Data model

> **Current (as-built) schema.** The `posts` table carries the v2 taxonomy fields (`section`, `format`, `story_type`, added by Phase 1 `taxonomy-data-model`) and the generation-eval scores (`eval_*`) persisted by the in-loop judge — see the 2026-06-05 decision-log entries.

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
| is_featured | BOOLEAN | NOT NULL, default false; editor's-choice pin for the homepage featured band. At most one row true (enforced in app code, not by a DB constraint) |
| section | VARCHAR | nullable; v2 taxonomy, validated against code vocab |
| format | VARCHAR | nullable; v2 taxonomy (Brief / Deep Dive / Roundup …) |
| story_type | VARCHAR | nullable; v2 taxonomy |
| eval_pov | SMALLINT | nullable; generation-eval POV score (0–2) |
| eval_format | SMALLINT | nullable; generation-eval format score (0–2) |
| eval_grounding | SMALLINT | nullable; generation-eval grounding score (0–2) |
| eval_passed | BOOLEAN | nullable; eval pass/fail |
| eval_notes | TEXT | nullable; eval one-line rationale |
| eval_at | TIMESTAMP | nullable; when scored — NULL = not scored |

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
| schedule_frequency | VARCHAR | `twice_weekly` (cadence days are hardcoded in the scheduler — not stored here) |
| last_run_at | TIMESTAMP | |
| next_run_at | TIMESTAMP | |

## API contracts

> **Auth model (three layers):** (1) `frontend/src/proxy.ts` (the Next.js 16 middleware) guards the `/dashboard/*` *pages* — unauthenticated requests redirect to `/login`. (2) Each `/api/*` proxy route to a protected endpoint verifies the NextAuth session via `getToken` (401 if logged out), then attaches the shared `BACKEND_API_SECRET` as `Authorization: Bearer <secret>` on the server-to-server call (`frontend/src/lib/proxy-backend.ts`). (3) The backend enforces that secret on the protected routers (`posts`, `pipeline`, `settings`) via the `require_api_key` dependency — a missing/incorrect header returns 401. `/public/*`, `/auth/*`, and `/health` are deliberately open. The secret lives only in server env (root `.env` / `frontend/.env.local`), never in the browser, and must match on both sides (and on Render + Vercel in prod).

### Auth
| Method | Path | Description |
|---|---|---|
| POST | `/auth/login` | Validate email + password against the `users` row; returns `{id, email}` on success (no token — NextAuth mints/manages the JWT) |
| POST | `/auth/logout` | No-op `{status: "ok"}`; NextAuth clears the session client-side |

### Public (no auth required)
| Method | Path | Description |
|---|---|---|
| GET | `/public/posts` | List published posts |
| GET | `/public/posts/featured` | The homepage featured-band post: the editor's-choice pin if one exists (regardless of recency), else the most-recent published post. `is_featured` flag distinguishes a real pin from the fallback. `null` when nothing is published. Declared before `/{slug}` so the literal path wins. |
| GET | `/public/posts/{slug}` | Get single published post by slug |

### Posts (admin-only — `require_api_key` + proxy session check, see note above)
| Method | Path | Description |
|---|---|---|
| GET | `/posts` | List all posts (filterable by status) |
| GET | `/posts/featured` | The post currently pinned to the homepage featured band, or `null`. Read from a dedicated endpoint (not derived from the published list) so the dashboard readout is correct even when the pin has scrolled past the first page. Declared before `/{id}`. |
| GET | `/posts/{id}` | Get single post with sources |
| POST | `/posts/{id}/accept` | Accept post (optionally set scheduled_at) |
| POST | `/posts/{id}/reject` | Reject post |
| POST | `/posts/{id}/regenerate` | Regenerate with optional feedback |
| POST | `/posts/{id}/publish` | Manually publish an accepted post |
| POST | `/posts/{id}/feature` | Pin a **published** post as the homepage featured story; clears any prior pin (single-pin). 409 if not published. |
| POST | `/posts/{id}/unfeature` | Clear the featured pin (idempotent). With no pin, the band falls back to the most-recent post. |
| POST | `/posts/{id}/reschedule` | Change an accepted post's `scheduled_at` |
| POST | `/posts/{id}/unschedule` | Move an accepted post back to `pending_review` |

### Pipeline
| Method | Path | Description |
|---|---|---|
| POST | `/pipeline/run` | Manually trigger a pipeline run. Optional body `{format: "Brief" \| "Deep Dive"}` (default `Deep Dive`). |
| GET | `/pipeline/status` | Last run time, next scheduled run, current status |

### Settings
| Method | Path | Description |
|---|---|---|
| GET | `/settings` | Get current settings |
| PATCH | `/settings` | Update publishing mode (only field accepted — cadence is hardcoded, not editable) |

## Pipeline logic

> **Current (as-built) v2 behavior.** This reflects the shipped Phase 1–3 engine: open-canvas sourcing + an AI promo/importance classifier, importance-based section selection with anti-repetition, and three formats each on their own scheduled run (Mon Brief / Thu Deep Dive / Fri Roundup). Rationale lives in `notes/v2-ideas.md` and the 2026-06-05 decision-log entries.

### Step 1 — News fetching (`backend/services/news_fetcher.py` + `content_classifier.py`)

Send **six** `news:`-prefixed queries to Perplexity Sonar's `/search` endpoint — **one HTTP call per query** (not batched) so each result's source query, and therefore its **section**, is known by attribution. Each request applies `search_recency_filter: "week"`. **Open canvas — no `search_domain_filter` allowlist** (the classifier is the real quality gate); a small `DOMAIN_BLOCKLIST` drops obvious non-news (PR wires, video/social hosts) deterministically first.

Each query maps 1:1 to one of six queried sections (Customer Experience, Inventory & Merchandising, Pricing & Analytics, Sales & Lead Gen / BDC, Fixed Ops / Service, CRM & Marketing); articles inherit that section. Results are deduped by URL (first-seen section wins), and any URL already cited by a prior post is dropped (**anti-repetition**). The remaining articles go to the **Haiku promo-vs-news + importance classifier** (`content_classifier.py`, `claude-haiku-4-5-...`, **fails open**) — non-news is filtered out and each surviving article gets an importance score (0–2).

Articles are grouped into section clusters; the **`MIN_ARTICLES = 3` threshold applies to the winning cluster** (a run where no section reaches 3 classified-news articles is skipped). The winner is picked by **operator-relevance, not raw count** (`_pick_winning_section`): rank key = (# high-importance stories, summed importance, distinct-publisher breadth, cluster size). The most-recently-published section is skipped when another qualifies (**no back-to-back repeats**). Only the winning section's articles go to the blog writer.

### Step 2 — Blog generation (`backend/services/blog_writer.py`)

Send the winning section's articles to Claude (`claude-sonnet-4-...`) with a **format-aware** prompt. Generation is driven by `FORMAT_SPECS` — **Brief** (200–400w, Smart-Brevity skeleton) and **Deep Dive** (600–900w, multi-source synthesis) — each carrying the **operator-first / proof-over-hype POV** baked into the prompt (replaces the old "authoritative, forward-looking" tone line). Claude returns `title`, `slug`, `summary`, `meta_description`, `body` (Markdown), `tags` (1–2 from the section's vocabulary), and `sources`. The post is attributed to the winning `section` and the run's `format`.

> **`story_type` is a stored column but is not yet populated by generation** — the generator doesn't classify it, so it is currently always NULL. (Captured as a known gap; wiring it is future work.)

### Step 3 — Routing (`backend/services/publisher.py`)

- `publishing_mode = auto` → set `status = published`, `published_at = now()`.
- `publishing_mode = approve_only` → set `status = pending_review`. Post appears in admin review queue.

`publishing_mode` is snapshotted onto the post at generation time. Changing the global setting later does NOT retroactively change posts already in the queue.

### Step 4 — Quality eval (`backend/services/evals.py`, in-loop)

After generation, each post is scored by a Haiku LLM-judge against the source excerpts it was written from — POV / format / source-grounding (0–2 each) + pass/fail + notes — and the result is **persisted on the post** (`eval_*` columns) and shown in the dashboard. This is **observational only**: a failing post in `auto` mode still publishes. The eval fails soft (a judge error never breaks a run → scores stay NULL). Regeneration clears the score (no source excerpts to re-score against). See the 2026-06-05 decision-log entries.

### The Roundup run (`run_roundup`, Fridays)

The Friday run does **not** fetch news. `run_roundup` reads the week's own `published` posts from the DB and synthesizes a Roundup (~500–600w: week-range → through-line → "The Big Story" → "Also This Week" → "Worth Watching"), linking the week's Brief + Deep Dive. It's the safety net for important stories that didn't win an earlier slot. Skips cleanly if nothing was published that week.

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
- Password resets: no dedicated script or forgot-password UI yet. `seed_admin.py` is find-or-create and will NOT update an existing user's password — to change it, update the `users` row directly (or delete it and re-run `seed_admin.py` with the new `ADMIN_PASSWORD`).

### Slugs & SEO
- Slugs auto-generated from titles, URL-safe. Stored unique on the `posts` table.
- Each post has an auto-generated `meta_description` (1 sentence, SEO).
- Open Graph tags rendered per post.

### Publishing modes
| Mode | Behavior |
|---|---|
| **Auto** | Post is generated and published immediately. No admin action required. |
| **Approve Only** | Post is generated and placed in the review queue. Admin must accept before it publishes. Once accepted, admin can publish instantly or schedule for a future date/time. |

### Scheduling
- APScheduler cron in-process — **Monday, Thursday, and Friday at 8:00 AM**, all hardcoded. Each day is tied to a format: **Mon → Brief, Thu → Deep Dive, Fri → Roundup** (`WEEKDAY_FORMATS` in `scheduler.py`). Mon/Thu run the news pipeline; Fri runs `run_roundup`.
- Cadence is fixed in code, not exposed in the Settings UI.
- Manual trigger always available from the dashboard.

## Constraints and non-negotiables

- **Single dark theme.** No light/dark toggle. Color tokens defined in `Design/README.md`.
- **No images in the UI.** Typography and color carry the design across both surfaces.
- **Single admin user.** No registration flow, no multi-user roles.
- **Stay in the niche.** "AI as the dealership operating system" — no expansion into adjacent automotive beats.
- **Source transparency.** Every post must list its sources (title, publisher, link, date) — part of the editorial contract with the audience.
- **Measurement is first-class.** The product *is* the content, so the system is built to measure what it fetches and writes — not as a later analytics phase. Every post carries its full classification (`section` / `format` / `story_type`) and its generation-eval scores as part of the record, so outcomes can be tracked by eye now and analyzed properly later ("which kinds of posts perform?"). Adding a measurable dimension to a post is expected work, not scope creep.
- **Secrets stay in `.env`.** `ANTHROPIC_API_KEY`, `PERPLEXITY_API_KEY`, `NEXTAUTH_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DATABASE_URL`, `BACKEND_API_SECRET` never committed.

## Decision log

The full decision log lives in `PLANNING-decisions.md` (not `@`-imported, to keep this file under the auto-load size threshold). Read it on demand when you need the *why* behind a past architectural or product choice. New entries go at the top of that file. (The MVP-era roadmap and feature history live in `archive/PLANNING-MVP.md`.)

---

## Roadmap (v2 development phases)

Each feature below becomes a `/start-feature <name>` plan, sized to ship in 1–3 sessions and one PR. Sequence top-to-bottom within a phase; the 2-plan concurrency cap allows parallelism on independent features. Detailed rationale for every decision referenced here is in `notes/v2-ideas.md`; the full sequence reasoning is in `notes/v2-integration-plan.md`.

This roadmap covers **Pillar 1 (Content) + Pillar 2 (AI Generation)** — the content engine. **Pillar 3 (Design)** runs in a separate session, in parallel. **Pillars 4–5 (Distribution, Analytics)** come after the engine exists. The editorial POV (operator-first, proof-over-hype) threads through every phase.

> 🔒 = trips the architecture-change gate (STOP + confirm + update `PLANNING.md` and `PLANNING-decisions.md` in the same commit).

> **Status (2026-06-05):** **Phases 1–3 are shipped** on the `automated-work` branch (pending review + merge to `main`). The as-built behavior is documented above (Data model, Pipeline logic, Scheduling). Notable deltas from the original plan, and follow-ups surfaced during the build:
> - **`generation-evals` shipped as *observational*, not a hard publish gate.** Posts are scored in-loop and the result is persisted + shown in the dashboard, but a failing `auto`-mode post still publishes. Gating is parked as the "Eval-Gated Auto Publishing" idea (`notes/v2-ideas.md`), pending eval hardening (the judge is non-deterministic on borderline posts). **Promo-classifier-accuracy** check was deferred (needs labeled data).
> - **Emergent work folded in beyond the original scope:** source-grounding investigation → video/social blocklist + a source-aware eval; eval scores persisted on `posts` + surfaced across the dashboard. All captured in the 2026-06-05 decision-log entries.
> - **Known gaps (tracked, not yet done):** `story_type` is stored but never populated by generation; source excerpts aren't persisted (so regeneration clears the eval and stored-post re-eval is blind); the public homepage tag filter still references the legacy 7 tags and needs reconciling with the new taxonomy.

### Phase 1 — Foundation ✅ Shipped

#### `taxonomy-data-model` 🔒
- **Goal:** posts carry real categorization — `section`, `format`, `story_type` (single values) + `tags[]` (many) — backed by a canonical vocabulary kept in code (plain text, app-validated, **not** DB enums, so categories graduate without a migration).
- **Done when:** a post saves with all four labels; an invalid value is rejected by the app; the migration applies cleanly; existing posts are backfilled to a default section; the legacy "Industry Move" tag is relocated to `story_type`; adding a new category is a one-line code change.

### Phase 2 — Content Engine ✅ Shipped

Once Phase 1 lands, `news-sourcing-v2` and `multi-format-generation` can run as the parallel pair; `roundup-generation` follows them.

#### `news-sourcing-v2` 🔒
- **Goal:** replace the domain allowlist with an open canvas + AI promo-classifier, and select topics by *operator-relevance* rather than article count.
- **Includes:** drop the 18-domain allowlist; keep `news:` phrasing + recency filter; small blocklist for obvious offenders; a cheap (Haiku) promo-vs-news classifier; importance ranking (distinct-outlet breadth, spike-vs-baseline, funding/M&A weight, judged through the POV); anti-repetition (no back-to-back section, drop already-cited article URLs). Folds in the old `news-fetcher-repetition-fix`.
- **Done when:** topic selection is by importance not raw count; repeats are suppressed; promotional content is filtered by what the article *is*, not its domain; the ≥3-article threshold operates on classified results.
- **Note:** revisits the shipped `news-fetcher-quality-filter` — capture that in the decision log.

#### `multi-format-generation` 🔒
- **Goal:** produce the right *kind* of post, in our voice, on the right day — **Brief** (Mon) + **Deep Dive** (Thu).
- **Includes:** format-aware generation using each format's building-blocks skeleton (`notes/v2-ideas.md`); the POV baked into the prompt (replaces the current tone line); the scheduler change tying each run to a specific format.
- **Done when:** a Monday run produces a Brief in the Brief shape and a Thursday run a Deep Dive in the Deep Dive shape; both carry the POV voice and correct labels.

#### `roundup-generation`
- **Goal:** the **Friday Roundup** that summarizes the week's *own* published posts (the safety net for important stories that didn't win an earlier slot).
- **Includes:** a distinct input path (reads the week's published posts from the DB, not Perplexity); the Roundup skeleton (week-range → through-line → "The Big Story" → "Also This Week" → "Worth Watching"); the Friday run wired to it.
- **Done when:** Friday produces a Roundup linking the week's Brief + Deep Dive and surfacing notable runners-up.

### Phase 3 — Quality & Voice ✅ Shipped

#### `generation-evals`
- **Goal:** confidence the auto-produced posts are actually good before they publish unattended.
- **Includes:** checks for POV adherence, format-skeleton adherence, source grounding (no invented facts), and promo-classifier accuracy. Decide manual-rubric vs. automated AI-judge in this feature. (Prompt evals live here, under Generation.)
- **Done when:** each new post is scored against the rubric before it's trusted to publish.

#### `weekly-volume-testing` *(runs alongside Phases 1–3)*
- **Goal:** productionize the `notes/_volume_probe.py` probe into a recurring per-section measurement, logging qualifying-article counts over time.
- **Done when:** there's a repeatable job + a record of results that informs which borderline sections (Fixed Ops, CRM & Marketing) graduate tag → section. Informs the taxonomy continuously; never blocks the build.

### Phase 4 — Distribution & Audience (Pillar 4)

> After the content engine is producing. Owns the goals nothing else does: *bring readers organically* and *get them to subscribe*.

- **SEO as a discipline** — keyword targeting, internal linking through Concept hubs, sitemaps / OG hardening.
- **GEO / answer-engine visibility** — getting the site cited by AI search.
- **Subscriber relationship** — newsletter / digest / return-reader loop. *(Was MVP out-of-scope; a deliberate v2 decision to bring it in — confirm before building.)*

### Phase 5 — Analytics & Polish (Pillar 5)

> Measurement only — what the data says after the fact.

- Content performance (volume, keywords, SEO ranking), visitor / traffic / engagement metrics.

---

## Deferred / out of scope (v2)

Considered and intentionally not in the current plan — do not infer them from the architecture.

- **Explainer format** — deferred from the first format build (Brief + Deep Dive + Roundup ship first).
- **Multi-cluster pipeline** — one post per run stays; don't widen scope mid-build. (Old `multi-cluster-pipeline` + `auto-mode-fills-scheduled-slots` ideas live in `archive/PLANNING-MVP.md`.)
- **Story-Type / Company / Concept as browse indexes** — story-type is *stored* in Phase 1 but only promoted to a navigation filter later; Company and Concept stay parked.
- **Manual article submission** — the pipeline stays fully automated (Perplexity → Claude → publish).
- **Multi-user / role-based access** — single admin only.
- **Light theme / theme toggle; photographic or illustrative imagery** — dark, typographic, image-free by design.
