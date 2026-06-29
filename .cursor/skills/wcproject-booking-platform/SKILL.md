---
name: wcproject-booking-platform
description: >-
  Easy!Appointments booking layer for ThesiBook monorepo: clone book/, local Docker
  dev, REST API integration, multi-tenant workspace provisioning (database-per-tenant),
  frontend registration bridge, and production deploy. Use when working on book/,
  scheduling, tenant onboarding, or booking widgets in frontend/.
---

# ThesiBook Booking Platform — Easy!Appointments + Multi-Tenant

## Purpose

Extend the ThesiBook monorepo with self-hosted appointment scheduling:

```txt
frontend/          Registration, marketing, booking embed/API
backend/           WordPress CMS (unchanged role)
book/              Easy!Appointments upstream clone (scheduling engine)
services/booking/  (future) Control plane — workspace + DB provisioning
```

## Core rules

1. **Single tenant first** — run `./scripts/install-book.sh --up` and complete EA wizard before multi-tenant work.
2. **Database-per-workspace** is the default multi-tenant strategy (see `agents/knowledge/book-architecture.md`).
3. **Minimize EA core forks** — prefer control plane service + env-based config + reverse proxy.
4. **GPL-3.0** — document EA patches in `book/PATCHES.md`; fork upstream when modifying EA.
5. **No secrets in git** — `book/config.php`, `scripts/book.env` are gitignored.
6. **API-first integration** — frontend talks to EA via REST (`book/openapi.yml`) or iframe embed for MVP.

## Pipeline (run in order)

| Phase | Name | Prompt | Gate |
|------:|------|--------|------|
| B0 | Book bootstrap | `agents/prompts/book-bootstrap-agent.md` | `book/config.php` exists |
| B1 | EA codebase map | `agents/prompts/book-codebase-analyzer.md` | `agents/reports/book-codebase-map.md` |
| B2 | Single-tenant local run | `agents/prompts/book-local-dev-agent.md` | Docker up, wizard done, API token noted |
| B3 | Control plane design | `agents/prompts/book-control-plane-designer.md` | `agents/knowledge/book-control-plane-schema.md` |
| B4 | Tenant provisioning | `agents/prompts/book-tenant-provisioning-agent.md` | Provisioning API creates tenant DB + admin |
| B5 | Dynamic routing | `agents/prompts/book-routing-agent.md` | `{slug}.book.local` resolves to tenant |
| B6 | Frontend integration | `agents/prompts/book-frontend-integration-agent.md` | Registration creates workspace |
| B7 | Production deploy | `agents/prompts/book-deploy-agent.md` | `agents/reports/book-qa-report.md` |

**Orchestrator:** `agents/prompts/book-orchestrator.md`  
**Runner:** `node scripts/book-runner.mjs`

## Subagent delegation

| Phase | Subagent |
|------:|----------|
| B0 | shell |
| B1 | explore |
| B2 | shell |
| B3 | generalPurpose |
| B4 | generalPurpose |
| B5 | generalPurpose |
| B6 | generalPurpose |
| B7 | shell |

## Validation

**Single tenant (B2):**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8090/
# Expect 200 or 302 after setup
```

**Frontend (unchanged):**

```bash
cd frontend && npm run lint && npm run typecheck && npm run build
```

## Do not

- Add multi-tenant columns to EA tables without architecture review.
- Store plaintext tenant DB passwords in control plane.
- Hardcode booking URLs in section components — use CMS settings or env.
- Skip `book-codebase-map.md` before provisioning work.
- Claim B2 complete without Docker health check or documented skip reason.

## Read first

1. `agents/knowledge/book-architecture.md`
2. `agents/knowledge/easyappointments.md`
3. `book/openapi.yml`
4. `book/README.MONOREPO.md`
