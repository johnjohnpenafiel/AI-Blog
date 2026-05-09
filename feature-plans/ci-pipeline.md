---
status: in-progress
started: 2026-05-09
---

# Feature: ci-pipeline

## Goal
Set up GitHub Actions CI that runs backend pytest (against a Postgres service container, after `alembic upgrade head`) and frontend lint/typecheck/test/build on every PR and push to `main`. Configure branch protection so red checks block merges to `main`.

## Scope
- `.github/workflows/ci.yml` with two parallel jobs:
  - **backend**: Python 3.x + Postgres 17 service container → install deps → `alembic upgrade head` → `pytest`
  - **frontend**: Node + npm → install deps → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build`
- Triggers: `pull_request` and `push` to `main`
- Branch protection rule on `main` requiring both jobs to pass before merge
- Workflow uses dummy/test env values for any required vars (no real secrets needed for CI)

## Out of scope
- Deployment / CD (no Railway/Render push step)
- Code coverage reporting (no Codecov, no thresholds)
- Dependency caching (pip / npm cache) — cold installs every run
- E2E tests (no Playwright/Cypress) or cross-service integration tests beyond pytest

## Success criteria
- A PR with a deliberately broken test shows a red ✗ and is blocked from merging
- A clean PR shows green ✓ and is mergeable
- Both jobs run in parallel on every PR and on every push to `main`

## Dependencies
- GitHub repo admin access (to configure branch protection)

## Tasks
- [x] Create `.github/workflows/ci.yml` with backend + frontend jobs
- [x] Backend job: Postgres 17 service container, install `requirements.txt`, run `alembic upgrade head`, run `pytest`
- [x] Frontend job: Node setup, `npm ci`, run lint + typecheck + test + build (in `frontend/`)
- [x] Push workflow on a feature branch and confirm it runs on the PR (PR #5 — both jobs green)
- [ ] Configure branch protection on `main` requiring both checks to pass (manual GitHub UI step after PR #5 merges)

## Verification
- [x] Open a PR with a deliberately broken backend test → confirm red ✗ (PR #6, closed)
- [x] Open a PR with a deliberately broken frontend test → confirm red ✗ (PR #7, closed)
- [x] Clean PR shows green ✓ and is mergeable (PR #5)
- [ ] After branch protection enabled: confirm a red PR cannot be merged
- [ ] Confirm jobs run on `push` to `main` after this PR merges
