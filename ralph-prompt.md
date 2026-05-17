@AGENTS.md @progress.txt

You are working on the Ascensor Sales Form project — an internal tool for submitting sales orders.

## YOUR TASK THIS ITERATION

0. **Reset to master**
   Run: git checkout master && git pull origin master
   Always start each iteration from an up-to-date master.

1. **Pick an issue**
   Run: gh issue list --limit 20
   Priority order: architectural/schema work > integration points > core engine modules > API routes > UI > polish.

   For each candidate (highest priority first), apply these filters in order — skip the issue if any filter fails:

   a) Open PR check: gh pr list --limit 20
      Skip if this issue already has an open PR awaiting review.

   b) Dependency check: gh issue view <number> --json body
      Look for a "Blocked by" line in the body (e.g. "Blocked by: #2, #5").
      For each listed issue number, run: gh issue view <dep> --json state
      Skip if any dependency is still open (not yet merged/closed).

   Pick the first issue that passes both filters.

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

If every remaining open issue is either awaiting PR review or blocked by unmerged work,
output exactly: <promise>COMPLETE</promise>
