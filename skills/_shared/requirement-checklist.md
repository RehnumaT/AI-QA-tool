# Requirement gap-analysis checklist

Shared by `requirement-analyzer` (phase 01) and `test-plan-generator` (phase 02). Five dimensions — walk all five before drafting anything; a missing item is a **finding**, not something to silently assume and fill in.

## Functional
- [ ] User story / job-to-be-done is stated, not just a feature name
- [ ] Acceptance criteria exist and are individually testable (no "works correctly")
- [ ] Happy path is explicit
- [ ] Negative paths are explicit (invalid input, denied permission, failed dependency)
- [ ] Boundary / edge states are covered (empty, max, zero, one, many)
- [ ] State transitions are defined if the entity has a lifecycle (draft → approved → shipped, etc.)

## Data & environment
- [ ] Required test data is identified (or a data-generation skill is needed)
- [ ] Feature flags / config toggles affecting behavior are named
- [ ] External dependencies and their failure modes are known
- [ ] Preconditions (account state, prior actions, seeded data) are stated

## Non-functional
- [ ] Performance expectations (latency, throughput) if relevant
- [ ] Security / role & permission implications
- [ ] Accessibility requirements (keyboard nav, screen reader, contrast)
- [ ] Internationalization / locale handling if relevant
- [ ] Audit / logging requirements if the action is sensitive

## Cross-cutting
- [ ] Regression surface — what else touches this code path
- [ ] Backward compatibility (API contracts, data migrations)
- [ ] Mobile / responsive behavior if UI-facing
- [ ] Rollback plan if the change ships behind a flag or migration

## Clarity
- [ ] No ambiguous wording ("should probably", "handle appropriately")
- [ ] Terminology is consistent with the rest of the product
- [ ] Mockups / designs are linked where the requirement is UI-facing

**Output shape when used standalone:** a table of `Category | Item | Status (✅/⚠️/❌) | Note`, followed by a short list of open questions for the requirement's author. Never silently assume an answer to a ❌ item — surface it.
