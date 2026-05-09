# GitHub CLI Cheatsheet

Common `gh` commands for working with Issues and PRs alongside Claude Code.

## One-time setup

```bash
brew install gh
gh auth login            # pick HTTPS + browser auth, follow prompts
gh issue list            # confirm it works in any repo you've cloned
```

## Issues

### Create
```bash
gh issue create --title "Login fails on slow network" --body "..." --label bug
gh issue create --title "Add CSV export" --label enhancement
```

### List / search
```bash
gh issue list                                    # all open issues
gh issue list --state open --label bug           # open bugs
gh issue list --assignee @me                     # assigned to you
gh issue list --search "session in:title"        # title search
```

### View / edit / close
```bash
gh issue view 42                                 # full issue + comments
gh issue view 42 --web                           # open in browser
gh issue edit 42 --add-label priority-high
gh issue close 42 --comment "Fixed in #50"
gh issue reopen 42
```

### Comment
```bash
gh issue comment 42 --body "Repro confirmed on staging"
```

## Pull requests

### Create
```bash
gh pr create --title "Add OAuth login" --body "Fixes #42"
gh pr create --fill                              # auto-fill from commits
```

### Review / merge
```bash
gh pr list
gh pr view 50
gh pr checks 50                                  # CI status
gh pr merge 50 --squash --delete-branch
```

## Auto-close issues from commits/PRs

Include any of these phrases in a commit message or PR body:

```
Fixes #42
Closes #42
Resolves #42
```

When the commit/PR merges into the default branch, GitHub automatically closes issue #42.

You can reference multiple: `Fixes #42, closes #43, resolves #44`.

## Labels worth setting up

Standard labels GitHub creates: `bug`, `documentation`, `duplicate`, `enhancement`, `good first issue`, `help wanted`, `invalid`, `question`, `wontfix`.

Common additions:
```bash
gh label create "priority-high"   --color "B60205"
gh label create "priority-medium" --color "FBCA04"
gh label create "priority-low"    --color "0E8A16"
gh label create "blocked"         --color "5319E7"
gh label create "needs-repro"     --color "D4C5F9"
```

## Common Claude prompts

- "Create a GitHub issue for this bug. Title, body with repro steps, label `bug`."
- "List open issues with label `bug`."
- "Close issue #42 with a comment summarizing the fix."
- "Open a PR for this branch. Use `Fixes #42` in the body so it auto-closes on merge."
