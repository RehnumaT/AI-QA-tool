---
mode: agent
description: "Turn approved test scenarios into step-by-step executable test cases with numbered steps, expected results per step, and traceability back to the source AC/scenario. Use when a tester says \"write test cases for these scenarios\" or \"make this scenario executable\"."
---

# test-case-writer

## When this fires

- "Write test cases for the scenarios in the reset-password test plan"
- Chained after `test-scenario-designer` produces its scenario table
- "Turn this scenario into something a tester can execute without guessing"

## Workflow

1. **Take one scenario at a time.** Don't collapse multiple scenarios into one case — one case per scenario keeps pass/fail unambiguous.
2. **Write numbered steps**, each an action a human or script can perform without interpretation ("Click 'Reset password'", not "Try resetting the password").
3. **Pair every step with its expected result** — not just one expected result at the end. A step with no observable expected result is either merged into the next step or dropped.
4. **State preconditions and test data** explicitly (account state, seeded data, required role) — pull data needs from `test-data-generator` where the scenario needs concrete values rather than "a valid email".
5. **Tag automatable cases.** If the case has no subjective/visual judgment step, mark `Automation candidate: yes` — that's the queue `automation-script-generator` (phase 05) draws from.

## Output contract

```markdown
## TC-014 — Expired reset link is rejected with a clear message
**Traces to:** AC-2 / Scenario "Negative — Expired reset link is rejected"
**Priority:** P1
**Automation candidate:** yes
**Preconditions:** User account exists; a reset link was generated >24h ago (use test-data-generator's expired-token dataset)

| # | Step | Expected result |
|---|---|---|
| 1 | Navigate to the expired reset link | Page loads, does not silently redirect to login |
| 2 | Observe the page content | Message states the link has expired, offers to request a new one |
| 3 | Click "request a new link" | New link is sent; old link remains invalid |
```

## Guardrails

| Rule | Why |
|---|---|
| One case per scenario, no collapsing | Keeps pass/fail and defect linkage unambiguous |
| Every step has an expected result | A step with nothing to check isn't verifiable |
| Never invent concrete test data inline | Delegate to `test-data-generator` so data stays consistent and reusable across cases |
