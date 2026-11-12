---
name: wcproject-education-slice
description: >-
  ThesiBook education-slice pipeline (E1–E4): weekly lessons + class-mode default,
  free-plan attendant cap in Easy!Appointments, Hetzner SMTP proof, Privacy/Terms
  and platform password reset. Use when the user asks to run the education slice,
  weekly classes, attendant cap, SMTP on Hetzner, legal pages, or forgot-password
  for dashboard login.
---

# ThesiBook Education Slice — Weekly Classes

## Purpose

After booking B0–B7: make **weekly classes** work on local staging and Hetzner staging.

```txt
E1  Weekly lessons + class mode default (local, then book deploy)
E2  Enforce free-plan 5-attendant cap inside EA
E3  Prove SMTP on Hetzner
E4  Privacy/Terms + platform password reset
```

## Core rules

1. **Local first** for E1, E2, E4. E3 is Hetzner-only (or SKIP).
2. One book deploy **after** E1+E2 — not after every file save.
3. Never `console install` / `migrate fresh` on a tenant with data.
4. Never rsync `book/tenants/*` or email/SSO secret PHP files from local.
5. Document EA patches in `book/PATCHES.md`.

## Pipeline

| Phase | Prompt | Gate report |
|------:|--------|-------------|
| E1 | `agents/prompts/book-weekly-lessons-agent.md` | `agents/reports/education-weekly-lessons.md` |
| E2 | `agents/prompts/book-attendant-cap-agent.md` | `agents/reports/education-attendant-cap.md` |
| E3 | `agents/prompts/book-smtp-hetzner-agent.md` | `agents/reports/education-smtp-hetzner.md` |
| E4 | `agents/prompts/book-legal-auth-agent.md` | `agents/reports/education-legal-auth.md` |

**Orchestrator:** `agents/prompts/education-slice-orchestrator.md`  
**Runner:** `node scripts/education-runner.mjs`  
**Knowledge:** `agents/knowledge/education-slice.md`

Order: **E1 → E2 → E4 → deploy (if asked) → E3**.

## Subagents

| Phase | Subagent |
|------:|----------|
| E1 | generalPurpose |
| E2 | generalPurpose |
| E3 | shell |
| E4 | generalPurpose |

## Validation

```bash
node scripts/book-runner.mjs              # B0–B7 still PASS
node scripts/education-runner.mjs         # E1–E4
cd frontend && npm run lint && npm run typecheck
```

## Do not

- Re-scaffold B0–B7
- Merge WP users with EA users
- Claim E2 done if only the dashboard bar changed
- Print SMTP passwords in reports

## Read first

1. `agents/knowledge/education-slice.md`
2. `agents/knowledge/book-architecture.md`
3. `agents/reports/book-qa-report.md`
