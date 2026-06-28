# Interactive Checkpoints — ask before acting

The agent must **ask the user** at defined points. Do not assume credentials, URLs, or scope unless the user already answered in `agents/reports/project-config.md`.

Use Cursor **AskQuestion** when available. Otherwise ask in plain chat and **wait for a reply** before continuing.

## Rule

```txt
Read project-config.md → if field missing → ask → save answer → then run phase
```

Never write secrets to git. Store answers in:

- `agents/reports/project-config.md` (non-secret choices)
- `scripts/local.env` / `scripts/deploy/.env` (secrets — gitignored)
- `frontend/.env.local` (API URL only)

---

## Intake (before phase 0 or when user says "run orchestrator")

Ask these **once** at the start:

| # | Question | Options / notes |
|---|----------|-----------------|
| 1 | **Run mode?** | `full` (0→11) · `resume` (from phase N) · `single` (one phase only) |
| 2 | **Project folder name** under web root? | e.g. `webcode-elevate` → sets `PROJECT_SLUG` |
| 3 | **Production domain?** | e.g. `https://www.example.com` (can defer) |
| 4 | **Local dev on this Mac?** | `yes` (run phase 3b) · `no` / mock-only (`SKIP_LOCAL_WP=true`) |
| 5 | **Web server for local PHP?** | `apache-localhost` · `mamp` (ask port) · `valet` · `other` |

If `resume` or `single`, ask: **Which phase?** (0, 1, 2, 3, 3b, 4–11)

Save to `agents/reports/project-config.md`.

---

## Phase 3b — WordPress local install (required questions)

Ask **before** running `install-wordpress.sh` if not in `project-config.md`:

| # | Question | Default if user says "defaults" |
|---|----------|-------------------------------|
| 1 | MySQL host? | `localhost` (MAMP: `127.0.0.1:8889`) |
| 2 | MySQL user? | `root` |
| 3 | MySQL password? | `password` |
| 4 | Database name? | `{PROJECT_SLUG}_backend` |
| 5 | Local WordPress URL? | `http://localhost/{PROJECT_SLUG}/backend` |
| 6 | WP admin username? | `admin` |
| 7 | WP admin password? | user chooses (suggest `admin` for local only) |
| 8 | WP admin email? | `dev@localhost.test` |
| 9 | Next.js dev URL? | `http://localhost:3002` |

Confirm: "I will write `scripts/local.env` and run install scripts. Proceed?"

---

## Phase 4 — Next.js

Ask if not set:

| # | Question |
|---|----------|
| 1 | `NEXT_RENDER_MODE` for local? | `ssr` (recommended while editing CMS) · `isr` · `static` |
| 2 | Connect to live WordPress API now or mock first? | `wordpress` · `mock` |

---

## Phase 10 — Production deploy

Ask **before** any deploy or writing `scripts/deploy/.env`:

| # | Question |
|---|----------|
| 1 | Deploy now or only prepare scripts? | `prepare-only` · `deploy` |
| 2 | SSH host + port? | |
| 3 | Remote path / project slug on server? | |
| 4 | Production `WORDPRESS_API_URL`? | |
| 5 | Production `NEXT_PUBLIC_SITE_URL`? | |
| 6 | MySQL on server (DB name, user, host)? | password → `.env` only |
| 7 | WP admin user + email for first install? | password → `.env` only |

If `prepare-only`, skip SSH and do not run `deploy-hetzner.sh`.

---

## Between phases — status prompt

After each phase gate passes, ask:

```md
Phase {N} complete. Continue to phase {N+1} ({name})?
- Yes, continue
- Pause here
- Skip next phase (explain why)
- Change an answer in project-config first
```

Do not start the next phase until the user confirms (unless they said **full** unattended at intake and explicitly said "run all without stopping").

---

## project-config.md template

```md
# Project config (non-secrets)

## Run mode
- mode: full | resume | single
- start_phase: 0
- unattended: false

## Project
- slug: 
- github_url: 
- production_domain: 

## Local dev
- skip_local_wp: false
- web_server: apache-localhost | mamp | valet
- wp_local_url: 
- next_dev_url: http://localhost:3002
- mysql_host: 
- mysql_user: 
- mysql_db: 
- wp_admin_user: 
- next_render_mode: ssr

## Production (non-secret)
- deploy_prepared: false
- wordpress_api_url: 
- next_public_site_url: 

## Answered checkpoints
- [ ] intake
- [ ] phase_3b
- [ ] phase_4
- [ ] phase_10
```

---

## What NOT to ask

- Do not ask for secrets already in gitignored `.env` files unless user wants to change them.
- Do not re-ask intake questions if `project-config.md` is complete and user said "continue".
- Do not ask Lovable analysis questions — phase 1 discovers those from code.
