---
description: Autonomously complete every remaining feature in a roadmap phase on a sandbox branch — plan, implement, verify, merge into the sandbox, repeat. Never touches main.
---

Finish the roadmap phase: $ARGUMENTS

> **Operating mode.** This command runs end-to-end with no approval gates on a **sandbox branch** (e.g. `automated-work`). For each remaining feature in the named phase, it plans, implements, verifies locally, and merges into the sandbox branch. **No PRs, no CI polling, no commits to main.** The user reviews the accumulated work on the sandbox branch when the phase is done.
>
> Stop conditions: (a) the working tree starts on `main`/`master` (refuse — the whole point is to keep main untouched), (b) an architectural-change gate from CLAUDE.md fires, (c) verification fails and the root cause isn't a clear fix, (d) a merge conflict needs human judgment, (e) the phase finishes.

## 0. Resolve the phase

`$ARGUMENTS` should be a phase identifier — a number (`3`, `4`) or the name (`Phase 3 — Admin UI`). Match against `PLANNING.md` → `## Roadmap (development phases)` → `### Phase <n> — <name>`.

If empty, list the phases with per-feature status (Done / not Done) and STOP — ask which phase.

Build an **ordered list of remaining features** in that phase — every `#### <feature-name>` whose heading does NOT end with `*Done*`. Preserve roadmap order. Capture each feature's **Goal** and **Done when** lines verbatim — those are the spec.

If the list is empty: report "Phase already complete" and stop.

## 1. Pre-flight (once, before the loop)

Run these checks. Any failure → STOP with a clear message; do not start the loop.

- **`git branch --show-current`** — capture as `<sandbox-branch>`. **If it is `main` or `master`, REFUSE.** Tell the user to check out a sandbox branch first (`git checkout -b automated-work` or similar) and re-run. The whole purpose of this command is to keep main untouched.
- **`git status`** — working tree must be clean.
- **`git fetch -p`** — keep refs current.
- **`.env`** at repo root contains the keys the phase needs. Use existence-only checks (`grep -q '^ANTHROPIC_API_KEY=' .env`) — never echo values.
- **`feature-plans/`** exists; create it if not.
- Count `feature-plans/*.md` with `status: in-progress`. If ≥ 2, STOP — the hook would block plan creation anyway. List the offenders.

`gh` auth is NOT required here — this command does not open PRs.

## 2. The loop

For each remaining feature, in roadmap order, run **steps A–K sequentially**. Do not parallelize — later features may build on earlier ones already on the sandbox branch.

### A. Draft the plan (autonomous — no interview)

Source of truth: the roadmap entry's **Goal** and **Done when** lines, plus PLANNING.md (architecture, data model, API contracts, Out of scope) and `Design/README.md` (for UI features).

Fill each section yourself:

- **Goal** — copy from the roadmap, expand to one sentence if needed.
- **Scope** — concrete deliverables that, together, satisfy "Done when". 3–6 bullets.
- **Out of scope** — what could plausibly be confused for scope but isn't. Cross-reference PLANNING.md's "Out of scope" list and the phase's other features (anything that belongs to a later feature in the same phase is out of scope here). Push hard — this is the highest-value section.
- **Success criteria** — restate "Done when" as concrete testable conditions.
- **Dependencies** — only if real. Omit if none.
- **Tasks** — 3–8 `- [ ]` items that actually deliver the scope, ordered so each builds on the previous. Include test-writing as explicit tasks.
- **Verification** — `- [ ]` items. Convert as much as you can to programmatic checks (typecheck, lint, unit tests, integration tests, `curl` against a local dev server, `grep` for expected markup). Mark visual/eyeball-only items as `(human)` so the user can find them in the report.

**Architectural decisions — use judgment, don't reflexively stop.** CLAUDE.md says "stop and confirm" for architectural changes — that rule exists for live-on-main work. In this sandbox loop, the cost of trying is low and the user reviews everything before merging to main. So:

