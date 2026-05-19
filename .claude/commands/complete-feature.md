---
description: Complete a feature plan, verify it against the original goal, and prepare cleanup
---

Complete the feature plan: $ARGUMENTS

> **Operating mode.** This command runs autonomously where it can. No approval gates: stage explicit files, commit, push, and open the PR without asking. Then wait for CI; on green, merge the PR and run cleanup in the same invocation. The user only sees the prompt again if (a) something fails, (b) checks haven't settled in 5 minutes, or (c) the plan has human-only verification items (UI walkthroughs, visual diffs, etc.) that genuinely require their eyes.

## 0. Resolve which plan
If `$ARGUMENTS` is empty:
- List all `feature-plans/*.md` files where frontmatter `status: in-progress`.
- If exactly one, default to it.
- If more than one, ask the user which.
- If none, stop and tell the user there's nothing to complete.

## 0.5. Detect mode — pre-merge or post-merge cleanup

Run `git fetch -p` once. Then decide:

**Post-merge cleanup mode** if EITHER of these is true:
- `git branch --merged <default-branch>` lists `feature/<plan-name>` (the branch is fully merged into main/master), OR
- A local `feature/<plan-name>` exists but `origin/feature/<plan-name>` does NOT (remote branch already deleted — typical after merging the PR on GitHub with auto-delete).

If post-merge cleanup mode → skip directly to **Step 12**. Do not run steps 1–11; the PR has already shipped and only local cleanup remains.

**Pre-merge mode** otherwise → continue with steps 1–11 below.

## 1. Read the plan file
Error if `feature-plans/<name>.md` doesn't exist. Warn if status isn't `in-progress` (might already be done, paused, or abandoned).

## 2. Checkbox audit
List every unchecked `- [ ]` task in the `## Tasks` section. For each:
- If the work is clearly done in the diff (file exists, behavior is in the code), tick it without asking.
- If it looks deferred/dropped (no trace in the diff), ask the user once whether to drop it (and add a `## Notes` line) or whether real work is still pending.
- If real work is pending → STOP. Suggest pausing the plan (`status: paused`) instead of completing.

`## Verification` checkboxes are handled in Step 3, not here.

## 3. Verification — split into automated vs human-only

**Tests first, no exceptions.** Run the full test suite (not just new tests) for the layers this feature touched (frontend `npm test`, backend `docker compose run --rm backend pytest`, etc.). If any test fails:
- STOP. The feature isn't done.
- Fix the root cause. Don't skip, comment out, or mock around a failing assertion.
- If a failure is genuinely unrelated to this feature, surface it to the user, file an issue, and get explicit approval before continuing.

Then partition the plan's `## Verification` checkboxes into two buckets:

- **Automated** — anything runnable from the terminal: typecheck, lint, unit tests, `curl` against a local server, Docker healthchecks, migration apply, etc. **Run these now**, tick on success, STOP on failure.
- **Human-only** — anything that requires the user's eyes: manual UI walkthroughs, visual diff against a design mockup, screenshot review, third-party SaaS dashboard check, accessibility check by ear/screen-reader. **Do not tick these.** Track them as `pending_human_checks` for the hand-off decision in Step 10.

Cross-reference the plan's **Goal**, **Success criteria**, and **Out of scope** sections against what was delivered. If anything appears to have crept past `Out of scope`, note it in the PR body's "Scope notes" — don't pause to ask unless the creep is large enough to need a PLANNING.md update (new tables/endpoints/architectural shifts).

## 4. Update frontmatter
Set:

```yaml
status: done
completed: <today's date in YYYY-MM-DD>
```

## 5. Plan file disposition
Do **not** delete the plan file here. Leave it in the working tree so it ships with the PR (reviewers see the contract). Step 12 removes it in the post-merge cleanup commit.

## 6. Draft the commit message

Derive issue references from context — don't ask. Check, in order:
1. `$ARGUMENTS` for `#NN` tokens.
2. The plan file body for `Fixes #NN` / `Closes #NN`.
3. Recent commit messages on this branch for issue refs.

If anything matches, include a `Fixes #NN` (or `Closes #NN`) trailer. Otherwise omit.

Follow the repo's existing commit style (`git log --oneline -10` to check). Default: present-tense imperative subject; 1–3 sentence body explaining what + why. Add `Co-Authored-By: Claude` only if prior commits in the repo do — don't introduce the convention.

```
<short imperative subject derived from plan goal>

<1–3 sentence body summarizing what this delivers and why>

Fixes #<N>  ← if relevant
```

## 7. Draft the PR title and body

Title: same short imperative as the commit subject.

Body (use a HEREDOC when calling `gh pr create`):

```markdown
## Summary
- <bullet from delivered tasks>
- <bullet>

## Test plan
- [x] <verification item — [x] if validated automatically in step 3, [ ] if human-only>
- [ ] <…>

## Scope notes
<only if step 3 flagged drift past Out-of-scope; otherwise omit this section>

Closes #<N>  ← if relevant
```

`## Summary` comes from delivered tasks. `## Test plan` mirrors the plan's `## Verification` section verbatim, with automated checks ticked and human-only checks left unticked (so the reviewer — and the user — can see what still needs human eyes).

