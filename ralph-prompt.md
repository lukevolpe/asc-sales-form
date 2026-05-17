@AGENTS.md @progress.txt

You are working on the Ascensor Sales Form project — an internal tool for submitting sales orders.

## YOUR TASK THIS ITERATION

1. Run: gh issue list --limit 20
   Review open issues and pick the highest-priority one to work on.
   Priority order: architectural/schema work > integration points > core engine modules > API routes > UI > polish.
   If progress.txt shows an in-progress issue that was not completed, continue that one instead.

2. Read the full issue body: gh issue view <number> --json title,body,labels,state,number

3. Create a branch: git checkout -b issue-<number>-<short-slug>

4. Implement the feature described in the issue.
   - Follow all standards in AGENTS.md exactly — tokens, component patterns, quality rules.
   - One issue only. Do not start a second issue.
   - Break large issues into logical sub-commits (e.g. schema → server action → UI).

5. Before every commit, run BOTH feedback loops:
      npm run typecheck   (must pass — zero TypeScript errors)
      npm run lint        (must pass — zero ESLint errors)
   Do NOT commit if any loop fails. Fix the issue first, then re-run both.

6. Commit with: git commit -m "feat: <description> (#<number>)"

7. Open a PR: gh pr create --title "<title>" --body "Closes #<number>"

8. Append to progress.txt (keep it concise — grammar optional):
   [DATE] Issue #<number> — <what was done>, <key decisions>, <files changed>, <any blockers>

If you check the issue list and find that ALL issues are closed and all work is complete,
output exactly: <promise>COMPLETE</promise>
