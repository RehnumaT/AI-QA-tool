#!/usr/bin/env bash
# GitHub Issues integration for the STLC skill pack — uses the `gh` CLI so it
# inherits whatever auth the developer already has, no separate token needed.
#
# Usage:
#   ./github.sh fetch owner/repo 123
#   ./github.sh create owner/repo "Bug title" "body text" "bug,P1"
#   ./github.sh comment owner/repo 123 "test plan drafted, see link"
#
# Required tools: gh (authenticated via `gh auth login`), jq

set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
source ./common.sh

require_cmd gh jq

fetch() {
  local repo="$1" num="$2"
  gh issue view "$num" --repo "$repo" --json number,title,state,labels,assignees,body,comments,url \
  | jq '{
      number: .number,
      title: .title,
      state: .state,
      labels: [.labels[].name],
      assignees: [.assignees[].login],
      body: .body,
      url: .url,
      commentCount: (.comments | length)
    }'
}

create() {
  local repo="$1" title="$2" body="$3" labels="${4:-}"
  local args=(issue create --repo "$repo" --title "$title" --body "$body")
  if [ -n "$labels" ]; then
    args+=(--label "$labels")
  fi
  gh "${args[@]}"
}

comment() {
  local repo="$1" num="$2" body="$3"
  gh issue comment "$num" --repo "$repo" --body "$body"
}

case "${1:-}" in
  fetch)   fetch "${2:?usage: github.sh fetch owner/repo NUMBER}" "${3:?issue number required}" | print_json ;;
  create)  create "${2:?usage: github.sh create owner/repo title body [labels]}" "${3:?title required}" "${4:?body required}" "${5:-}" ;;
  comment) comment "${2:?usage: github.sh comment owner/repo NUMBER text}" "${3:?issue number required}" "${4:?comment text required}" ;;
  *) echo "usage: github.sh {fetch|create|comment} owner/repo ..." >&2; exit 1 ;;
esac
