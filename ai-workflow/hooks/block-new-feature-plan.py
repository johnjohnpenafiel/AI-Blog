#!/usr/bin/env python3
"""
PreToolUse hook: block creation of a new feature plan when too many are already in-progress.

Triggered on Write tool calls. Allows the write unless:
  - The target path is `feature-plans/<name>.md` (not `_abandoned-*.md`)
  - The file does NOT yet exist (i.e. this is a creation, not an overwrite)
  - The number of existing plans with frontmatter `status: in-progress` is >= LIMIT

When blocked, exits with code 2 and writes a message to stderr (Claude sees this
as tool feedback and self-corrects).

Configure in `.claude/settings.json`:

  {
    "hooks": {
      "PreToolUse": [
        {
          "matcher": "Write",
          "hooks": [
            {
              "type": "command",
              "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/block-new-feature-plan.py"
            }
          ]
        }
      ]
    }
  }
"""

import json
import sys
from pathlib import Path

LIMIT = 2


def is_in_progress(plan_path: Path) -> bool:
    """Return True if the plan's YAML frontmatter has `status: in-progress`."""
    try:
        with plan_path.open("r", encoding="utf-8", errors="ignore") as fh:
            head = [next(fh, "") for _ in range(20)]
    except OSError:
        return False
    in_frontmatter = False
    for line in head:
        stripped = line.strip()
        if stripped == "---":
            if in_frontmatter:
                return False  # closed frontmatter without finding status
            in_frontmatter = True
            continue
        if in_frontmatter and stripped.startswith("status:"):
            value = stripped.split(":", 1)[1].strip().strip('"').strip("'")
            return value == "in-progress"
    # No frontmatter found — treat as in-progress by default (safer)
    # but only if the file actually has tasks (avoid false positives on empty files)
    return False


def main() -> None:
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)  # malformed input, don't block

    if data.get("tool_name") != "Write":
        sys.exit(0)

    file_path = data.get("tool_input", {}).get("file_path", "")
    if not file_path:
        sys.exit(0)

    target = Path(file_path)

    # Only act on feature-plans/*.md
    if target.parent.name != "feature-plans" or target.suffix != ".md":
        sys.exit(0)

    # Skip abandoned-archive files
    if target.name.startswith("_abandoned-"):
        sys.exit(0)

    # Only block creation of NEW files
    if target.exists():
        sys.exit(0)

    plans_dir = target.parent
    if not plans_dir.exists():
        sys.exit(0)

    open_plans = []
    for plan in sorted(plans_dir.glob("*.md")):
        if plan.name.startswith("_abandoned-"):
            continue
        if is_in_progress(plan):
            open_plans.append(plan)

    if len(open_plans) >= LIMIT:
        lines = [
            f"BLOCKED: Cannot create new feature plan ({target.name}).",
            "",
            f"Already {len(open_plans)} plans are in-progress (limit: {LIMIT}):",
        ]
        for plan in open_plans:
            lines.append(f"  - {plan}")
        lines += [
            "",
            "Resolve one of the open plans first by:",
            "  - Completing it (run /complete-feature)",
            "  - Pausing it (set `status: paused` in the file's frontmatter)",
            "  - Marking it blocked (set `status: blocked`)",
            "  - Abandoning it (set `status: abandoned` and rename to _abandoned-<name>.md)",
        ]
        print("\n".join(lines), file=sys.stderr)
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    main()
