---
name: test-plan-generator
description: >-
  Turn a ticket (Jira/GitHub Issues/Linear) or pasted requirement into a
  review-ready test plan. Use when a tester says "create a test plan for
  <ticket>", "plan testing for this feature", or hands over a requirement
  and asks what to test. Flagship skill of the STLC pack.
license: MIT
metadata:
  author: Rehnuma Tarannum
  pack: stlc-skill-pack
  phase: "02-test-planning"
---

## When this fires

- "Create a test plan for PROJ-49"
- "Plan testing for the CSV export feature" (pasted requirement, no ticket)
- "What should we test before this ships?"

## Workflow

1. **Fetch the ticket.** Detect the tracker from the identifier shape (`PROJ-123` → Jira, `owner/repo#123` or a bare number with a known repo → GitHub, `ENG-123` → Linear) and call the matching script in `../../_shared/trackers/`. If given pasted text instead, skip straight to step 2.
2. **Run requirement analysis.** Delegate to `requirement-analyzer` (phase 01) if it hasn't already run for this ticket. Carry its gap list forward — don't re-derive it.
3. **Draft the plan** using `template/test-plan-template.md`, filling every section. Every scenario in the plan must trace back to an AC or to a named gap; no orphan scenarios.
4. **Prioritize scenarios** P0 (breaks core flow / data loss / security) / P1 (major functionality, common path) / P2 (edge case, cosmetic, rare path).
5. **STOP for human review.** Present the draft with its assumptions and open questions called out explicitly. Ask: "Approve, or edit before I continue to test case writing?" Never mark a plan `Approved` — only a human does that (mirrors the `Draft → In Review → Approved` status flow the QA Studio app itself uses).

## Output contract

Six sections, in this order, matching `template/test-plan-template.md`:

1. **Scope & Objectives** — in scope, out of scope, testing goal
2. **Gaps & Questions for the Author** — pulled straight from requirement-analyzer's output
3. **Test Scenarios** — table: `Priority | Type | Scenario | Maps to AC/Gap`
4. **Test Data & Environment** — data needed, flags, roles/permissions
5. **Risks & Assumptions** — what was assumed, what could go wrong
6. **Entry / Exit Criteria** — gates for starting and calling testing done

## Guardrails

| Rule | Why |
|---|---|
| Never mark the plan **final/approved** | A human owns sign-off, same as the app's own `Approved` status gate |
| Never fabricate acceptance criteria | A missing AC is a finding, not a blank to fill |
| Every scenario traces to an AC or a named gap | Keeps the plan auditable instead of a generic checklist |
| Stop for human review before test-case-writer runs | Mandatory gate — don't chain straight into phase 04 |

## Handoff

Once approved, hand the scenario table to `test-case-writer` (phase 04) — each scenario becomes one or more executable test cases, still traceable to the same AC/gap.
