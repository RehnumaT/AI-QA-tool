#!/usr/bin/env python3
"""Append a test-case execution result to a JSON run log and roll up completion %.

A real, stateful tracker instead of a prompt describing what one would do:
each call appends to (or updates) an entry in the run log, then prints the
rollup so the agent can report live completion % without re-deriving it.

Usage:
    track_execution.py --run regression-2026-08-16 --case TC-014 --result pass
    track_execution.py --run regression-2026-08-16 --case TC-031 --result fail --note "size limit not enforced"
    track_execution.py --run regression-2026-08-16 --summary
"""
from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

VALID_RESULTS = {"pass", "fail", "blocked", "skipped"}
DEFAULT_LOG_DIR = Path(__file__).resolve().parent.parent / "runs"


def log_path(run_id: str, log_dir: Path) -> Path:
    log_dir.mkdir(parents=True, exist_ok=True)
    return log_dir / f"{run_id}.json"


def load(path: Path) -> dict:
    if path.exists():
        return json.loads(path.read_text())
    return {"run": path.stem, "cases": {}}


def record(run_id: str, case_id: str, result: str, note: str | None, log_dir: Path) -> dict:
    if result not in VALID_RESULTS:
        raise ValueError(f"result must be one of {sorted(VALID_RESULTS)}, got {result!r}")
    path = log_path(run_id, log_dir)
    data = load(path)
    data["cases"][case_id] = {
        "result": result,
        "note": note,
        "recordedAt": datetime.now(timezone.utc).isoformat(),
    }
    path.write_text(json.dumps(data, indent=2))
    return data


def summarize(run_id: str, log_dir: Path) -> dict:
    path = log_path(run_id, log_dir)
    data = load(path)
    cases = data["cases"]
    total = len(cases)
    by_result = {r: sum(1 for c in cases.values() if c["result"] == r) for r in VALID_RESULTS}
    completion_pct = round(100 * (total - by_result.get("skipped", 0)) / total, 1) if total else 0.0
    pass_rate_pct = round(100 * by_result.get("pass", 0) / total, 1) if total else 0.0
    return {
        "run": run_id,
        "total": total,
        "byResult": by_result,
        "completionPct": completion_pct,
        "passRatePct": pass_rate_pct,
        "failedCases": [cid for cid, c in cases.items() if c["result"] == "fail"],
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--run", required=True, help="Run identifier, e.g. regression-2026-08-16")
    parser.add_argument("--case", help="Test case ID, e.g. TC-014")
    parser.add_argument("--result", choices=sorted(VALID_RESULTS))
    parser.add_argument("--note", default=None)
    parser.add_argument("--summary", action="store_true", help="Print rollup instead of recording a result")
    parser.add_argument("--log-dir", type=Path, default=DEFAULT_LOG_DIR)
    args = parser.parse_args()

    if args.summary:
        print(json.dumps(summarize(args.run, args.log_dir), indent=2))
        return 0

    if not args.case or not args.result:
        print("error: --case and --result are required unless --summary is passed", file=sys.stderr)
        return 1

    record(args.run, args.case, args.result, args.note, args.log_dir)
    print(json.dumps(summarize(args.run, args.log_dir), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
