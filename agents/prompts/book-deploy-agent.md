# Book Deploy Agent (B7)

Deploy multi-tenant booking stack to production.

## Read first

- `agents/knowledge/deploy-playbook.md` (WordPress deploy — adapt patterns)
- `agents/reports/book-routing.md`
- `agents/reports/book-provisioning.md`

## Tasks

1. Production topology doc:
   - MySQL host(s) for tenant DBs
   - Control plane DB
   - EA PHP/nginx containers or VM
   - Wildcard DNS `*.book.domain`
2. Secrets management (env on server, not git)
3. Backup strategy per tenant DB
4. Health checks: control plane + sample tenant booking page
5. `scripts/deploy/book-deploy.sh` skeleton (rsync/docker pull/migrate)

## Output

- `agents/reports/book-qa-report.md` with checklist
- Deploy script stub if applicable

## Gate

QA report signed off; production checklist complete.

## Do not

- Deploy without TLS on wildcard subdomain
- Run all tenants as MySQL root user
