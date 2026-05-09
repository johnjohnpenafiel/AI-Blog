# AI Workflow — End-to-End

This is the full lifecycle of a feature when using this toolkit. Steps marked **(optional)** can be skipped on small projects.

## Setup (once per project)

1. Copy `templates/CLAUDE.template.md` → `<project>/CLAUDE.md`. Fill in the placeholders. Delete companion blocks you aren't using.
2. **(optional)** Copy `templates/PLANNING.template.md` → `<project>/PLANNING.md`. Fill it in.
3. **(optional)** Copy slash commands: `commands/start-feature.md` and `commands/complete-feature.md` → `<project>/.claude/commands/`.
4. **(optional)** Copy the hook: `hooks/block-new-feature-plan.py` → `<project>/.claude/hooks/`. Make sure it's executable: `chmod +x .claude/hooks/block-new-feature-plan.py`. Merge `hooks/settings.snippet.json` into `<project>/.claude/settings.json`.
5. Run `/hooks` in the project to confirm the hook loaded.

## Per feature

### Start
1. `/start-feature my-feature-name`
2. Answer the interview questions. Be specific about scope and out-of-scope.
3. Review the proposed plan file. Edit if needed. Approve.
4. Plan file written to `feature-plans/my-feature-name.md` with `status: in-progress`.

### Implement
- Work normally. Update checkboxes as tasks complete.
- If you hit an external blocker, edit the file's frontmatter to `status: blocked` and note what you're waiting on. The plan no longer counts toward the open-plan limit.
- If you choose to set the work aside, set `status: paused`.
- If you abandon the work, set `status: abandoned` and rename the file to `_abandoned-<name>.md` (so it's visually grouped with other archives).

### Complete
1. `/complete-feature my-feature-name`
2. Audit unchecked boxes — finish, drop, or pause.
3. Walk through verification — tests, manual check, screenshots. Don't skip.
4. File frontmatter updated to `status: done`.
5. Choose cleanup: delete now or delete in merge commit.
6. Use the suggested commit/PR title. Reference any GitHub issue with `Fixes #N`.
7. Push, open PR, merge. The plan file is gone.

## When NOT to use a feature plan

- **Bugs and hotfixes** — track in GitHub Issues. The fix is in the diff; the issue is the record.
- **Dependency upgrades** — small enough to skip, or open an issue if it's a multi-step migration.
- **Small refactors** — same. If it's big enough that you'd want a checklist, it's a feature in disguise.
- **Spikes / experiments** — don't make a plan. If the spike pans out and you commit to building, *then* run `/start-feature`.

## When to update PLANNING.md

- New table or column in the database
- New API endpoint or contract change
- New top-level module or service
- A naming convention change
- Any decision you'd want a future contributor (or future you) to know the *why* of

The architectural-change rule in CLAUDE.md says: stop, confirm, update PLANNING.md in the same commit. If you find yourself merging a schema change without touching PLANNING.md, the rule was missed.

## When to use GitHub Issues

- Bugs (replaces a `BUGS.md` file)
- Feature requests / backlog (things you might do later)
- Discussions or decisions that aren't ready to become work
- Anything that needs an ID you can reference from commits

See `gh-cheatsheet.md` for the common commands.
