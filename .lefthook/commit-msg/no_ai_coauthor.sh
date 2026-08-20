#!/usr/bin/env bash
set -euo pipefail

message_file="$1"

if grep -qiE '^Co-authored-by:.*(claude|anthropic)' "$message_file"; then
  cat >&2 <<'EOF'
✖ Commit rejected: the commit message credits Claude (or another AI assistant) as a co-author.

Per the Engineering AI Use Policy (4.1 Authorship): the engineer who prompts, reviews, tests,
and commits code is the author of record — Claude is a tool, not a co-author. Remove the
"Co-authored-by" trailer crediting the AI assistant and commit again.

  https://limepoint.atlassian.net/wiki/spaces/OP/pages/2929262594/Artificial+Intelligence+AI+Use+Policy+For+Engineering#4.1--Authorship
EOF
  exit 1
fi
