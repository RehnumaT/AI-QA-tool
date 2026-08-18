---
mode: agent
description: "Build a requirements-to-tests traceability matrix and surface untested areas. Use when a tester or lead asks \"what's our coverage on this feature/release\" or \"are we missing tests for any AC\"."
---

# test-coverage-analyzer

## When this fires

- "What's our test coverage for this release?"
- "Are there any ACs with no test case?"
- Before `test-closure-reporter` runs, as its input.

## Workflow

1. **Collect the AC list** (from the approved test plan) and the **case list** (from `test-case-writer`'s output, each already tagged `Traces to: AC-N`).
2. **Build the matrix**: one row per AC, listing every case that traces to it, and its last known result (from `test-execution-tracker`'s log if a run ID is given).
3. **Flag gaps explicitly**:
   - `Untested` — AC has zero cases
   - `Under-tested` — AC has only a happy-path case, no negative/boundary case from `test-scenario-designer`'s four lenses
   - `Stale` — AC has cases, but none executed in the current run
4. **Compute a coverage %**: `ACs with ≥1 executed case / total ACs`. Report separately from pass rate — coverage and pass rate answer different questions and get conflated too often.

## Output contract

```markdown
## Coverage — PROJ-49 (password reset)

| AC | Cases | Lenses covered | Last result | Status |
|---|---|---|---|---|
| AC-1 (happy path reset) | TC-010, TC-011 | Positive, Boundary | Pass | OK |
| AC-2 (expired link) | TC-014 | Negative | Pass | OK |
| AC-3 (rate limiting) | — | — | — | **Untested** |

**Coverage: 67% (2/3 ACs have an executed case)**
**Gaps:** AC-3 has no test case at all — flag before closure.
```

## Guardrails

| Rule | Why |
|---|---|
| Coverage % and pass rate are reported separately, never combined into one number | A 100%-covered, 40%-passing suite and a 40%-covered, 100%-passing suite mean very different things |
| "Untested" beats a false sense of completeness from case count alone | An AC can have cases that were all skipped — case existence isn't coverage |
| Under-tested (single-lens) ACs are called out, not just missing ones | A happy-path-only AC still has a real gap |
