<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## GitHub Issue Workflow

1. Run `gh issue list --limit 20` to see open issues
2. Pick the highest-priority open issue — prioritise architectural and integration work over UI polish (see priority order below)
3. Read the full issue: `gh issue view <number>`
4. Create a branch: `git checkout -b issue-<number>-<short-slug>`
5. Implement the feature — **one issue per iteration, no more**
6. Run all three feedback loops; fix any failures before committing
7. Commit: `git commit -m "feat: <description> (#<number>)"`
8. Open a PR: `gh pr create --title "<title>" --body "Closes #<number>"`
9. Append a progress entry to `progress.txt`

### Issue Priority Order
1. Architectural decisions and core abstractions
2. Integration points between modules
3. Core engine modules
4. API routes and server actions
5. UI and page implementation
6. Polish, cleanup, quick wins

---

## Quality Standards

This is production code. These rules are non-negotiable:

- TypeScript strict mode is on — no `any` types, no `@ts-ignore` without a comment explaining why
- Never use raw hex values or arbitrary Tailwind classes when a token exists
- One primary button maximum per view
- Focus rings: `focus-visible:ring-2 focus-visible:ring-brand`

## Small Steps
- One issue per commit where possible; break large issues into logical sub-commits (schema → server action → UI)
- Run feedback loops after each logical chunk, not just at the end
- Prefer editing existing files to creating new ones

## Environment Boundaries

Assume the repository tooling and environment are already correctly configured.

You may:
- fix application code
- fix tests directly related to the issue
- fix type errors caused by your changes
- fix lint errors caused by your changes

You must NOT:
- create helper scripts
- create debugging utilities
- create Python tooling
- modify Docker configuration
- modify package manager configuration
- modify CI/CD pipelines
- install alternative tooling
- rewrite build systems
- introduce retries/workarounds for environment issues

If tooling fails for reasons unrelated to the issue:
1. Retry once only
2. Report the exact failure
3. Stop cleanly and provide a summary in progress.txt

Do not attempt environmental remediation.

## Investigation Limits

Maximum:
- 3 exploratory commands
- 2 failed attempts per task
- 1 retry for test/lint/typecheck commands

Avoid prolonged debugging loops.

Prefer minimal targeted fixes over broad investigation.