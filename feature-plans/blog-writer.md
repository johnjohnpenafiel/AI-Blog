---
status: in-progress
started: 2026-05-15
---

# Feature: blog-writer

## Goal
Build a service that takes qualifying articles from `news_fetcher` and returns a Claude-generated, schema-validated blog post object — the second stage of the automated pipeline.

## Scope
- Core `generate_post(articles)` function in `backend/services/blog_writer.py`
- Anthropic SDK client setup (reads `ANTHROPIC_API_KEY` from env, pinned to `claude-sonnet-4-20250514`)
- `GeneratedPost` Pydantic schema matching the JSON contract (title, slug, summary, meta_description, body, tags, sources)
- Strict validation — fail loud on malformed JSON, missing fields, or invalid tag values
- Unit tests with mocked Anthropic client

## Out of scope
- DB writes (posts / sources rows) — handled by `pipeline-orchestrator`
- Routing by `publishing_mode` (auto vs approve_only) — handled by `publisher.py` / orchestrator
- HTTP endpoints / API routes — pure service layer only
- Retry / backoff on Claude API failures — deferred to `pipeline-resilience` (Phase 5)

## Success criteria
- `generate_post(articles)` returns a Pydantic-validated `GeneratedPost` with all required fields populated
- Malformed Claude responses raise clear, typed exceptions with enough context to debug
- Tags constrained to the 7 allowed values (Voice AI, Pricing & Analytics, CRM, Merchandising, Sales Dev, OT & Infrastructure, Industry Move); 2–4 tags required; out-of-set values fail validation
- All unit tests pass in `docker compose run --rm backend pytest` and in GitHub Actions CI

## Dependencies
- `ANTHROPIC_API_KEY` present in root `.env`
- `anthropic` Python SDK pinned in `backend/requirements.txt`
- Article object shape from the shipped `news-fetcher` feature — reuse its Pydantic model rather than redefining

## Tasks
- [ ] Add `anthropic` SDK to `backend/requirements.txt` with a pinned version
- [ ] Define `GeneratedPost` Pydantic schema in `backend/schemas/` (title, slug, summary, meta_description, body, tags, sources) with strict tag enum (2–4 of the 7 allowed values)
- [ ] Create `backend/services/blog_writer.py` with Anthropic client init (reads `ANTHROPIC_API_KEY`, pinned to `claude-sonnet-4-20250514`)
- [ ] Implement `generate_post(articles)`: build prompt from the PLANNING.md template, call Claude, parse + validate response into `GeneratedPost`
- [ ] Raise typed exceptions on malformed JSON, missing fields, invalid tag values — no silent fallbacks
- [ ] Add unit tests in `backend/tests/` mocking the Anthropic SDK: happy path, malformed JSON, missing fields, invalid tag values

## Verification
- [ ] `docker compose run --rm backend pytest` passes locally
- [ ] One live smoke test against real Claude API with articles from `news_fetcher` — capture the output
- [ ] Manual quality check on smoke-test output: tone fits audience, tags sensible, 600–900 word body, sources preserved
- [ ] CI green on the PR
