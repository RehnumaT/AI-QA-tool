#!/usr/bin/env python3
"""Generate per-agent adapter files from a single SKILL.md.

The reference skill-pack format (SKILL.md with YAML frontmatter + markdown
body) is Claude Code / Cline's native format already — nothing to generate
there. This script mechanically derives the formats other agent tools expect
from that same SKILL.md, so multi-agent support doesn't mean hand-maintaining
N near-duplicate copies of every skill.

Usage:
    generate_adapter.py path/to/SKILL.md [--out-dir DIR] [--agents copilot,cursor,windsurf]

Writes, next to the SKILL.md by default (or under --out-dir):
    agents/copilot.prompt.md   GitHub Copilot custom prompt file
    agents/cursor.mdc          Cursor project rule (MDC format)
    agents/windsurf.md         Windsurf workflow/rule file
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n(.*)$", re.DOTALL)


def parse_skill_md(text: str) -> tuple[dict[str, str], str]:
    match = FRONTMATTER_RE.match(text)
    if not match:
        raise ValueError("SKILL.md is missing YAML frontmatter (--- ... ---)")
    raw_frontmatter, body = match.groups()
    meta: dict[str, str] = {}
    current_key = None
    for line in raw_frontmatter.splitlines():
        if not line.strip():
            continue
        if line.startswith(" ") or line.startswith("\t"):
            if current_key:
                meta[current_key] += " " + line.strip()
            continue
        if ":" in line:
            key, _, value = line.partition(":")
            current_key = key.strip()
            meta[current_key] = value.strip().lstrip(">-").strip()
    meta = {k: v.strip() for k, v in meta.items()}
    return meta, body.strip()


def yaml_dq(value: str) -> str:
    """Escape a string for embedding in a YAML double-quoted scalar."""
    return value.replace("\\", "\\\\").replace('"', '\\"')


def render_copilot(meta: dict[str, str], body: str) -> str:
    name = meta.get("name", "skill")
    description = yaml_dq(meta.get("description", ""))
    return (
        f"---\n"
        f"mode: agent\n"
        f"description: \"{description}\"\n"
        f"---\n\n"
        f"# {name}\n\n"
        f"{body}\n"
    )


def render_cursor(meta: dict[str, str], body: str) -> str:
    name = meta.get("name", "skill")
    description = yaml_dq(meta.get("description", ""))
    return (
        f"---\n"
        f"description: \"{description}\"\n"
        f"alwaysApply: false\n"
        f"---\n\n"
        f"# {name}\n\n"
        f"{body}\n"
    )


def render_windsurf(meta: dict[str, str], body: str) -> str:
    name = meta.get("name", "skill")
    description = yaml_dq(meta.get("description", ""))
    return (
        f"---\n"
        f"description: \"{description}\"\n"
        f"---\n\n"
        f"# {name}\n\n"
        f"{body}\n"
    )


RENDERERS = {
    "copilot": ("copilot.prompt.md", render_copilot),
    "cursor": ("cursor.mdc", render_cursor),
    "windsurf": ("windsurf.md", render_windsurf),
}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("skill_md", type=Path, help="Path to a SKILL.md file")
    parser.add_argument("--out-dir", type=Path, default=None, help="Output dir (default: <skill dir>/agents)")
    parser.add_argument("--agents", default="copilot,cursor,windsurf", help="Comma-separated agent list")
    args = parser.parse_args()

    if not args.skill_md.is_file():
        print(f"error: {args.skill_md} not found", file=sys.stderr)
        return 1

    meta, body = parse_skill_md(args.skill_md.read_text())
    out_dir = args.out_dir or (args.skill_md.parent / "agents")
    out_dir.mkdir(parents=True, exist_ok=True)

    requested = [a.strip() for a in args.agents.split(",") if a.strip()]
    for agent in requested:
        if agent not in RENDERERS:
            print(f"warning: unknown agent '{agent}', skipping (known: {', '.join(RENDERERS)})", file=sys.stderr)
            continue
        filename, renderer = RENDERERS[agent]
        out_path = out_dir / filename
        out_path.write_text(renderer(meta, body))
        print(f"wrote {out_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
