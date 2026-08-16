---
name: requirement-analyzer
description: >-
  Score a requirement/ticket against a readiness checklist and surface gaps
  before any test artifact is drafted. Use when a tester or PM asks "is this
  ticket ready for testing", "what's missing from this requirement", or
  before running test-plan-generator on an underspecified ticket.
license: MIT
metadata:
  author: Rehnuma Tarannum
  pack: stlc-skill-pack
  phase: "01-requirement-analysis"
---

## When this fires

- "Is VWO-49 ready for QA?"
- "What's missing from this requirement before I write test cases?"
- Automatically, as a pre-check inside `test-plan-generator` if no prior analysis exists.

## Workflow

1. **Get the requirement.** Fetch via a tracker script (`../../_shared/trackers/jira.sh fetch KEY`, `github.sh fetch owner/repo N`, or `linear.sh fetch ID`), or accept pasted text directly if no tracker is configured.
2. **Score against the checklist.** Walk all five dimensions in `../../_shared/requirement-checklist.md` (functional, data & environment, non-functional, cross-cutting, clarity). Mark each item ✅ / ⚠️ / ❌.
3. **Compute a readiness score.** `checked / total` items, reported as a percentage, plus a category breakdown so the weakest dimension is obvious at a glance.
4. **List open questions.** One line per ❌ item, phrased as a question for the requirement's author — not a filled-in assumption.
5. **Recommend next step.** ≥80% ready → "ready for test planning". 50–79% → "usable, but flag the gaps to the author first". <50% → "send back before testing starts".

## Output contract

```markdown
## Requirement Readiness: <KEY> — <title>

**Score: 72% (18/25)**

| Category | Score | Weakest item |
|---|---|---|
| Functional | 5/6 | Boundary states not stated |
| Data & environment | 2/4 | No test data named |
| Non-functional | 3/5 | Accessibility unaddressed |
| Cross-cutting | 4/4 | — |
| Clarity | 4/6 | "handle appropriately" is ambiguous |

### Open questions for the author
- What should happen when the uploaded file exceeds the size limit?
- Is this feature gated behind a flag, and if so which one?

### Recommendation
Usable for planning, but the two open questions above should be resolved before test cases are written.
```

## Guardrails

| Rule | Why |
|---|---|
| Never fill in a ❌ item with a guess | A missing AC is a finding to hand back, not something to invent |
| Always cite the checklist category, not just "looks incomplete" | Makes the gap actionable for the author |
| Don't block on non-functional items for a purely internal/admin-only change | Avoid false-negative friction; note it as N/A instead of ❌ |
