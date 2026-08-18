#!/usr/bin/env python3
"""Generate valid / invalid / boundary / synthetic test data sets per field.

Not a prompt description — this actually runs and produces usable values,
so `test-case-writer` and `test-data-generator` can hand a tester real data
instead of a placeholder like "a valid email".

Usage:
    generate_test_data.py --field email
    generate_test_data.py --field email --field password --count 5
    generate_test_data.py --spec fields.json   # {"fields": [{"name": "age", "type": "integer", "min": 18, "max": 120}]}
"""
from __future__ import annotations

import argparse
import json
import random
import string
import sys
from dataclasses import dataclass, field as dc_field

random.seed(1234)  # deterministic output — same input spec always yields the same data set


@dataclass
class FieldSpec:
    name: str
    type: str = "string"
    min: int | None = None
    max: int | None = None


def _rand_string(length: int, charset: str = string.ascii_letters + string.digits) -> str:
    return "".join(random.choice(charset) for _ in range(length))


def gen_email(spec: FieldSpec) -> dict:
    return {
        "valid": ["user@example.com", "first.last+tag@sub.example.co.uk"],
        "invalid": ["not-an-email", "missing-domain@", "@missing-local.com", "spaces in@example.com"],
        "boundary": ["a@b.co", f"{_rand_string(64)}@example.com"],  # min-length local part / near max-length local part (RFC 5321 caps at 64)
        "synthetic": [f"qa+{_rand_string(8).lower()}@example.com" for _ in range(3)],
    }


def gen_password(spec: FieldSpec) -> dict:
    return {
        "valid": ["Correct-Horse-Battery-9", "Tr0ub4dor&3"],
        "invalid": ["short", "alllowercase", "ALLUPPERCASE1", "NoNumbers!"],
        "boundary": ["A1!" + "a" * 5, "A1!" + "a" * 125],  # just under / near typical 8-128 char limits
        "synthetic": [_rand_string(12) + "!1Aa" for _ in range(3)],
    }


def gen_string(spec: FieldSpec) -> dict:
    lo = spec.min if spec.min is not None else 1
    hi = spec.max if spec.max is not None else 255
    return {
        "valid": [_rand_string(max(1, (lo + hi) // 2))],
        "invalid": ["", None],
        "boundary": [_rand_string(lo), _rand_string(hi), _rand_string(hi + 1)],
        "synthetic": [_rand_string(random.randint(lo, hi)) for _ in range(3)],
    }


def gen_integer(spec: FieldSpec) -> dict:
    lo = spec.min if spec.min is not None else 0
    hi = spec.max if spec.max is not None else 100
    return {
        "valid": [(lo + hi) // 2],
        "invalid": ["not-a-number", None, lo - 1, hi + 1],
        "boundary": [lo, hi, lo - 1, hi + 1],
        "synthetic": [random.randint(lo, hi) for _ in range(3)],
    }


GENERATORS = {
    "email": gen_email,
    "password": gen_password,
    "string": gen_string,
    "integer": gen_integer,
}


def generate(spec: FieldSpec, count: int) -> dict:
    generator = GENERATORS.get(spec.type, gen_string)
    result = generator(spec)
    result["synthetic"] = result["synthetic"][:count]
    return result


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--field", action="append", default=[], help="Field name; repeatable. Type inferred from name unless --spec is used.")
    parser.add_argument("--spec", help="Path to a JSON file: {\"fields\": [{\"name\":..., \"type\":..., \"min\":..., \"max\":...}]}")
    parser.add_argument("--count", type=int, default=3, help="How many synthetic values per field")
    args = parser.parse_args()

    specs: list[FieldSpec] = []
    if args.spec:
        with open(args.spec) as f:
            raw = json.load(f)
        for f_ in raw.get("fields", []):
            specs.append(FieldSpec(**f_))
    else:
        for name in args.field:
            inferred_type = "email" if "email" in name.lower() else "password" if "password" in name.lower() else "string"
            specs.append(FieldSpec(name=name, type=inferred_type))

    if not specs:
        print("error: provide at least one --field or a --spec file", file=sys.stderr)
        return 1

    output = {s.name: generate(s, args.count) for s in specs}
    print(json.dumps(output, indent=2, default=str))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