- **Proceed inline** when the change is small and clearly aligned with PLANNING.md's stated direction. Examples that qualify: adding a single column to an existing table, adding a new endpoint that fits the existing router pattern, a forward-only Alembic migration that adds (not removes/renames) state, a new query parameter on an existing endpoint, a new internal helper module.
- **STOP and surface** when the change would: (a) violate a "Constraints and non-negotiables" item in PLANNING.md (single dark theme, no images, single admin, fixed cadence, etc.), (b) reverse a decision logged in `PLANNING-decisions.md`, (c) require a destructive migration (drop/rename columns or tables with existing data semantics), (d) introduce a new external dependency (new SDK, new third-party API, new top-level Python package), (e) restructure scheduler behavior beyond the existing twice-weekly + 1-minute jobs, (f) introduce a concept PLANNING.md has no vocabulary for (a new top-level domain noun like "subscribers" or "drafts").
- **Do NOT autonomously edit PLANNING.md or PLANNING-decisions.md** either way. Instead, capture every architectural change you make in the per-feature report (see step J) under an "Architectural changes" section. The user folds approved changes into PLANNING.md at review time — that gate stays with them.

When in doubt, the test is: "would a careful reader of PLANNING.md be surprised by this?" If yes, stop. If no, proceed and document.

### B. Write the plan file

Path: `feature-plans/<name>.md`. Frontmatter:

```yaml
---
status: in-progress
started: <today's YYYY-MM-DD>
---
```

The PreToolUse hook enforces the ≤2-in-progress limit. Should never trigger inside this loop (we complete one before starting the next). If it does, STOP — cleanup didn't work on a prior iteration.

### C. Branch

`git checkout -b feature/<name>` from `<sandbox-branch>`. Refuse if not on `<sandbox-branch>` (means a prior iteration's cleanup didn't finish — STOP and surface).

### D. Implement the tasks

Work through `## Tasks` in order. Tick each `- [ ]` → `- [x]` in the plan file as you go.

Rules:
- Use Read/Edit/Write directly. Reach for Agent only if a task genuinely benefits from isolated context (rare for the features in this roadmap).
- Run typecheck + lint after each substantive change. If broken, fix before moving on.
- Don't introduce abstractions, helpers, or "future-proofing" beyond what tasks require (per CLAUDE.md).
- For UI features, follow `Design/README.md` strictly — design tokens, chamfer geometry, Tier 1/Tier 2 border discipline.
- For FastAPI/Docker-touching features, the user is learning — leave short comments only when the *why* is non-obvious. Do NOT pause to "teach" inline; the value here is shipping.

