---
name: test-closure-reporter
description: >-
  Roll up a test cycle's metrics (coverage, pass rate, open defects,
  regression selection) into a closure report with an advisory go/no-go.
  Use when a tester or lead asks "are we ready to ship" or "write the test
  closure report for this release".
license: MIT
metadata:
  author: Rehnuma Tarannum
  pack: stlc-skill-pack
  phase: "07-test-closure"
---

## When this fires

- "Write the closure report for the 2026-08-16 release"
- "Are we ready to ship?"
- End of a test cycle, after `test-coverage-analyzer` and `test-execution-tracker` have data.

## Workflow

1. **Pull the inputs**, don't re-derive them:
   - Coverage % and gap list from `test-coverage-analyzer`
   - Pass rate and failed-case list from `test-execution-tracker --summary`
   - Open defect list and severities from the tracker (`bug-triage-assistant`'s last output, or a fresh fetch)
2. **Check exit criteria** against the test plan's stated Entry/Exit Criteria section (from `test-plan-generator`) — don't invent a new bar at closure time.
3. **Compute the advisory verdict**:
   - `Go` — all P0 scenarios passed, no open Critical/High defects, coverage ≥ the plan's stated threshold (default 90% if none was stated)
   - `Go with caveats` — exit criteria met but with named, accepted exceptions
   - `No-go` — any exit criterion unmet
4. **The verdict is advisory only.** State that explicitly — release sign-off is a human/team decision, this skill informs it.

## Output contract

```markdown
## Test Closure Report — Release 2026-08-16

**Coverage:** 92% (11/12 ACs) — AC-9 (bulk export) untested, waived by PM
**Pass rate:** 96% (23/24 executed)
**Open defects:** 1 Medium (BUG-140, non-blocking per triage)
**Regression:** 9/42 cases selected and run (see regression-suite-selector), all passed

### Verdict: Go with caveats
- AC-9 gap is a stated, PM-accepted exception, not a silent miss
- BUG-140 is Medium and non-blocking per bug-triage-assistant

*This is an advisory recommendation. Release sign-off remains a human decision.*
```

## Guardrails

| Rule | Why |
|---|---|
| Verdict is always labeled advisory, never a final release decision | Same human-sign-off discipline as every gate earlier in the pack |
| No-go on any unmet P0/Critical criterion, no exceptions | The one place in the pack where a rule isn't softened by context |
| Every accepted exception must be named with who accepted it | An unattributed "waived" is indistinguishable from a silently skipped gap |
