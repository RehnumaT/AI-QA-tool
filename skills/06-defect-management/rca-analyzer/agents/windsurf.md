---
description: "Run a 5-Whys and fishbone root-cause analysis on a defect and propose CAPA (corrective/preventive actions). Use when a tester or lead asks for a root-cause analysis, or after a Critical/High bug is fixed and needs a postmortem-style writeup."
---

# rca-analyzer

## When this fires

- "Do an RCA on BUG-118 (double-charge on retry)"
- After any Critical-severity bug is resolved — recommended, not automatic
- "Why did this slip past testing?"

## Workflow

1. **State the problem precisely** — one sentence, observable and specific ("Retrying a failed payment created a duplicate charge"), not "payments are broken".
2. **Run 5-Whys**, one why per line, stopping when the answer becomes a process/design gap rather than another symptom (usually 3-6 whys, not forced to exactly 5).
3. **Build a fishbone across four categories** relevant to software defects: **Process** (was there a code review gap, missing test), **People** (knowledge gap, unclear ownership), **Tools/Systems** (missing idempotency check, no monitoring), **Requirements** (ambiguous or missing AC — cross-reference `requirement-analyzer`'s checklist if this bug traces to a requirement gap).
4. **Propose CAPA**: Corrective (fix the immediate cause) and Preventive (stop the category of bug from recurring — e.g. "add idempotency-key test to the regression suite" rather than only "fixed this one endpoint").
5. **Name the test gap explicitly** — which STLC phase should have caught this (missing scenario in `test-scenario-designer`? missing regression coverage? requirement gap?) so the pack improves itself over time.

## Output contract

`template/rca-template.md`, sections: Problem Statement → 5 Whys → Fishbone (Process/People/Tools/Requirements) → Corrective Actions → Preventive Actions → Test Gap.

## Guardrails

| Rule | Why |
|---|---|
| Stop the 5-Whys at a real process/design gap, not an arbitrary 5th line | Forcing exactly 5 produces filler, not insight |
| Preventive actions must be systemic (suite/checklist/process change), not just "fixed the code" | A corrective-only RCA doesn't prevent the next instance |
| Always name which STLC phase should have caught it | Turns each RCA into feedback that improves the earlier-phase skills |
| Never assign individual blame in People category | Root-cause, not blame — focus on process/knowledge gaps |
