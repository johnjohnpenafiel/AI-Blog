# AI Workflow Toolkit

A reusable set of templates, hooks, slash commands, and notes for working with Claude Code productively across projects. Pull from here when starting a new project or upgrading an existing one.

## What's here

```
ai-workflow/
├── templates/          Drop-in document templates
│   ├── CLAUDE.template.md         Slim, doc-aligned CLAUDE.md
│   ├── PLANNING.template.md       Long-form architecture / decisions doc
│   └── feature-plan.template.md   Per-feature checklist file
│
├── hooks/              Deterministic guardrails
│   ├── block-new-feature-plan.py  Enforces max 2 in-progress feature plans
│   └── settings.snippet.json      Drop into .claude/settings.json
│
├── commands/           Slash commands for the Feature Plan Workflow
│   ├── start-feature.md           /start-feature <name>
│   └── complete-feature.md        /complete-feature <name>
│
└── docs/               Reference notes
    ├── WORKFLOW.md                End-to-end lifecycle
    ├── TEMPLATE-NOTES.md          What each opt-in file is for
    └── gh-cheatsheet.md           Common gh commands
```

## Quick start for a new project

1. **CLAUDE.md** — copy `templates/CLAUDE.template.md` to `<project>/CLAUDE.md`. Fill in placeholders. Delete companion blocks you don't need.

2. **PLANNING.md** *(optional but recommended)* — copy `templates/PLANNING.template.md` to `<project>/PLANNING.md`. Fill it in.

3. **Feature Plan Workflow** *(optional)*:
   ```bash
   cd <project>
   mkdir -p .claude/commands .claude/hooks feature-plans

   # Slash commands
   cp ~/Development/ai-workflow/commands/*.md .claude/commands/

   # Hook
   cp ~/Development/ai-workflow/hooks/block-new-feature-plan.py .claude/hooks/
   chmod +x .claude/hooks/block-new-feature-plan.py

   # Merge hooks/settings.snippet.json into .claude/settings.json
   ```
   Run `/hooks` in Claude Code to confirm the hook loaded.

4. **GitHub Issues** *(optional)* — install `gh` if you haven't: `brew install gh && gh auth login`. See `docs/gh-cheatsheet.md`.

## Design principles

This toolkit follows Anthropic's [Claude Code best practices](https://code.claude.com/docs/en/best-practices). Two ideas drive everything:

1. **CLAUDE.md is short and high-signal.** For each line, ask *"would removing this cause Claude to make mistakes?"* If not, cut it.
2. **Hooks for guarantees, CLAUDE.md for guidance.** Anything that *must* happen — even when Claude drifts — belongs in a hook.

## When to update this toolkit

- You discover a workflow that works well across multiple projects → add it here.
- You hit a recurring failure mode in CLAUDE.md → write a hook for it.
- A template field is confusing → fix it once, here, and benefit every future project.

## See also

- `docs/WORKFLOW.md` — full lifecycle of a feature
- `docs/TEMPLATE-NOTES.md` — what each opt-in piece is for
- `docs/gh-cheatsheet.md` — GitHub CLI reference
