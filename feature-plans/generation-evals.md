---
status: done
started: 2026-06-03
completed: 2026-06-03
---

# generation-evals

## Goal
Confidence that auto-produced posts are actually good before they're trusted to publish unattended — an LLM-judge that scores each post on POV adherence, format adherence, and source grounding.

## Scope
- `schemas/evals.py` — `EvalResult` (per-dimension 0–2 scores + `passed` + `notes`).
- `services/evals.py` — `evaluate_post(post) -> EvalResult` via a cheap Haiku tool call; judges POV (operator-first / proof-over-hype), format adherence (matches the post's format shape/length), and source grounding (claims supported by the listed sources, no invented facts).
- `backend/scripts/eval_recent_posts.py` — run evals over the most recent N posts and print a readable table (operator-facing tool).
- Tests with mocked Claude.

## Out of scope
- **Auto-gating the publish flow** on eval results — that's a pipeline behavioral change for a follow-up. Evals are a *runnable tool* now, not a hard gate.
- **Promo-classifier accuracy harness** — needs a labeled dataset; deferred (it belongs with the live-run sampling, not this offline judge).
- Any change to generation or sourcing.

## Success criteria
- `evaluate_post` returns a validated `EvalResult` with the three dimension scores, `passed`, and `notes`.
- A judge that doesn't call the tool / errors surfaces clearly (raises `EvalError`).
- `eval_recent_posts.py` runs against the DB and prints per-post scores.
- Full backend suite green.

## Tasks
- [x] `schemas/evals.py` — `EvalResult`.
- [x] `services/evals.py` — `evaluate_post(post) -> EvalResult` (Haiku tool call) + `EvalError`.
- [x] `backend/scripts/eval_recent_posts.py` — CLI over recent posts.
- [x] `tests/test_evals.py` — mocked-judge happy path, error path, out-of-range validation.
- [x] Full backend suite green.

## Verification
- [x] `docker compose run --rm backend pytest` passes — **152 passed** (149 prior + 3 new).
- [x] `test_evaluate_post_returns_scores` asserts the judge's scores + `passed`.
- [x] `test_missing_tool_call_raises` asserts a missing tool call raises `EvalError`.

## Notes
- Evals fail **closed** (judge error → `EvalError`), unlike the content classifier (fails open). Run with `docker compose run --rm backend python scripts/eval_recent_posts.py [N]` (needs `ANTHROPIC_API_KEY`).
- Not wired as a hard publish gate (deferred); promo-classifier-accuracy harness deferred (needs labeled data).
