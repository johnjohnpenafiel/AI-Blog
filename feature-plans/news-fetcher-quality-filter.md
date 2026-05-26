---
status: in-progress
started: 2026-05-24
---

# Feature: news-fetcher-quality-filter

## Goal

Filter non-news content out of Perplexity Sonar results inside `news_fetcher.py`, and narrow each pipeline run to one focused topic cluster — so the ≥3-article threshold counts only real news, and generated posts cover 1–2 categories instead of mixing 3–4.

## Scope

- Rewrite the 5 existing Sonar queries with `news:`-prefixed, news-flavored phrasing.
- Add 3 new queries to cover currently-unrepresented tags (Pricing & Analytics, Sales Dev, OT & Infrastructure) — **8 queries total**.
- Add `search_domain_filter` allowlist of curated automotive/tech news outlets as a second-layer safety against vendor product pages.
- Tag each fetched article with the source query / category.
- Group articles by category after fetch, pick ONE winning cluster (highest count; tie-break by "category different from last published post").
- Apply ≥3 threshold to the *winning cluster*, not the total pool. Skip the run if no cluster qualifies.
- Update the blog-writer prompt to narrow output from 2–4 tags to 1–2 tags.
- Add a post-MVP roadmap entry capturing Option B + auto-mode rework.

## Out of scope

- Multi-post generation per run (post-MVP — Option B).
- Re-thinking `auto` mode semantics so it only fills scheduled Mon/Thu slots and never publishes immediately on manual trigger (post-MVP).
- Auto-scheduling extra clusters into future Mon/Thu slots (post-MVP).
- Skipping a scheduled pipeline run if the review queue is already full (post-MVP).
- Per-article relevance classification beyond category grouping (e.g. a Claude classification call per article).
- Changes to the `posts` table schema, the scheduler, or any admin UI.

## Success criteria

- Across a representative sample of real Sonar runs, ≥80% of returned articles are real news (not vendor / marketing / landing pages).
- The threshold logic operates on filtered, per-cluster counts — not the raw pool.
- Generated posts carry 1–2 tags, not 3–4.
- All 7 tags in the system have at least one query that can surface them.
- Existing `news_fetcher` tests still pass; new tests cover vendor-domain rejection, cluster grouping, tie-break behavior, and sub-threshold skip.

## Dependencies

- `PERPLEXITY_API_KEY` already configured in `.env` (no new credentials needed).
- A finalized curated list of news domains for `search_domain_filter` (decided during implementation).
- Read access to the `posts` table for the tie-break "different from last published" lookup.

## Tasks

- [x] Replace `SONAR_QUERIES` with the 8 refined queries
- [x] Build a `QUERY_TO_TAG` mapping so each article inherits the category of its source query
- [x] Curate the news-domain allowlist (~15–20 domains) and add it as `search_domain_filter` in the Sonar request body
- [x] Ensure each Sonar result can be correlated back to its source query (either via response field or per-query request structure)
- [x] Implement category grouping in `fetch_qualifying_articles()` — group deduped articles by inherited tag
- [x] Implement winning-cluster selection: highest count, tie-break = "tag different from last published post" (DB lookup)
- [x] Apply ≥3 threshold to the winning cluster; log + skip otherwise
- [x] Return only the winning cluster's articles from `fetch_qualifying_articles()`
- [x] Update the blog-writer prompt: narrow tags from 2–4 to 1–2
- [x] Update / add unit tests in `backend/tests/test_news_fetcher.py` (mock Sonar responses for: clean cluster, vendor-page rejection, sub-threshold skip, tie-break)
- [x] Add post-MVP roadmap entry in `PLANNING.md` (Option B + auto-mode rework)
- [x] Log a dated entry in `PLANNING-decisions.md` covering: why per-cluster threshold, why 3-lite over 3-full, why allowlist over blocklist
- [x] Update `PLANNING.md` pipeline section to reflect the new step-1 behavior (8 queries + clustering + per-cluster threshold)

## Verification

- [x] Run `docker compose run --rm backend pytest backend/tests/test_news_fetcher.py` — all green (96 tests, full suite)
- [ ] Manually trigger the pipeline (`POST /pipeline/run`) with real `PERPLEXITY_API_KEY`; inspect logs for raw count, per-cluster counts, winning cluster, generated post tags (should be 1–2)
- [ ] Manually inspect 10+ articles across the cluster groupings — confirm ≥80% are real news, not vendor pages
- [ ] Confirm the generated post's tags appear correctly in the admin queue / `posts` table
- [ ] Trigger the pipeline twice in succession with similar cluster counts; verify the tie-break picks a different category the second time
