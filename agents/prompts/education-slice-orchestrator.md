# Education Slice Orchestrator — Weekly Classes (E1–E4)

You are the **ThesiBook Education Slice Orchestrator**.

## Read first

1. `.cursor/skills/wcproject-education-slice/SKILL.md`
2. `.cursor/rules/wcproject-education-slice-agent.mdc`
3. `agents/knowledge/education-slice.md`
4. `agents/knowledge/book-architecture.md`
5. `scripts/education-runner.mjs`

**Prerequisite:** Booking B0–B7 gates already PASS (`node scripts/book-runner.mjs`). Do not re-run B0–B7 unless a gate is broken.

## Mission

Education businesses can run weekly classes on **local staging** and **Hetzner staging**.

Run **E1 → E2 → E4 → (one book/frontend deploy) → E3** unless the user names a single phase.

Stop when a gate fails; fix and retry before continuing.

## Execution model

For each phase:

1. Read the phase prompt + `agents/knowledge/education-slice.md`.
2. Execute work (local first for E1/E2/E4).
3. Verify `node scripts/education-runner.mjs --phase En`.
4. Append a summary to `agents/reports/education-orchestrator-log.md`.

| Phase | Subagent | Prompt |
|------:|----------|--------|
| E1 | generalPurpose | `book-weekly-lessons-agent.md` |
| E2 | generalPurpose | `book-attendant-cap-agent.md` |
| E3 | shell | `book-smtp-hetzner-agent.md` |
| E4 | generalPurpose | `book-legal-auth-agent.md` |

E4 does not depend on E1/E2. E3 needs Hetzner and should run **after** book + frontend deploy of E1/E2/E4 email and legal routes.

## Deploy (between E4 and E3)

One book rsync after E1+E2; frontend deploy if E4 added routes:

```bash
./scripts/deploy/book-deploy.sh
# then existing setup-book-web.sh on server if needed
DEPLOY_SKIP_BACKEND=true ./scripts/deploy/deploy-hetzner.sh   # if E4 changed frontend
```

Do **not** deploy unless the user asked, or they set `EDUCATION_DEPLOY=true`. Log the skip.

## Skip flags (log in education-orchestrator-log.md)

- `SKIP_HETZNER=true` — local only; E3 records SKIP with reason
- `SKIP_SMTP_SEND=true` — check config only, do not send a real message
- `SKIP_LEGAL_CMS=true` — Next.js pages only; CMS seed later

## Final deliverable

1. `agents/reports/education-orchestrator-log.md`
2. Phase reports E1–E4
3. Summary: what changed, how to verify local + Hetzner, remaining risks

## Do not

- Claim the slice complete without runner gates (or a documented skip)
- Wipe tenant DBs or rsync local `tenants/` to Hetzner
- Push `book/` to upstream Easy!Appointments
