# Template Notes

What each opt-in file is, when to use it, when to skip.

## `CLAUDE.template.md` — required

The CLAUDE.md goes at your project root. Claude reads it at the start of every session, so it must be short and high-signal.

**Anthropic's own guidance**: for each line, ask *"would removing this cause Claude to make mistakes?"* If not, cut it. Bloated CLAUDE.md files cause Claude to ignore real instructions.

The template's required sections:
- **Bash commands** — things Claude can't guess (start dev server, run tests, etc.)
- **Code style** — only rules that *differ* from defaults
- **Workflow** — repo etiquette (branch names, commit conventions, never-commits)
- **Gotchas** — non-obvious things that have bitten you

The template's optional companion blocks (delete the ones you don't use):
- Architecture context (only if you have PLANNING.md)
- Feature Plan Workflow (only if you adopt that workflow)
- UI/design (only if you have a Design system)
- Skills (only if you have `.claude/skills/`)

## `PLANNING.md` — recommended for non-trivial projects

Long-form context that would otherwise bloat CLAUDE.md. CLAUDE.md `@`-imports it.

**When to use:**
- The project has more than one or two architectural decisions worth recording
- You want to onboard collaborators (human or AI) without explaining context every time
- You're using the architectural-change rule (which requires PLANNING.md to update)

**When to skip:**
- Throwaway scripts or single-file tools
- Prototypes you don't expect to maintain

**Pairs with:** the architectural-change gate in CLAUDE.md ("stop and update PLANNING.md before merging schema changes").

## `feature-plan.template.md` — for the Feature Plan Workflow

The per-feature checklist file. Created by `/start-feature`, deleted on merge.

**When to use:**
- Multi-step features that span more than one session
- You want a paper trail of what was decided as in-scope vs out-of-scope
- You want a verification checklist that survives session boundaries

**When to skip:**
- Single-prompt fixes ("rename this variable")
- Bug fixes — those go in GitHub Issues
- Spikes — don't plan something you might throw away

## `hooks/block-new-feature-plan.py` — recommended if you use feature plans

The deterministic backstop. Blocks creation of a new feature-plan file when 2 are already in-progress.

**Why it exists:** CLAUDE.md is advisory. If Claude drifts (long context, fresh session, unusual prompt), the rule alone won't catch it. The hook is the guarantee.

**When to skip:**
- You're disciplined enough to never start a new feature without finishing the old one (rare, honestly)
- Your team uses a different concurrency limit and you want to write your own version

**Cost:** ~0 tokens (runs locally, only reports back to Claude on block). Imperceptible latency.

## `commands/start-feature.md` — for the Feature Plan Workflow

Slash command. Drives the interview, drafts the plan, writes the file.

**Why it's a command, not a skill:** explicit invocation is the right UX. You always know when you're starting a feature; you don't want auto-detection.

## `commands/complete-feature.md` — for the Feature Plan Workflow

Slash command. Drives the verification, updates frontmatter, prepares cleanup.

## `docs/gh-cheatsheet.md` — recommended if you use GitHub

Common `gh` commands for working with Issues and PRs from Claude. Skip if you don't host on GitHub or use a different tracker.

## What's NOT in this toolkit (and why)

- **`TASKS.md`** — high-churn content in CLAUDE.md is an anti-pattern. Use the built-in task tool (session-scoped), feature plans (per-feature), or GitHub Issues (project-wide) instead.
- **`BUGS.md`** — duplicates a real issue tracker. Use GitHub Issues.
- **A "philosophy" doc** — Claude already knows "write clean code." Self-evident principles bloat without changing behavior.
- **Long architecture tutorials** — link to authoritative docs, don't restate them in CLAUDE.md.
