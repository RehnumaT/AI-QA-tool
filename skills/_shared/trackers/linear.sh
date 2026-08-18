#!/usr/bin/env bash
# Linear GraphQL API integration for the STLC skill pack.
#
# Usage:
#   ./linear.sh fetch ENG-123
#   ./linear.sh create "team-uuid" "Bug title" "description"
#
# Required env vars: LINEAR_API_KEY
# Required tools: curl, jq

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
source ./common.sh

require_cmd curl jq
require_env LINEAR_API_KEY

API_URL="https://api.linear.app/graphql"

gql() {
  local query="$1" variables="$2"
  local payload
  payload="$(jq -n --arg q "$query" --argjson v "$variables" '{query:$q, variables:$v}')"
  http_json POST "$API_URL" \
    -H "Authorization: ${LINEAR_API_KEY}" -H "Content-Type: application/json" -d "$payload"
}

fetch() {
  local identifier="$1"
  local query='query($id: String!) {
    issue(id: $id) {
      identifier
      title
      description
      state { name }
      priority
      labels { nodes { name } }
      assignee { name }
      url
    }
  }'
  gql "$query" "$(jq -n --arg id "$identifier" '{id: $id}')" | jq '.data.issue'
}

create() {
  local team_id="$1" title="$2" description="$3"
  local mutation='mutation($teamId: String!, $title: String!, $description: String) {
    issueCreate(input: {teamId: $teamId, title: $title, description: $description}) {
      success
      issue { identifier url }
    }
  }'
  gql "$mutation" "$(jq -n --arg t "$team_id" --arg ti "$title" --arg d "$description" '{teamId:$t, title:$ti, description:$d}')" \
    | jq '.data.issueCreate'
}

case "${1:-}" in
  fetch)  fetch "${2:?usage: linear.sh fetch IDENTIFIER}" | print_json ;;
  create) create "${2:?usage: linear.sh create TEAM_ID title description}" "${3:?title required}" "${4:?description required}" | print_json ;;
  *) echo "usage: linear.sh {fetch|create} ..." >&2; exit 1 ;;
esac
