# Book QA — Local Full Stack

Run before go-live.

## Prerequisites

```bash
./scripts/install-book.sh --native --install   # master EA (optional)
./scripts/setup-control-plane.sh
./scripts/install-book.sh --serve              # terminal 1: EA :8090
cd frontend && npm run dev                     # terminal 2: :3010
```

## Test checklist

- [ ] `http://localhost:3010/register` — form loads (ThesiBook styling)
- [ ] Register new business → redirects to `/dashboard`
- [ ] Dashboard shows workspace, plan (Δωρεάν), attendant count 0
- [ ] "Διαχείριση booking" opens EA admin with `?thesibook_tenant=SLUG`
- [ ] Login with same email/password works
- [ ] Second registration with same email → 409 error
- [ ] Control plane: `mysql thesibook_control -e "SELECT slug,status,plan FROM cp_workspaces"`

## Tier rules (MVP — display only, payment later)

| Plan | Price | Attendant limit |
|------|-------|-----------------|
| free | €0 | 5 |
| small | €7 | 10 |
| unlimited | €15 | none |

Attendants = distinct customers with appointments in tenant EA DB.

## Known local limits

- EA tenant session: first visit must use dashboard link (`?thesibook_tenant=`)
- Payment / plan upgrade: not wired yet
- Production: wildcard subdomain + nginx (see `scripts/deploy/book-nginx.conf.example`)

## Agents

- Orchestrator: `agents/prompts/book-orchestrator.md`
- This QA: `agents/prompts/book-qa-local-agent.md`
