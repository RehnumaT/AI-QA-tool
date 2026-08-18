# Multi-agent adapters

Every skill is authored once, as a `SKILL.md` (YAML frontmatter + markdown workflow). That's already the native format for **Claude Code** and **Cline** — point either agent at a skill directory and it works with no conversion.

For agents with a different native format, `generate_adapter.py` derives their file from the same `SKILL.md` — the frontmatter and workflow are never hand-copied into a second source of truth.

| Agent | Native format | Generated at |
|---|---|---|
| Claude Code | `SKILL.md` | (source of truth, no generation needed) |
| Cline | `SKILL.md` | (source of truth, no generation needed) |
| GitHub Copilot | `*.prompt.md` with `mode: agent` frontmatter | `agents/copilot.prompt.md` |
| Cursor | `*.mdc` project rule | `agents/cursor.mdc` |
| Windsurf | `*.md` workflow file | `agents/windsurf.md` |

## Usage

```bash
# Generate all three adapters for one skill:
python3 generate_adapter.py ../../02-test-planning/test-plan-generator/SKILL.md

# Only specific agents:
python3 generate_adapter.py ../../06-defect-management/bug-reporter/SKILL.md --agents copilot,cursor

# Regenerate every skill in the pack (run from skills/_shared/adapters):
for f in ../../*/*/SKILL.md; do python3 generate_adapter.py "$f"; done
```

Output lands in an `agents/` folder next to the source `SKILL.md`. Re-run after editing a skill — the generated files are build artifacts, not something to hand-edit.
