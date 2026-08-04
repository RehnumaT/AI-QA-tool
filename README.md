# AI QA Tool (QA Studio)

A gamified QA workspace for testers and developers, built with React + Vite. It brings together the day-to-day documents a QA engineer produces — test plans, bug reports, runbooks, release notes — with lightweight "AI copilot" assistants and a light game layer to make the work more engaging.

## Features

- **AI Test Case Copilot** — describe a feature in plain language and get suggested test cases, drawing on a keyword-matched library of domain scenarios (auth, payments, search, uploads, permissions, etc.) plus general edge cases (empty input, concurrency, offline, accessibility). Pick the ones you want and drop them straight into a test plan.
- **AI Bug Report Assistant** — a live completeness meter flags missing fields (repro steps, expected/actual, environment) and suggests severity/priority from the bug description, with one click to apply the suggestion or copy a polished report for developers.
- **Explore Sessions** — session-based exploratory testing framed as short missions: set a charter and time-box, run a live timer, and log tagged notes (bug / idea / question / pass) as you go. Bug-tagged notes convert into a full bug report in one click.
- **Dashboard & release risk** — an overview of all documents with a computed release-risk score based on open Critical/High bugs and stale, unapproved test plans, plus a bug severity breakdown.
- **Light gamification** — XP and levels for QA actions (creating docs, approving/shipping, fixing bugs, completing sessions), a daily streak counter, and toast celebrations.
- **Runbooks & Release Notes** — standard structured docs for operational procedures and release changelogs, each exportable to Markdown.

All "AI" suggestions are generated locally with deterministic heuristics — no API key or network calls required, so the app runs entirely standalone.

## Tech stack

- React 18 + Vite
- [lucide-react](https://lucide.dev/) icons
- Local persistence via `localStorage` (behind a small storage abstraction)

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

To build for production:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
  theme.js            Design tokens (colors, fonts, gradients)
  lib/
    ai.js              Local heuristics for test-case generation & bug analysis
    docs.js            Document type metadata and default document shapes
    gamification.js    XP/level/streak logic
    storage.js         Persistence helpers
    utils.js            Formatting, markdown export, misc helpers
  components/          Shared UI primitives (buttons, fields, cards, toasts, etc.)
  views/
    DashboardView.jsx   Home/overview with release risk
    RecordsView.jsx      Shared list + detail shell for each document type
    editors/             Per-document-type editors (test plan, bug, runbook, release, session)
  App.jsx              App shell: navigation, routing, XP/toast plumbing
  main.jsx             Entry point
```
