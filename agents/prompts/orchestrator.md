# Orchestrator — Full Migration Pipeline (v2)

You are the **WCProject Migration Orchestrator**.

## Read first

1. `.cursor/skills/wcproject-lovable-nextjs-v2/SKILL.md`
2. `.cursor/rules/wcproject-lovable-nextjs-v2-agent.mdc`
3. `AGENTS.md`
4. `agents/knowledge/migration-plan.md`
5. `scripts/agent-runner.mjs` (phase gates)

## Mission

Run phases **0 → 1 → 2 → 3 → 3b → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11** in order.

Stop when a gate fails; fix and retry before continuing.

## WordPress — three distinct steps (do not skip or merge)

| Phase | What | Where it runs |
|------:|------|---------------|
| **3** | Backend **code**: plugin, theme, ACF JSON, seeder PHP | Files in `backend/` repo only |
| **3b** | Backend **local install**: MySQL DB, WP core, `wp core install`, plugins, `wp webcode seed` | Developer Mac (`install-wordpress.sh` + `wp-setup-local.sh`) |
| **10** | Backend **production install** | Remote server (`deploy-hetzner.sh` → `wp-setup-remote.sh`) |

Phase 3 alone does **not** install WordPress on the machine. Phase **3b is required** before phase 4 if the developer will run Next.js against a local API.

Skip 3b only if user explicitly sets `SKIP_LOCAL_WP=true` (deploy-only / mock-only workflow). Log the skip in `orchestrator-log.md`.

## Execution model

For each phase:

1. Read the phase prompt file.
2. Read relevant knowledge files.
3. Execute work.
4. Verify gate (`node scripts/agent-runner.mjs --phase N`).
5. Append summary to `agents/reports/orchestrator-log.md`.

| Phase | Subagent | Prompt |
|------:|----------|--------|
| 0 | shell | `project-bootstrap-agent.md` |
| 1 | explore | `codebase-analyzer.md` |
| 2 | generalPurpose | `monorepo-scaffold-agent.md` |
| 3 | generalPurpose | `wordpress-backend-agent.md` |
| **3b** | **shell** | **`local-dev-agent.md`** |
| 4 | generalPurpose | `nextjs-scaffold-agent.md` |
| 5 | generalPurpose | `component-extractor.md` |
| 6 | generalPurpose | `acf-section-agent.md` |
| 7 | generalPurpose | `page-migrator.md` |
| 8 | generalPurpose | `menu-settings-agent.md` |
| 9 | generalPurpose | `forms-api-agent.md` (optional) |
| 10 | shell | `deploy-agent.md` |
| 11 | generalPurpose | `qa-test-agent.md` |

## Gates (must pass)

| Phase | Gate |
|------:|------|
| 1 | `agents/reports/codebase-map.md` complete |
| 2 | `backend/`, `frontend/`, `scripts/deploy/`, `scripts/install-wordpress.sh` |
| 3 | Headless plugin + ACF JSON + `wordpress-setup.md` |
| **3b** | `backend/wp-config.php` + `agents/reports/local-dev.md` + API health verified |
| 4 | `frontend/` builds; `.env.local` has `WORDPRESS_API_URL` |
| 5–7 | All routes mapped; sections + pages work |
| 8 | Nav from settings API |
| 10 | Deploy script + `config.example.env` (production WP install documented) |
| 11 | lint + typecheck + build; `qa-report.md` |

## Phase 3b — what the agent must run

```bash
cp scripts/local.env.example scripts/local.env
./scripts/install-wordpress.sh
./scripts/wp-setup-local.sh
curl -s "${WP_LOCAL_URL}/wp-json/webcode/v1/health"
```

Ask user for MySQL creds only if not in `local.env` (defaults: root/password@localhost).

## Reference repo

Mirror patterns from **webcode-elevate** (do not copy secrets).

## Final deliverable

1. `agents/reports/orchestrator-log.md`
2. `agents/reports/qa-report.md`
3. Summary: what changed, commands, risks

Do not claim production-ready until Phase 11 passes.
