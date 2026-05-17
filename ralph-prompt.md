@AGENTS.md @progress.txt

You are working on the Ascensor Sales Form project — an internal tool for submitting sales orders.

## YOUR TASK THIS ITERATION

0. **Reset to master**
   Run: git checkout master && git pull origin master
   Always start each iteration from an up-to-date master.

1. **Pick an issue**
   Run: gh issue list --limit 20
   Priority order: architectural/schema work > integration points > core engine modules > API routes > UI > polish.

   Then check for open PRs: gh pr list --limit 20
   Skip any issue that already has an open PR — it is awaiting review, not your job this iteration.
   Pick the highest-priority open issue with no open PR.

2. Read the full issue body: gh issue view <number> --json title,body,labels,state,number

3. **Check out a branch**
   If the branch already exists: git checkout issue-<number>-<short-slug>
   Otherwise create it:         git checkout -b issue-<number>-<short-slug>

4. Implement the feature described in the issue.
   - Follow all standards in AGENTS.md exactly — tokens, component patterns, quality rules.
   - One issue only. Do not start a second issue.
   - Break large issues into logical sub-commits (e.g. schema → server action → UI).

5. Before every commit, run BOTH feedback loops:
      npm run typecheck   (must pass — zero TypeScript errors)
      npm run lint        (must pass — zero ESLint errors)
   Do NOT commit if any loop fails. Fix the issue first, then re-run both.

6. Commit with: git commit -m "feat: <description> (#<number>)"

7. Push and open a PR:
      git push -u origin <branch>
      gh pr create --title "<title>" --body "Closes #<number>"
   If a PR already exists for this branch, skip gh pr create.

8. **Return to master**
   Run: git checkout master

9. Append to progress.txt (keep it concise — grammar optional):
   [DATE] Issue #<number> — <what was done>, <key decisions>, <files changed>, <any blockers>

   Then commit progress.txt to master and push:
      git add progress.txt
      git commit -m "chore: progress update (#<number>)"
      git push

If you check the issue list and find that ALL issues are closed or all remaining ones have open PRs,
output exactly: <promise>COMPLETE</promise>
