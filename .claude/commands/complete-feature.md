---
description: Complete a feature plan, verify it against the original goal, and prepare cleanup
---

Complete the feature plan: $ARGUMENTS

## 0. Resolve which plan
If `$ARGUMENTS` is empty:
- List all `feature-plans/*.md` files where frontmatter `status: in-progress`.
- If exactly one, default to it.
- If more than one, ask the user which.
- If none, stop and tell the user there's nothing to complete.

## 1. Read the plan file
Error if `feature-plans/<name>.md` doesn't exist. Warn if status isn't `in-progress` (might already be done, paused, or abandoned).

## 2. Checkbox audit
List every unchecked `- [ ]` task. For each, ask the user:
- Was it finished and the box just wasn't ticked? → Tick it.
- Is it being deferred or dropped? → Remove it from the file (and add a one-line note in the `## Notes` section explaining why).
- Is real work still pending? → STOP. The feature isn't done. Suggest pausing the plan (`status: paused`) instead of completing it.

## 3. End-of-turn verification

**Tests first, no exceptions.** Run the full test suite (not just new tests). If any test fails:
- STOP. The feature isn't done.
- Fix the root cause. Don't skip, comment out, or mock around a failing assertion.
- If a failure is genuinely unrelated to this feature, surface it to the user, file an issue, and get explicit approval before continuing.

Then continue:

- Re-read the plan's **Goal** and **Success criteria** sections.
- List what was actually delivered, mapped to the checklist.
- Compare against the **Out of scope** section. Flag anything that may have crept in. Ask the user to confirm: intentional scope expansion (update PLANNING.md if it's architectural) or accidental?
- Walk through every remaining **Verification** checkbox (typecheck, lint, manual smoke, screenshots, etc.). Ask explicitly for a yes or no on each. Don't accept silence. If any is no, STOP and have the user run it before continuing.

## 4. Update frontmatter
Set:

```yaml
status: done
completed: <today's date in YYYY-MM-DD>
```

## 5. Cleanup
Ask the user which they prefer:

- **Delete now**: remove the file and stage the deletion for the next commit.
- **Delete on merge**: leave the file in place so it appears in the PR for reviewers, then delete it in the merge commit.

## 6. Suggest a commit/PR title and body
Draft from the plan's Goal and delivered tasks. Show it to the user; let them edit. Use this shape:

```
<short imperative title>

<1–2 sentence body summarizing what this delivers>

Fixes #<issue-number>  ← include if there's a related GitHub issue
```

## 7. GitHub Issues link
Ask if there's a related `gh` issue to close. If yes, include `Fixes #N` (or `Closes #N`) in the commit/PR message — GitHub auto-closes it on merge to the default branch.

Don't push or merge for the user — they handle that. This command finishes when the file is updated and the commit message is drafted.
