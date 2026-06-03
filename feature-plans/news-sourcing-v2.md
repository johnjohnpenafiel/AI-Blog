---
status: done
started: 2026-06-03
completed: 2026-06-03
---

# news-sourcing-v2

## Goal
Replace the domain allowlist with an open canvas + AI promo-classifier, and select topics by operator-relevance rather than raw article count — fetching and attributing by **section** (per the user's "section-based queries" decision).

## Scope
- **Section-based queries:** one Sonar `news:` query per volume-safe / borderline section (6 sections), each article attributed to that section. `Article.tag` → `Article.section`.
- **Open canvas:** drop `search_domain_filter` (the 18-domain allowlist) from the Sonar request; keep `news:` phrasing + `search_recency_filter`.
- **Small blocklist:** a short `DOMAIN_BLOCKLIST` of pure vendor-promo channels (PR wires), dropped after fetch. The classifier is the real gate.
- **Promo classifier (`services/content_classifier.py`):** a single cheap Haiku call judging each article `is_news` (drop promo) + an operator-relevance `importance` (0–2). New `schemas/classifier.py`.
- **Anti-repetition:** drop articles whose URL already appears in `sources`; exclude the last published post's `section` from winning when alternatives exist.
- **Importance ranking:** winning section = qualifying cluster (≥3 news articles) with the highest summed importance; tie-break by size. Replaces "largest raw cluster wins."
- Pipeline sets `post.section` from the winning cluster; regenerate path + blog-writer prompt updated for the `section` field.

## Out of scope
- **Multi-format generation / POV voice / scheduler** — Phase 2 feature 2 (`multi-format-generation`). Blog-writer here only gets the `tag`→`section` wording fix; tone/format unchanged.
- **The Roundup** — feature 3.
- **Spike-vs-baseline importance** — needs historical per-section counts (Phase 3 `weekly-volume-testing`); deferred and documented. Importance uses the classifier's per-article judgment + breadth only.
- **Tag-vocabulary population** (nested fine tags onto posts) — generation concern, later.
- **Querying the tag-only / adjacent sections** (F&I, Back Office/DMS, AI Car Shopping) — only volume-safe + borderline sections get queries for now.

## Success criteria
- Sonar requests carry **no** `search_domain_filter`; one request per section query.
- A non-news article (classifier `is_news=false`) is excluded before threshold counting.
- An article whose URL is already in `sources` is excluded.
- The winning section is chosen by summed importance among ≥3-article clusters, never repeating the last published section when an alternative qualifies.
- `fetch_qualifying_articles` returns articles carrying `section`; the pipeline writes `post.section`.
- Full backend suite green.

## Tasks
- [x] Add `schemas/classifier.py` (`ArticleVerdict`, `ClassifierVerdicts`).
- [x] Add `services/content_classifier.py` — `classify_articles(articles) -> dict[url, ArticleVerdict]` via one Haiku tool call; fail-open behavior documented.
- [x] Rewrite `services/news_fetcher.py` — `Article.section`, `SECTION_QUERIES`, open canvas, `DOMAIN_BLOCKLIST`, already-cited-URL filter, classifier gate, `_last_published_section`, importance-based winner selection.
- [x] Update `services/pipeline.py` to set `post.section` from the winning cluster.
- [x] Update `routers/posts.py` regenerate (`tag` → `section`) and `services/blog_writer.py` prompt wording (`tag` field → `section`).
- [x] Rewrite `tests/test_news_fetcher.py` for section-based fetch + classifier mock + anti-repetition + importance; update `test_blog_writer.py` / `test_pipeline.py` for `Article.section`; add `tests/test_content_classifier.py`.
- [x] Run the full backend suite green.

## Verification
- [x] `docker compose run --rm backend pytest` passes — **132 passed** (123 prior + 9 net new, no regressions).
- [x] A test asserts the Sonar request body has no `search_domain_filter` (`test_returns_winning_section_and_uses_open_canvas`).
- [x] A test asserts a classifier-`false` article is dropped before the ≥3 threshold (`test_classifier_drops_non_news_before_threshold`).
- [x] A test asserts an already-cited URL is dropped (`test_already_cited_urls_are_dropped`).
- [x] A test asserts importance (not raw count) picks the winner (`test_importance_not_raw_count_picks_winner`) and the last section is avoided (`test_anti_repeat_avoids_last_section_even_if_higher_importance`).

## Notes
- **Real classifier behavior is unverified on this machine** (tests mock the Haiku call). The promo/importance judgment quality needs one live pipeline run to eyeball — pending human check.
- Spike-vs-baseline importance deferred (needs Phase 3 historical data); importance uses the classifier's per-article judgment + breadth.
- Only the 6 volume-safe/borderline sections are queried; F&I, Back Office/DMS, and AI Car Shopping are not (one-line additions to `SECTION_QUERIES` when justified).
