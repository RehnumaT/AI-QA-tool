---
mode: agent
description: "Produce valid, invalid, boundary, and synthetic data sets per field for a test case or scenario, backed by a real generator script rather than inline invented values. Use when a test case needs concrete data or a tester asks \"generate test data for <field/form>\"."
---

# test-data-generator

## When this fires

- "Generate test data for the signup form" (email, password fields)
- Called by `test-case-writer` whenever a case needs concrete values instead of "a valid email"
- "What boundary values should I use for the `age` field, 18–120?"

## Workflow

1. **Identify fields and types** from the scenario/case (email, password, free-text string, bounded integer, etc.) or from an explicit `min`/`max` spec.
2. **Run the generator**, don't hand-write values inline:
   ```bash
   python3 scripts/generate_test_data.py --field email --field password --count 5
   # or, for typed/bounded fields:
   echo '{"fields":[{"name":"age","type":"integer","min":18,"max":120}]}' > /tmp/fields.json
   python3 scripts/generate_test_data.py --spec /tmp/fields.json
   ```
3. **Return all four buckets** per field — `valid`, `invalid`, `boundary`, `synthetic` — so the case author picks what's relevant rather than the skill guessing which ones matter.
4. **Never reuse real user data.** Synthetic values are generated deterministically (fixed seed) so the same spec always reproduces the same data set — reruns are diffable, not random noise.

## Output contract

Raw JSON from the script, one key per field:

```json
{
  "email": {
    "valid": ["user@example.com", "first.last+tag@sub.example.co.uk"],
    "invalid": ["not-an-email", "missing-domain@"],
    "boundary": ["a@b.co", "..."],
    "synthetic": ["qa+ab12cd34@example.com"]
  }
}
```

## Guardrails

| Rule | Why |
|---|---|
| Always run the script; never invent values by hand in the response | Keeps output reproducible and free of accidentally-real-looking PII |
| Never generate data that resembles real PII (real-looking names, SSNs, card numbers) | Synthetic data must be obviously synthetic |
| Boundary values are derived from the field's actual stated min/max, not guessed | A wrong boundary value tests nothing |
