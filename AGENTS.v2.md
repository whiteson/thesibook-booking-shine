# AGENTS.md — WCProject Lovable → Headless WordPress + Next.js (v2)

Agent-assisted migration from Lovable/Vite/React to a **monorepo**: WordPress CMS (`backend/`) + Next.js public site (`frontend/`).

## Mission

1. Keep Lovable `src/` as design reference.
2. Build headless WordPress with ACF Page Builder + REST API.
3. Build Next.js App Router frontend with typed section components.
4. Wire menus, settings, forms, and deploy automation.
5. Validate with lint, typecheck, and build.

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
| `.cursor/skills/wcproject-lovable-nextjs-v2/SKILL.md` | Master playbook |
| `.cursor/rules/wcproject-lovable-nextjs-v2-agent.mdc` | Agent constraints |
| `agents/prompts/orchestrator.md` | Full pipeline entry |
| `agents/knowledge/*.md` | WordPress, deploy, menus, render modes |
| `scripts/agent-runner.mjs` | Phase list + gates |

## Validation

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Do not

- Hardcode content in section components.
- Fetch CMS data inside presentational components.
- Skip WordPress ACF layout registration when adding a section type.
- Claim completion without passing validation or documenting why checks were not run.
