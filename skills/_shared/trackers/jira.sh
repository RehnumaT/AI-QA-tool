#!/usr/bin/env bash
# Jira REST API integration for the STLC skill pack.
#
# Usage:
#   ./jira.sh fetch ISSUE-123
#   ./jira.sh comment ISSUE-123 "test plan drafted, see link"
#
# Required env vars: JIRA_BASE_URL, JIRA_EMAIL, JIRA_TOKEN
# Required tools: curl, jq

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
source ./common.sh

require_cmd curl jq
require_env JIRA_BASE_URL JIRA_EMAIL JIRA_TOKEN

auth=("-u" "${JIRA_EMAIL}:${JIRA_TOKEN}")

fetch() {
  local key="$1"
  http_json GET \
    "${JIRA_BASE_URL}/rest/api/3/issue/${key}?fields=summary,issuetype,priority,components,labels,fixVersions,description,status,attachment,issuelinks" \
    "${auth[@]}" -H "Accept: application/json" \
  | jq '{
      key: .key,
      summary: .fields.summary,
      type: .fields.issuetype.name,
      priority: (.fields.priority.name // null),
      components: [.fields.components[]?.name],
      labels: .fields.labels,
      fixVersions: [.fields.fixVersions[]?.name],
      status: .fields.status.name,
      description: (.fields.description // null),
      links: [.fields.issuelinks[]? | {type: .type.name, key: (.outwardIssue.key // .inwardIssue.key)}],
      attachments: [.fields.attachment[]? | {filename: .filename, url: .content}]
    }'
}

comment() {
  local key="$1" body="$2"
  local payload
  payload="$(jq -n --arg body "$body" '{body: {type:"doc", version:1, content:[{type:"paragraph", content:[{type:"text", text:$body}]}]}}')"
  http_json POST "${JIRA_BASE_URL}/rest/api/3/issue/${key}/comment" \
    "${auth[@]}" -H "Content-Type: application/json" -d "$payload" | print_json
}

case "${1:-}" in
  fetch)   fetch "${2:?usage: jira.sh fetch ISSUE-KEY}" | print_json ;;
  comment) comment "${2:?usage: jira.sh comment ISSUE-KEY \"text\"}" "${3:?comment text required}" ;;
  *) echo "usage: jira.sh {fetch|comment} ISSUE-KEY [comment text]" >&2; exit 1 ;;
esac
