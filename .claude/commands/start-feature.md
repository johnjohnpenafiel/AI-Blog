---
description: Start a new feature with an interview and a feature-plan file
---

Start a new feature named: $ARGUMENTS

Follow this workflow exactly:

## 1. Preflight check
Read the `feature-plans/` directory. Count files where the YAML frontmatter has `status: in-progress`. If the count is already ≥ 2, STOP. List the open plans and ask the user to complete, pause, or abandon one before continuing. (The hook will also block this, but catching it here is friendlier.)

If `feature-plans/` doesn't exist yet, create it.

## 2. Validate the name
The argument should be kebab-case (lowercase letters, digits, and hyphens). If it isn't, propose a corrected version and confirm with the user. If `feature-plans/<name>.md` already exists, ask for a different name.

If `$ARGUMENTS` is empty, ask the user for a name before continuing.

## 3. Interview the user
Use the `AskUserQuestion` tool to gather, one question at a time:

- **Goal**: one sentence on what this delivers and why
- **Scope**: what's included
- **Out of scope**: what is explicitly NOT included (push hard on this — it's the most valuable answer)
- **Success criteria**: how we'll know it's done; concrete and testable
- **Dependencies / blockers**: anything external this needs (APIs, credentials, decisions)
- **Verification approach**: tests, manual check, screenshot diff, etc.

If an answer is vague (e.g. "make it work"), ask a follow-up. Don't proceed with mush.

## 4. Draft the task checklist
Based on the answers, propose an initial set of `- [ ]` tasks that would actually deliver the scope. Show them to the user and let them edit before continuing.

## 5. Show the full proposed file content
Render the complete file (frontmatter + all sections) and ask the user to approve it before writing. Frontmatter must be:

```yaml
---
status: in-progress
started: <today's date in YYYY-MM-DD>
---
```

File structure:
- `# Feature: <name>`
- `## Goal`
- `## Scope`
- `## Out of scope`
- `## Success criteria`
- `## Dependencies` (omit if none)
- `## Tasks` (checkboxes)
- `## Verification` (checkboxes)

## 6. Write the file
On approval, write `feature-plans/<name>.md`.

## 7. Suggest where to start
Pick the first task and ask: "Want me to start on `<task>`?"

Don't begin implementation until the user says yes — this command is for setup only.
