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

## 6. Draft the commit message

Ask once whether there's a related GitHub issue to close — if yes, include `Fixes #N` (or `Closes #N`) so it auto-closes on merge to the default branch.

Follow the repository's existing commit style (`git log --oneline -10` to check). Default to a present-tense imperative subject. Don't add a `Co-Authored-By` line unless the project's git history shows one is customary.

```
<short imperative subject derived from plan goal>

<1–3 sentence body summarizing what this delivers and why>

Fixes #<N>  ← if relevant
```

## 7. Draft the PR title and body

Title: same short imperative as the commit subject (or shorter if the commit was scoped narrowly).

Body shape (use a HEREDOC when calling `gh pr create` so formatting survives):

```markdown
## Summary
- <bullet from delivered tasks>
- <bullet>

## Test plan
- [x] <verification item from plan, [x] if validated, [ ] if pending>
- [x] <…>

Closes #<N>  ← if relevant
```

Pull `## Summary` from the plan's delivered tasks. Pull `## Test plan` from the plan's `## Verification` section.

## 8. Branch handling

Run `git branch --show-current`. Three cases:

- **On the repo's default branch** (`main` or `master`): create and check out `feature/<plan-name>` *before* committing. Refuse to commit to the default branch directly.
- **On `feature/<plan-name>` already**: proceed.
- **On any other branch**: ask the user — could be intentional (integration branch, hotfix branch). Don't assume.

## 9. Single approval gate

Show the user, in one message:

1. **`git status --short`** — modified + untracked
2. **`git diff HEAD --stat`** — scale of the change
3. **Files to stage** — explicit paths you'll `git add`. Per CLAUDE.md guidance: never `git add -A` or `git add .`. Name files explicitly so `.env`, credentials, or large binaries can't slip in.
4. **Commit message** — the message drafted in step 6
5. **PR title and body** — drafted in step 7

Ask once: *"Approve commit + push + open PR? (yes / edit / cancel)"*

- **yes** → proceed to step 10
- **edit** → ask which part(s) to revise (commit message, PR body, files to stage), redraft, return to gate
- **cancel** → stop. The plan file is already `done`; the user can commit manually later.

Never proceed without an explicit "yes."

## 10. Execute

Run sequentially (each depends on the previous):

1. `git checkout -b feature/<plan-name>` — only if step 8 said we're on the default branch
2. `git add <explicit file list>` — no `-A`, no `.`
3. `git commit` with the HEREDOC message. **Never** use `--no-verify`, `--amend`, `--no-gpg-sign`, or any other hook/sign-bypass flag.
4. If a pre-commit hook fails: surface the failure, fix the underlying cause, re-stage the fix, create a **new** commit (never `--amend` — the original commit didn't happen, so amending would modify the previous commit and risk losing work).
5. `git push -u origin feature/<plan-name>` — sets upstream tracking
6. `gh pr create --title "<title>" --body "$(cat <<'EOF' ... EOF)"` — HEREDOC body
7. Capture the PR URL from `gh pr create` output

## 11. Report

Show the user:
- New commit SHA (`git log -1 --oneline`)
- Branch + remote tracking ref
- PR URL

Stop there. Don't merge for the user — they own that step.
