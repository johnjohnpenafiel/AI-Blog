---
description: Audit Design/site-map/ against the actual frontend code; report drift and update the map so it matches the site as built
---

<!-- PROJECT-LOCAL command (AI-Blog only) — NOT synced from ~/Development/ai-workflow.
     It exists so the Design/site-map reference never rots the way Design/README.md did. -->

Sync the site map: $ARGUMENTS

**What this is.** `Design/site-map/` is the canonical naming reference for the UI — one directory per page, one file per section, each listing that section's element tree and its source component(s). It documents **structure and element names only, never copy/content**. Read `Design/site-map/README.md` first: it defines the directory layout, the shared vocabulary, and the naming contract. This command verifies the map against the real frontend code and fixes any drift.

**Modes.**
- No arguments → incremental check (default): verify only what changed since the last sync.
- `full` → ignore the marker and re-verify every map file against its sources.

## 1. Find the baseline

Read the `Last synced:` marker at the bottom of `Design/site-map/README.md` (format: `Last synced: <short-sha> · <YYYY-MM-DD>`).

- Marker present and mode is incremental → baseline = that commit.
- Marker missing, unparseable, or the sha is unknown to git (`git cat-file -t <sha>` fails) → fall back to **full** mode.

## 2. Determine what to check

Incremental mode:
```
git diff --name-only <baseline>..HEAD -- frontend/src/app frontend/src/components
git status --porcelain -- frontend/src   # uncommitted work counts too
```
Ignore `__tests__/` files and pure-logic files (`lib/`, `api/` route handlers, contexts) — they carry no visual structure. Map each remaining changed file to the site-map file(s) that reference it (every map file lists its sources under **Source:**). A changed file referenced nowhere is a **coverage gap** — treat it as drift.

Full mode: every map file is in scope.

## 3. Structural checks (always run, both modes — they're cheap)

1. **Dead references** — every `frontend/src/...` path mentioned in any map file must exist on disk.
2. **Coverage** — every file in `frontend/src/components/public/`, `frontend/src/components/dashboard/`, top-level `frontend/src/components/*.tsx`, and every `page.tsx`/`layout.tsx` under `frontend/src/app/` must be referenced by at least one map file (same exclusions as step 2). New unreferenced components mean a new/changed section the map doesn't know about.
3. **Tree accuracy** — the directory tree drawn in `site-map/README.md` must match the actual files under `Design/site-map/`.

## 4. Accuracy check

For each map file in scope, read its source component(s) and compare against the documented element tree:

- Sections present, and in the same top-to-bottom order (file number prefixes must match visual order).
- Element names still describe what's rendered (elements added / removed / restructured / renamed).
- Gutter markers, variants, states, and behavioral notes still true.
- Source paths still correct.

Judge **structure**, not copy — text/copy changes alone are not drift. When unsure whether something is structural, err on updating the map: the map's job is that the user can point at any part of the UI by name.

## 5. Fix drift

- Update element trees, names, markers, and notes to match the code.
- New section → new numbered file (public pages) or new block in the page file (dashboard); removed section → delete/remove it; reordered → renumber file prefixes.
- New page → new directory/file mirroring the existing pattern; removed page → delete.
- Keep the README's directory tree and vocabulary tables in step with any of the above.
- Preserve the map's voice: terse trees, names + one-line notes, no content dumps.

## 6. Stamp and commit

1. Update the marker line at the bottom of `Design/site-map/README.md` to the current `git rev-parse --short HEAD` and today's date — **even when nothing drifted** (that's what makes the next incremental run cheap).
2. If anything under `Design/site-map/` changed, commit **only those files** straight to the current branch (docs chore — no PR): message `sync site-map with frontend` (+ `Co-Authored-By: Claude`). Never sweep unrelated working-tree changes into this commit. If the map files were already dirty/untracked before this run in ways this run didn't produce, say so and let the user decide instead of committing.

## 7. Report

End with a short table: each map file checked → `current` / `updated (what changed)` / `added` / `removed`, plus any coverage gaps found. One line up top with the verdict: "Site map is current" or "N files updated".
