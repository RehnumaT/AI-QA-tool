// Lightweight, fully local "AI assistant" heuristics — no network calls.
// Keyword-driven suggestions styled as an AI copilot for QA workflows.

import { uid } from "./utils.js";

const DOMAINS = [
  {
    key: "auth",
    match: /\b(login|log in|sign in|signin|auth|password|session|logout)\b/i,
    label: "Authentication",
    cases: [
      { description: "Reject login with incorrect password", steps: "Enter valid username with an incorrect password, submit", expected: "Login is rejected with a generic error; no indication of which field was wrong", priority: "P1" },
      { description: "Lock out after repeated failed attempts", steps: "Attempt login with wrong password 5+ times", expected: "Account is rate-limited or temporarily locked; user is informed", priority: "P0" },
      { description: "Session expires after inactivity", steps: "Log in, remain idle past the session timeout, then perform an action", expected: "User is redirected to login; in-flight action is not silently lost", priority: "P1" },
      { description: "Logout invalidates the session everywhere", steps: "Log in on two tabs/devices, log out on one", expected: "Other session is also invalidated or prompted to re-authenticate", priority: "P1" },
    ],
  },
  {
    key: "payment",
    match: /\b(payment|checkout|billing|invoice|subscription|credit card|refund|price)\b/i,
    label: "Payments",
    cases: [
      { description: "Decline path shows a clear, non-scary error", steps: "Submit checkout with a card the processor will decline", expected: "User sees a clear error and can retry without losing their cart", priority: "P0" },
      { description: "Double-submit does not double-charge", steps: "Click 'Pay' twice quickly, or click then refresh", expected: "Only one charge is created; second attempt is blocked or idempotent", priority: "P0" },
      { description: "Currency/locale rounding is correct", steps: "Check out with a locale/currency that uses different rounding rules", expected: "Displayed and charged amounts match exactly, no rounding drift", priority: "P2" },
    ],
  },
  {
    key: "search",
    match: /\b(search|filter|query|autocomplete|typeahead)\b/i,
    label: "Search & filtering",
    cases: [
      { description: "Empty search returns a sane default, not an error", steps: "Submit search with an empty query", expected: "Shows default/all results or a friendly empty state, not a crash", priority: "P2" },
      { description: "No-results state is helpful", steps: "Search for a term guaranteed to have no matches", expected: "Clear 'no results' messaging with a suggestion to broaden the query", priority: "P3" },
      { description: "Special characters don't break the query", steps: "Search using quotes, %, &, emoji, or SQL-like strings", expected: "Query is handled safely and doesn't error or expose a stack trace", priority: "P1" },
    ],
  },
  {
    key: "upload",
    match: /\b(upload|file|attachment|image|import|export|csv)\b/i,
    label: "File handling",
    cases: [
      { description: "Oversized file is rejected gracefully", steps: "Upload a file larger than the stated size limit", expected: "Clear error naming the limit; upload does not hang", priority: "P1" },
      { description: "Wrong file type is rejected", steps: "Upload a file with an unsupported extension/mime type", expected: "Rejected with a clear message before any processing starts", priority: "P2" },
      { description: "Upload survives a flaky connection", steps: "Start an upload, briefly disconnect network, reconnect", expected: "Upload retries or fails clearly rather than appearing to hang forever", priority: "P1" },
    ],
  },
  {
    key: "form",
    match: /\b(form|input|field|submit|validation|sign up|signup|register)\b/i,
    label: "Forms & validation",
    cases: [
      { description: "Required field validation is inline, not just on submit", steps: "Leave a required field empty and try to move on / submit", expected: "Field is flagged immediately or on submit with a specific message", priority: "P2" },
      { description: "Unsaved changes are protected on navigation", steps: "Fill part of the form, then navigate away or close the tab", expected: "User is warned before losing unsaved input", priority: "P2" },
      { description: "Leading/trailing whitespace is trimmed", steps: "Enter values with leading/trailing spaces in text fields", expected: "Values are trimmed before validation and save", priority: "P3" },
    ],
  },
  {
    key: "list",
    match: /\b(list|table|pagination|sort|page|grid)\b/i,
    label: "Lists & pagination",
    cases: [
      { description: "Sorting is stable across pagination", steps: "Sort by a column, then page forward and back", expected: "Sort order is preserved across pages", priority: "P2" },
      { description: "Last-page edge case renders correctly", steps: "Navigate to the final page when it has fewer items than a full page", expected: "Partial page renders without layout breakage or off-by-one errors", priority: "P3" },
    ],
  },
  {
    key: "delete",
    match: /\b(delete|remove|archive|trash)\b/i,
    label: "Destructive actions",
    cases: [
      { description: "Deletion requires confirmation", steps: "Trigger delete on an item", expected: "A confirmation step exists before the item is permanently removed", priority: "P1" },
      { description: "Deleting a referenced item is handled safely", steps: "Delete an item that other records depend on/reference", expected: "Either blocked with a clear reason, or dependents are handled gracefully (not orphaned/crashed)", priority: "P1" },
    ],
  },
  {
    key: "notify",
    match: /\b(notification|email|alert|reminder|push)\b/i,
    label: "Notifications",
    cases: [
      { description: "Opt-out is respected", steps: "Disable a notification type, then trigger the event that would send it", expected: "Notification is not sent/shown after opting out", priority: "P1" },
      { description: "Duplicate events don't cause duplicate notifications", steps: "Trigger the same event twice in quick succession", expected: "Only one notification is generated, or duplicates are suppressed", priority: "P2" },
    ],
  },
  {
    key: "api",
    match: /\b(api|integration|webhook|endpoint|third[- ]party|sync)\b/i,
    label: "API & integrations",
    cases: [
      { description: "Upstream timeout is handled without hanging the UI", steps: "Simulate a slow/unresponsive upstream dependency", expected: "Request times out with a clear error rather than an infinite spinner", priority: "P1" },
      { description: "Retries are idempotent", steps: "Force a retry of a write operation (e.g. via network blip)", expected: "Retried request does not create duplicate records/side effects", priority: "P0" },
    ],
  },
  {
    key: "permission",
    match: /\b(permission|role|admin|access control|rbac)\b/i,
    label: "Permissions",
    cases: [
      { description: "Unauthorized user cannot access via direct URL", steps: "As a lower-privilege user, navigate directly to a restricted URL", expected: "Blocked with 403/redirect, not by hiding the link alone", priority: "P0" },
      { description: "Role change takes effect without requiring logout", steps: "Change a user's role/permissions while they are logged in", expected: "New permissions apply on next action or a reasonable refresh, not stuck on stale role", priority: "P2" },
    ],
  },
];

