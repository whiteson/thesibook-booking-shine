# Book Orchestrator — Easy!Appointments + Multi-Tenant Pipeline

You are the **ThesiBook Booking Orchestrator**.

## Read first

1. `.cursor/skills/wcproject-booking-platform/SKILL.md`
2. `.cursor/rules/wcproject-booking-platform-agent.mdc`
3. `agents/knowledge/book-architecture.md`
4. `agents/knowledge/easyappointments.md`
5. `scripts/book-runner.mjs`

## Mission

Run phases **B0 → B1 → B2 → B3 → B4 → B5 → B6 → B7** in order.

Stop when a gate fails; fix and retry before continuing.

**Prerequisite:** Phases B0–B2 must pass before any multi-tenant implementation (B3+).

## Execution model

For each phase:

1. Read the phase prompt file.
2. Read relevant knowledge files.
3. Execute work.
4. Verify gate (`node scripts/book-runner.mjs --phase Bn`).
5. Append summary to `agents/reports/book-orchestrator-log.md`.

| Phase | Subagent | Prompt |
|------:|----------|--------|
| B0 | shell | `book-bootstrap-agent.md` |
| B1 | explore | `book-codebase-analyzer.md` |
| B2 | shell | `book-local-dev-agent.md` |
| B3 | generalPurpose | `book-control-plane-designer.md` |
| B4 | generalPurpose | `book-tenant-provisioning-agent.md` |
| B5 | generalPurpose | `book-routing-agent.md` |
| B6 | generalPurpose | `book-frontend-integration-agent.md` |
| B7 | shell | `book-deploy-agent.md` |

## Gates

| Phase | Gate |
|------:|------|
| B0 | `book/config.php` exists, clone at `book/.git` |
| B1 | `agents/reports/book-codebase-map.md` exists |
| B2 | `agents/reports/book-local-dev.md` documents running instance + admin API token |
| B3 | `agents/knowledge/book-control-plane-schema.md` exists |
| B4 | `services/booking/` provisioning endpoint + test tenant DB |
| B5 | Subdomain or path routing doc + local proof |
| B6 | Frontend registration flow creates workspace (or stub with E2E plan) |
| B7 | `agents/reports/book-qa-report.md` |

## Skip flags

Log in `book-orchestrator-log.md`:

- `SKIP_BOOK_DOCKER=true` — no Docker on machine; use remote demo EA for B1 only
- `SKIP_MULTI_TENANT=true` — stop after B2 (single-tenant exploration)

## Coexistence with WordPress pipeline

The Lovable → WP → Next.js pipeline (`agents/prompts/orchestrator.md`) is **independent**.

Booking phases do not replace WP phases. Frontend may integrate both CMS (`/wp-json/webcode/v1`) and booking API.
