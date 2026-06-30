# AGENTS.md — WCProject Lovable → Headless WordPress + Next.js (v2)

Agent-assisted migration from Lovable/Vite/React to a **monorepo**: WordPress CMS (`backend/`) + Next.js public site (`frontend/`) + booking (`book/`).

## Mission

1. Keep Lovable `src/` as design reference.
2. Build headless WordPress with ACF Page Builder + REST API.
3. Build Next.js App Router frontend with typed section components.
4. Wire menus, settings, forms, and deploy automation.
5. **Booking:** Easy!Appointments in `book/` with multi-tenant workspace provisioning (database-per-tenant).
6. Validate with lint, typecheck, and build.

## Architecture

```txt
Lovable src/ (reference)
        ↓
agents/reports/codebase-map.md
        ↓
backend/ WordPress + webcode-headless-api plugin + ACF
        ↓
frontend/ Next.js + section renderer + wordpress adapters
        ↓
book/ Easy!Appointments + services/booking/ (control plane, future)
        ↓
scripts/deploy/ → production server
```

```txt
Pages fetch data.
Adapters normalize data.
Components render data.
```

## Important files

| Path | Purpose |
|------|---------|
| `.cursor/skills/wcproject-lovable-nextjs-v2/SKILL.md` | CMS + frontend migration playbook |
| `.cursor/skills/wcproject-booking-platform/SKILL.md` | Booking + multi-tenant playbook |
| `.cursor/rules/wcproject-lovable-nextjs-v2-agent.mdc` | Frontend/CMS agent constraints |
| `.cursor/rules/wcproject-booking-platform-agent.mdc` | Booking agent constraints |
| `agents/prompts/orchestrator.md` | Full CMS migration pipeline |
| `agents/prompts/book-orchestrator.md` | Booking pipeline (B0–B7) |
| `agents/knowledge/*.md` | WordPress, deploy, menus, **book-architecture** |
| `scripts/agent-runner.mjs` | CMS phase gates |
| `scripts/book-runner.mjs` | Booking phase gates |
| `scripts/install-book.sh` | Clone EA + local Docker |

## Validation

```bash
cd frontend
npm run lint
npm run typecheck
npm run build

# Booking bootstrap gate
node scripts/book-runner.mjs --phase B0
```

## Do not

- Hardcode content in section components.
- Fetch CMS data inside presentational components.
- Skip WordPress ACF layout registration when adding a section type.
- Commit or push `book/` to **upstream** Easy!Appointments GitHub (`alextselegidis/easyappointments`).
- Commit `book/config.php`, `book/vendor/`, or tenant DB credentials.
- Fork Easy!Appointments for shared-schema multi-tenancy without architecture review.
- Claim completion without passing validation or documenting why checks were not run.