const GENERIC_EDGE_CASES = [
  { description: "Empty / null input is handled", steps: "Submit the feature's primary action with empty or null input where possible", expected: "Handled gracefully with a clear message, no crash", priority: "P2" },
  { description: "Maximum-length input is accepted or clearly rejected", steps: "Enter input at and just beyond the documented max length", expected: "Either accepted correctly or rejected with a specific limit message", priority: "P3" },
  { description: "Unicode and special characters render correctly", steps: "Enter emoji, RTL text, and special characters into relevant fields", expected: "Displayed and stored correctly without mangling or errors", priority: "P3" },
  { description: "Rapid double-submission is handled", steps: "Trigger the primary action twice in quick succession (double-click / double-tap)", expected: "No duplicate records or duplicate side effects", priority: "P1" },
  { description: "Behavior on slow network / high latency", steps: "Throttle network to a slow 3G-equivalent profile and repeat the flow", expected: "Loading state is visible; no premature timeout or broken UI", priority: "P2" },
  { description: "Behavior fully offline", steps: "Disable network entirely and attempt the flow", expected: "Clear offline messaging; no silent data loss", priority: "P2" },
  { description: "Browser back button after the action", steps: "Complete the action, then press the browser back button", expected: "State remains consistent; action is not silently repeated", priority: "P3" },
  { description: "Refresh mid-flow", steps: "Refresh the page partway through a multi-step flow", expected: "Either resumes sensibly or restarts cleanly, no corrupted partial state", priority: "P2" },
  { description: "Keyboard-only navigation works end to end", steps: "Complete the flow using only Tab/Enter/Space, no mouse", expected: "All interactive elements are reachable and usable via keyboard", priority: "P2" },
  { description: "Concurrent edits from two sessions", steps: "Open the same record in two sessions and edit both", expected: "Conflicts are surfaced or last-write-wins predictably; no silent data loss", priority: "P1" },
];

export function generateTestCases(description) {
  const text = (description || "").toLowerCase();
  const matched = DOMAINS.filter((d) => d.match.test(text)).slice(0, 3);
  const domainCases = matched.flatMap((d) => d.cases.map((c) => ({ ...c, source: d.label })));
  const genericPick = GENERIC_EDGE_CASES.slice(0, matched.length ? 5 : 8).map((c) => ({ ...c, source: "Edge case" }));
  const all = [...domainCases, ...genericPick].slice(0, 12);
  return {
    matchedDomains: matched.map((d) => d.label),
    cases: all.map((c) => ({ id: uid(), description: c.description, steps: c.steps, expected: c.expected, priority: c.priority, source: c.source })),
  };
}

const SEVERITY_SIGNALS = [
  { level: "Critical", priority: "P0", match: /\b(crash|data loss|corrupt|security|exploit|breach|cannot log ?in|can'?t log ?in|payment fails|charged twice|unable to (checkout|pay))\b/i },
  { level: "High", priority: "P1", match: /\b(broken|error|fails|failing|blocked|regression|incorrect data|500|exception|stack trace)\b/i },
  { level: "Low", priority: "P3", match: /\b(typo|cosmetic|spacing|alignment|color|wording|minor|nit)\b/i },
];

export function analyzeBug(doc) {
  const requiredFields = [
    { key: "title", label: "Title" },
    { key: "stepsToReproduce", label: "Steps to reproduce" },
    { key: "expectedResult", label: "Expected result" },
    { key: "actualResult", label: "Actual result" },
    { key: "environment", label: "Environment" },
  ];
  const missing = requiredFields.filter((f) => !String(doc[f.key] || "").trim());
  const completeness = Math.round(((requiredFields.length - missing.length) / requiredFields.length) * 100);

  const text = `${doc.title || ""} ${doc.actualResult || ""} ${doc.stepsToReproduce || ""}`;
  const signal = SEVERITY_SIGNALS.find((s) => s.match.test(text));

  return {
    completeness,
    missingFields: missing.map((f) => f.label),
    suggestedSeverity: signal ? signal.level : "Medium",
    suggestedPriority: signal ? signal.priority : "P2",
    reasoning: signal
      ? `Detected language matching "${signal.level.toLowerCase()}" bug patterns.`
      : "No strong severity signal found in the text — defaulting to Medium/P2.",
  };
}
