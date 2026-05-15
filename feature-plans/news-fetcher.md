---
status: in-progress
started: 2026-05-13
---

# Feature: news-fetcher

## Goal

Perplexity Sonar service running the 5 intent queries with a ≥3-article threshold. Done when `fetch_qualifying_articles()` returns articles or logs a skip, and mocked tests cover both paths.

## Scope

- Perplexity Sonar HTTP client wrapper targeting **`POST https://api.perplexity.ai/search`** (the dedicated raw-results endpoint, not `/chat/completions`). Handles auth, request, response parsing, basic error surfacing.
- The 5 intent queries from `PLANNING.md` as module-level constants
- `fetch_qualifying_articles()` — sends all 5 queries in **one batched `/search` request** (the endpoint accepts `query: string[]`), parses results into `list[Article]`, dedupes by URL, applies ≥3 threshold, returns the list (or empty when threshold not met)
- Pydantic `Article` schema (`title`, `url`, `publisher`, `published_date`, `snippet`). `publisher` is derived client-side from the URL hostname (Sonar `/search` does not return a publisher field).
- Mocked unit tests covering both the ≥3 happy path and the <3 skip path
- `PERPLEXITY_API_KEY` wired through the root `.env` and `.env.example` (docker-compose passes it into the backend container)
- Two decision-log entries in `PLANNING.md`:
  - The endpoint choice (`/search` over `/chat/completions`) — added when the implementation PR opens.
  - The ≥3 threshold rationale (rehash → compare → trend; audience wants analysis, not aggregation; sources transparency as editorial contract).

## Out of scope

- DB persistence of fetched articles — handled by `pipeline-orchestrator`, which consumes the returned list and writes the `posts` + `sources` rows
- Claude / blog generation — `blog-writer` feature
- HTTP endpoint or APScheduler wiring — `pipeline-orchestrator` and `scheduler-cron` respectively
- Production-grade retry / backoff / circuit breakers — deferred to `pipeline-resilience` in Phase 5

## Success criteria

- `fetch_qualifying_articles()` exists, sends all 5 queries in one `/search` call, pools results across queries, dedupes by URL, and returns a `list[Article]` when ≥3 results survive, or an empty list when <3
- Pydantic `Article` schema validates a real Sonar `/search` response without dropping required fields; `publisher` is derived from the URL hostname
- Mocked unit tests cover both the ≥3 path and the <3 skip path
- One manual smoke test against the real Sonar `/search` endpoint returns parseable results

## Dependencies

- `PERPLEXITY_API_KEY` — set in root `.env` ✅ (rotated 2026-05-13 after earlier exposure)
- Sonar API contract — pinned ✅: `POST https://api.perplexity.ai/search`, Bearer auth, `query: string | string[]`, `search_recency_filter: "week"` (closest fit for the "past 2 weeks" intent), response shape `{ results: [{ title, url, snippet, date, last_updated }] }`. Neither `/search` nor `/chat/completions` returns a publisher field — derive from URL hostname. Docs: https://docs.perplexity.ai/api-reference/search-post
- Decide whether to map URL hostnames to friendly publisher names (e.g. `techcrunch.com` → "TechCrunch") — **deferred**: ship with raw hostnames; revisit if source citations look ugly in real posts.

## Tasks

- [x] Sign up for Perplexity, generate API key
- [x] Add `PERPLEXITY_API_KEY` to root `.env` and `.env.example` (already present in `.env.example`; value set locally)
- [x] Read Sonar API docs; endpoint pinned: `POST https://api.perplexity.ai/search` (batched `query: string[]`, Bearer auth, `search_recency_filter: "week"`)
- [x] Add `httpx` to `backend/requirements.txt` — already present (`httpx==0.28.1`, added with backend-skeleton)
- [x] Create `backend/services/news_fetcher.py`
- [x] Define `Article` Pydantic schema (`title`, `url`, `publisher`, `published_date`, `snippet`); helper to derive `publisher` from URL hostname (`urlparse(url).hostname`, strip leading `www.`)
- [x] Add the 5 intent queries as module-level constants
- [x] Implement Sonar `/search` client wrapper (Bearer auth, single batched POST with all 5 queries, response → `list[Article]`)
- [x] Implement `fetch_qualifying_articles()` — calls the client once with all 5 queries, pools results, dedupes by URL, applies ≥3 threshold, returns `list[Article]` (empty when skipped)
- [x] Add basic logging: raw count, dedup count, threshold decision
- [x] Mocked unit test: ≥3 articles → returns pooled list (covers dedup, publisher derivation, batched request shape)
- [x] Mocked unit test: <3 articles → returns empty list + logs skip
- [x] Add decision-log entry to `PLANNING.md` covering the `/search` endpoint choice
- [x] Add decision-log entry to `PLANNING.md` covering the ≥3 threshold rationale and editorial reasoning

## Verification

- [x] `docker compose run --rm backend pytest` passes (14/14 — both new tests green, no regressions)
- [x] Manual smoke test: 10 articles returned, all parsed cleanly with title/url/publisher/published_date/snippet
- [x] Smoke-run logs show counts and threshold decision (`returned 10 raw articles` → `after dedup by url: 10 articles` → `threshold met (10 >= 3) — proceeding`)
- [ ] CI workflow stays green on the PR