## 8. Branch handling

Run `git branch --show-current`. Three cases:

- **On the repo's default branch** (`main` or `master`): create and check out `feature/<plan-name>` *before* committing. Refuse to commit to the default branch directly.
- **On `feature/<plan-name>` already**: proceed.
- **On any other branch**: ask the user — could be intentional (integration branch, hotfix branch). Don't assume.

## 9. Execute — no approval gate

Run sequentially. Each step depends on the previous.

1. `git checkout -b feature/<plan-name>` — only if step 8 said we're on the default branch.
2. `git add <explicit file list>` — name files explicitly. **Never** `git add -A` or `git add .` (per CLAUDE.md: keeps `.env`, credentials, large binaries from slipping in).
3. `git commit` with the HEREDOC message from step 6. **Never** use `--no-verify`, `--amend`, `--no-gpg-sign`, or any other hook/sign-bypass flag.
4. If a pre-commit hook fails: surface the failure, fix the underlying cause, re-stage the fix, create a **new** commit (never `--amend` — the original commit didn't happen, so amending would modify the previous commit and risk losing work).
5. `git push -u origin feature/<plan-name>` — sets upstream tracking.
6. `gh pr create --title "<title>" --body "$(cat <<'EOF' ... EOF)"` — HEREDOC body from step 7.
7. Capture the PR URL and number from `gh pr create` output.

If any step here fails irrecoverably, STOP and surface the failure. Do NOT proceed to auto-merge.

## 10. Wait for CI, then decide

**Poll required checks for up to 5 minutes.** Use `gh pr checks <PR-number> --json state,name,conclusion` (or `gh pr view <PR-number> --json statusCheckRollup`) in a loop with `sleep 15` between polls. Three outcomes:

| Outcome | Action |
|---|---|
| All required checks pass within 5 min | continue below |
| Any required check fails | STOP. Surface the failing check + a link to its logs (`gh run view`). Do **not** merge. The user fixes, force-pushes, and re-runs `/complete-feature`. |
| Still pending after 5 min | STOP. Tell the user: "Checks still pending after 5 min on PR #N — re-run `/complete-feature` once they settle." Do **not** merge. |

If a repo has **no** required checks, treat that as "all checks pass within 5 min" and continue.

If `pending_human_checks` from step 3 is non-empty:
- STOP with a clear hand-off message that lists each remaining human-only check by name.
- Tell the user: "After you verify these and merge PR #N on GitHub, re-run `/complete-feature` and I'll finish the cleanup."
- Do **not** merge the PR yourself — the user owns the eyes-on verification, and merging without it would defeat the point.

Otherwise (all CI green, no human-only checks remaining):
- **Merge the PR autonomously** with `gh pr merge <PR-number> --merge --delete-branch` (use `--merge` to match the merge-commit style this repo's history shows; switch to `--squash` only if recent merges on the default branch are squashes).
- Confirm the merge landed (`gh pr view <PR-number> --json state,mergedAt`).
- Continue into **Step 12** (post-merge cleanup) in the same invocation. The user does not need to re-invoke.

## 11. Report (pre-merge hand-off path only)

If step 10 stopped (failing check, pending check, or human-only verifications remaining), report:
- New commit SHA (`git log -1 --oneline`)
- Branch + remote tracking ref
- PR URL
- Why we stopped (failing check / still pending / human-only items)
- Exactly what the user needs to do before re-invoking

If step 10 merged autonomously, skip this section — step 12's report is the final report.

---

## 12. Post-merge cleanup

Reached either by auto-merge in step 10 (autonomous path, same invocation) or by the user re-invoking `/complete-feature` after a manual merge (step 0.5 routed here).

Run sequentially:

1. **Show current state** — `git status` and `git branch -vv` so the user can see where they were before we switch.
2. **Audit the plan's unchecked boxes** one last time. If any `## Tasks` boxes remain unchecked, list them. They're almost certainly the human-only verification items that have now been done; since we're about to delete the file, no need to tick them — just confirm nothing real is outstanding. If real implementation work is somehow still pending, STOP and tell the user the feature isn't actually done.
3. **Switch and pull**: `git checkout <default-branch>` then `git pull`. Verify the merge commit is present in the log.
4. **Delete the local feature branch**: `git branch -d feature/<plan-name>`. If git refuses with "not fully merged" (squash-merge can confuse the merge detector), confirm with the user before falling back to `-D`.
5. **Stage the plan file deletion**: `git rm feature-plans/<plan-name>.md`.
6. **Commit straight to the default branch** with message:
   ```
   remove completed <plan-name> feature plan
   ```
   Match the repository's existing commit style by checking `git log --oneline -10` for prior plan-removal commits.
7. **Push**: `git push origin <default-branch>`. If branch protection rejects the push, surface the error to the user — they can either bypass (if they're admin) or open a small cleanup PR. Don't bypass without permission.
8. **Report**:
   - The new commit SHA on the default branch
   - Confirmation the local feature branch is gone
   - Confirmation the plan file is gone
   - PR URL (for the record)

Stop there. Working tree should be clean and in sync with the remote.