If a task is genuinely impossible (missing credential, ambiguous requirement PLANNING.md doesn't resolve), STOP and surface. Don't half-implement.

### E. Verify locally

Run the plan's programmatic `## Verification` items. Tick on green; STOP on red.

Then run the full project test suite for the layers touched:
- Backend touched: `docker compose run --rm backend pytest`
- Frontend touched: `cd frontend && npm test && npm run typecheck && npm run lint`
- If the feature exposes routes: boot the dev server (`docker compose up -d` and/or `cd frontend && npm run dev`) in the background and `curl` the routes, grep responses for expected markup. Tear down when done.

Tests first, no exceptions. Any failure → fix the root cause. No skipping, no mocking around it.

Collect `(human)` verification items into `pending_human_checks` for the report. Do not tick those.

### F. Finalize the plan file

- Tick remaining `## Tasks` boxes that the diff proves complete.
- Update frontmatter:
  ```yaml
  status: done
  completed: <today's YYYY-MM-DD>
  ```
- Cross-check Goal / Success criteria / Out of scope against what was delivered. If scope crept, capture it in a `## Notes` section at the bottom of the plan.

### G. Commit on the feature branch

`git add <explicit file list>` — name every file. Never `-A` or `.`.

Commit message: present-tense imperative subject, 1–3 sentence body explaining what + why. Match recent `git log --oneline -10` style.

- Include `Co-Authored-By: Claude` only if recent commits already do (per memory: short-form attribution, no model identifier or email).
- No `--no-verify`, `--amend`, or signing-bypass flags. If a hook fails, fix the cause and make a NEW commit (per CLAUDE.md).

### H. Merge back into the sandbox

```
git checkout <sandbox-branch>
git merge --no-ff feature/<name> -m "merge feature/<name> into <sandbox-branch>"
```

`--no-ff` preserves the per-feature branch shape in the history, making it easy for the user to read the diff per feature later.

If the merge has conflicts, STOP. Conflicts on a single-author sandbox branch indicate something is wrong (almost always an earlier feature's cleanup leaving residue). Surface to the user — do not auto-resolve.

### I. Delete the feature branch + plan file

```
git branch -d feature/<name>
git rm feature-plans/<name>.md
git commit -m "remove completed <name> feature plan"
```

The plan-deletion commit lands on `<sandbox-branch>` (the merge already brought it onto sandbox; this commit just removes the file).

Do NOT push to origin — this is a local sandbox. The user pushes the sandbox branch themselves when they're ready (or never, if they decide to throw it away).

### J. Per-feature report

Append to `reports/phase-<n>-<YYYY-MM-DD>.md` (create on the first iteration). One section per feature:

```markdown
## <feature-name> — shipped <YYYY-MM-DD>

**Merge commit:** <sha-from-step-H>
**Plan-removal commit:** <sha-from-step-I>
**Feature branch (deleted):** feature/<name>

### What shipped
- <bullet from delivered tasks>

### Manual tests for the user to run
- <concrete step — exact URL, exact command, exact thing to look for>
- <…>

### Pending human checks
- <visual/eyeball-only items from the plan's verification — "none" if clean>

### Bugs / known issues
- <TODOs left, flaky tests, anything noticed but not fixed — "none" if clean>

### Architectural changes
- <every change touching the data model, API contracts, scheduler, or top-level module layout — exact change + reason. "none" if clean.>
- <if anything here is non-trivial, the user should consider folding it into PLANNING.md + PLANNING-decisions.md before merging the sandbox into main.>

### Scope notes
- <anything that deviated from the plan — "none" if clean>
```

### K. Next iteration

Loop back to step A for the next feature in the list. The working tree should be clean and on `<sandbox-branch>`.

## 3. End of phase

After the last feature lands:

1. Append a phase summary to the same `reports/phase-<n>-<YYYY-MM-DD>.md`:
   ```markdown
   ---

   # Phase <n> complete

   - Features shipped: <list>
   - Commits on <sandbox-branch>: <range, e.g. abc123..def456>
   - Aggregated pending human checks: <merged list across features>
   - Suggested next: <first feature in Phase <n+1>, if any>

   ## How to review

   - Branch: <sandbox-branch>
   - Per-feature diffs: `git log --first-parent --oneline <sandbox-branch>` shows one merge commit per feature.
   - To inspect one feature: `git show <merge-sha>`.
   - When satisfied: `git checkout main && git merge <sandbox-branch>` (or open a PR from `<sandbox-branch>` → main).
   - To throw it away: `git checkout main && git branch -D <sandbox-branch>`.
   ```
2. Show the user: final `git log --first-parent --oneline -10` on `<sandbox-branch>`, the report path, the aggregated `pending_human_checks`.
3. STOP. Do not roll into the next phase without an explicit invocation.

## Failure handling — when to stop the whole loop

Stop the entire phase loop (not just the current feature) when:

- Step 1 detects you're on `main`/`master`.
- An architectural change in step A falls into the "STOP" list (violates non-negotiables, reverses a logged decision, destructive migration, new external dependency, scheduler restructure, new top-level domain noun).
- Implementation in step D is genuinely blocked (missing credential, ambiguous spec).
- Verification in step E fails and the failure isn't a clear root-cause fix.
- A merge conflict appears in step H.
- The plan-removal commit in step I fails for a reason other than "nothing to remove".

When stopping: write what you have to the report (including the partial state), leave the feature branch and any uncommitted work intact, surface to the user with: (a) which feature, (b) which step failed, (c) what the user needs to do, (d) how to resume (usually: finish that feature manually, then re-invoke `/finish-phase` — it'll pick up the next remaining roadmap entry).

## Things this command does NOT do

- Touch `main`/`master` in any way.
- Open PRs, push to origin, or wait for CI.
- Update PLANNING.md, PLANNING-decisions.md, `Design/README.md`, or `Design/decisions.md` — those changes need user judgment.
- Modify settings, hooks, or anything in `.claude/`.
- Run UI screenshot diffs or visual QA — those are pending_human_checks.
- Decide whether to abandon a roadmap feature — that's a user call.
