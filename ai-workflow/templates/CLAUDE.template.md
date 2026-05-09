# {{PROJECT_NAME}}

{{One-line description of what this project is.}}

# Bash commands
- {{start dev server, e.g. `npm run dev`}}
- {{run tests, e.g. `pytest` or `npm test`}}
- {{typecheck, e.g. `npm run typecheck`}}
- {{lint, e.g. `npm run lint`}}

# Code style
- {{Only list rules that DIFFER from language/framework defaults.}}
- {{e.g. "snake_case for DB columns, camelCase for JSON responses"}}
- Keep files under {{500}} lines — split when approaching the limit.

# Workflow
- {{Branch naming, e.g. `feature/...`, `bugfix/...`}}
- {{Commit message style, e.g. present tense, reference issue IDs}}
- Never commit secrets. Never use `--no-verify` on commits.
- Before claiming a task is complete, list what was asked vs. what was done, and explicitly call out anything skipped.

# Gotchas
- {{Non-obvious things that have bitten you — required env vars, services that must be running, weird build steps, framework quirks}}

---

## Optional companion blocks

The blocks below are only active if you create the referenced file. Delete any block whose file you don't use.

<!-- If you create PLANNING.md (recommended for non-trivial projects): -->
# Architecture context
See @PLANNING.md for the system architecture, stack decisions, and naming conventions.

Before making architectural changes (new tables, new endpoints, new top-level modules): STOP, confirm with the user, then update @PLANNING.md in the same commit. Documentation drift here is the most common source of stale context.

<!-- If the project has a test suite: -->
# Testing
- Run tests with: {{e.g. `pytest`, `npm test`}}
- Test location: {{e.g. `tests/` mirroring `src/`, or colocated `*.test.ts`}}
- New business logic requires: 1+ expected-use test, 1+ edge-case test, 1+ failure-case test.
- Mock external dependencies (database, network, time). Don't mock the system under test.
- Never claim a feature is complete until the full suite passes. If tests fail, fix the root cause — don't suppress, skip, or comment out the assertion.
- A new feature without tests is not done.

<!-- If you adopt the Feature Plan Workflow: -->
# Feature Plan Workflow
A "feature" is net-new user-facing functionality. Bugs, hotfixes, dependency upgrades, and refactors are NOT features and don't need a plan — track those in GitHub Issues (or your tracker) instead.

- Each feature gets `feature-plans/<name>.md` with frontmatter `status:` (in-progress, blocked, paused, abandoned, done).
- Before starting a new feature, run `/start-feature <name>`. It checks the open-plan limit, interviews you for scope, and creates the plan file.
- When done, run `/complete-feature <name>`. It audits checkboxes, verifies against the original goal, and prepares cleanup.
- Hard limit: max 2 plans `in-progress` at once. A `PreToolUse` hook enforces this (see `.claude/hooks/`).
- A plan in `blocked` or `paused` doesn't count against the limit, but the user must have explicitly set the status.
- When a feature merges, delete the file in the merge commit.

<!-- If you have a design system: -->
# UI/design work
For any frontend or UI work, read @Design/README.md first.

<!-- If you have skills: -->
# Skills
Per-domain conventions live in `.claude/skills/`. Claude loads them on demand — don't duplicate that content here.
