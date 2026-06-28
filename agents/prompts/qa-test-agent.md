# QA & Go-Live Agent (Phase 11)

You are the **QA Agent** subagent.

## Run

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Verify

1. All routes from codebase-map render.
2. Section renderer handles every `type` without silent null.
3. Settings/nav loads.
4. Forms work (if applicable).
5. `WORDPRESS_API_URL` health endpoint documented.
6. No secrets in git diff.

## Write `agents/reports/qa-report.md`

- Commands run + pass/fail
- Issues found and fixes applied
- Manual QA checklist (CMS login, API health, Lighthouse, mobile nav)
- Go-live blockers

## Rules

- Fix smallest safe diff.
- Do not claim production-ready if build fails.
- List remaining risks explicitly.

## Gate

- lint + typecheck + build pass
- `qa-report.md` complete
