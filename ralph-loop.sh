#!/bin/bash
set -uo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

mkdir -p logs

for ((i=1; i<=$1; i++)); do
  logfile="logs/iteration-$i.json"
  echo "=== Iteration $i / $1 ==="

  # Safety net: ensure we're on master before handing off to the agent.
  # The agent prompt also does this, but belt-and-suspenders guards against
  # a previous iteration that crashed mid-branch-switch.
  git checkout master && git pull origin master

  docker sandbox run claude-asc-sales-form -- \
    --verbose \
    --print \
    --output-format stream-json \
    "$(cat ralph-prompt.md)" \
  | tee "$logfile"
  exit_code=${PIPESTATUS[0]}
  if [ "$exit_code" -ne 0 ]; then
    echo "Iteration $i: claude exited $exit_code — skipping to next iteration."
    continue
  fi

  if grep -q "<promise>COMPLETE</promise>" "$logfile"; then
    echo "Ralph complete after $i iterations."
    exit 0
  fi
done
