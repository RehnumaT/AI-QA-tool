#!/usr/bin/env bash
# Shared helpers for the tracker integration scripts (jira.sh / github.sh / linear.sh).
# Sourced, not executed directly: `source "$(dirname "$0")/common.sh"`

set -euo pipefail

require_cmd() {
  for cmd in "$@"; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
      echo "error: required command '$cmd' not found on PATH" >&2
      exit 1
    fi
  done
}

require_env() {
  local missing=()
  for var in "$@"; do
    if [ -z "${!var:-}" ]; then
      missing+=("$var")
    fi
  done
  if [ "${#missing[@]}" -gt 0 ]; then
    echo "error: missing required environment variable(s): ${missing[*]}" >&2
    exit 1
  fi
}

# curl wrapper that fails loudly on HTTP errors instead of printing an HTML
# error page and letting jq choke on it with a confusing message.
http_json() {
  local method="$1"; shift
  local url="$1"; shift
  local tmp status
  tmp="$(mktemp)"
  status="$(curl -sS -o "$tmp" -w '%{http_code}' -X "$method" "$url" "$@")"
  if [ "$status" -ge 400 ]; then
    echo "error: $method $url returned HTTP $status" >&2
    cat "$tmp" >&2
    rm -f "$tmp"
    exit 1
  fi
  cat "$tmp"
  rm -f "$tmp"
}

print_json() {
  if command -v jq >/dev/null 2>&1; then
    jq .
  else
    cat
  fi
}
