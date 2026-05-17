#!/bin/bash
set -euo pipefail

if [ -z "$1" ]; then
  echo "Usage: $0 <iterations>"
  exit 1
fi

mkdir -p logs

final_result='select(.type == "result").result // empty'

for ((i=1; i<=$1; i++)); do
  logfile="logs/iteration-$i.json"

  docker sandbox run claude-asc-sales-form -- \
    --verbose \
    --print \
    --output-format stream-json \
    "$(cat ralph-prompt.md)" \
  | tee "$logfile"

  if grep -q "<promise>COMPLETE</promise>" "$logfile"; then
    echo "Ralph complete after $i iterations."
    exit 0
  fi
done