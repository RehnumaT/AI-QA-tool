---
name: regression-suite-selector
description: >-
  Given a change description (diff summary, PR description, or affected
  files), select a risk-ranked subset of the regression suite instead of
  re-running everything. Use when a tester asks "what regression tests do I
  need for this PR" or "can I skip the full suite for this change".
license: MIT
metadata:
  author: Rehnuma Tarannum
  pack: stlc-skill-pack
  phase: "05-test-execution"
---

## When this fires

- "What regression tests should I run for this PR?"
- "Can I skip the full suite for a copy-only change?"
- Before merging, as a lighter alternative to full re-execution.

## Workflow

1. **Classify the change.** Read the diff summary / PR description / changed file list. Bucket by surface: UI-only, business logic, data model/migration, API contract, config/flag, infra/build.
2. **Map surface to suite areas.** Maintain (or ask for) a mapping of feature areas → regression test IDs; if none exists, fall back to keyword matching against test case titles/tags (same style as the app's own `generateTestCases` domain matcher — auth, payment, search, upload, form, list, delete, notify, api, permission).
3. **Rank selected cases** `Must run` (directly touches the changed code path) / `Should run` (shares a dependency or data model) / `Skip` (unrelated surface) — with a one-line reason per case, not just a bucket label.
4. **Never recommend skipping P0 cases** for a change that touches auth, payments, permissions, or data migrations, regardless of how small the diff looks.

## Output contract

```markdown
## Regression selection — PR #482 ("add CSV export size limit")

| Test case | Bucket | Reason |
|---|---|---|
| TC-014 (expired reset link) | Skip | No overlap — unrelated feature area |
| TC-031 (export respects role permissions) | Must run | Same export code path, permissions untouched but shared |
| TC-040 (large file upload rejected) | Must run | Directly exercises the changed size-limit logic |

**Estimated suite reduction:** 42 → 9 cases (79%)
```

## Guardrails

| Rule | Why |
|---|---|
| Auth/payment/permission/migration-touching changes always keep their P0 cases | These are the categories where a missed regression is most expensive |
| State the reason per case, not just the bucket | An unexplained "Skip" invites someone to silently override it wrong |
| When no area mapping exists, say so and use keyword matching explicitly (not silently) | Keyword matching is a fallback, not a substitute for a real traceability map |
