# Tracker integrations

Real fetch/create/comment scripts for the three trackers the skill pack supports. Any skill that needs a live ticket (`requirement-analyzer`, `test-plan-generator`, `bug-reporter`) shells out to one of these rather than re-implementing API calls — pick whichever matches the project.

| Script | Tracker | Auth | Requires |
|---|---|---|---|
| `jira.sh` | Jira Cloud | API token (basic auth) | `curl`, `jq` |
| `github.sh` | GitHub Issues | inherits your `gh` CLI session | `gh`, `jq` |
| `linear.sh` | Linear | API key (bearer) | `curl`, `jq` |

## Setup

**Jira**
```bash
export JIRA_BASE_URL="https://your-domain.atlassian.net"
export JIRA_EMAIL="you@example.com"
export JIRA_TOKEN="<API token from id.atlassian.com/manage-profile/security/api-tokens>"
./jira.sh fetch PROJ-123
```

**GitHub Issues**
```bash
gh auth login   # one-time, if not already authenticated
./github.sh fetch owner/repo 123
```

**Linear**
```bash
export LINEAR_API_KEY="<personal API key from Linear Settings > API>"
./linear.sh fetch ENG-123
```

## Contract

Every script exposes at least a `fetch` subcommand that prints a curated JSON object (title/summary, description, status, labels, priority, links) to stdout — that's what skills parse for context. `bug-reporter` also uses `create`/`comment` where the tracker supports it. No script logs or persists credentials; they're read from environment variables only, per call.
