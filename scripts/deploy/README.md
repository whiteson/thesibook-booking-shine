# Deploy — ThesiBook (thesiu @ dedi3543)

**Dedicated server.** Deploy only touches `/usr/home/thesiu/thesibook-booking-shine/`.  
It never connects to or modifies the **webcode.gr** account.

## Architecture

| URL | Serves |
|-----|--------|
| `https://www.thesibook.gr` | Next.js (Node, port **3005**) |
| `https://thesibook.gr/thesibook-booking-shine/backend/` | WordPress CMS + REST API |

## One-command deploy

```bash
cp scripts/deploy/config.example.env scripts/deploy/.env
# Fill MySQL + WP admin password

./scripts/deploy/deploy-hetzner.sh --check
./scripts/deploy/deploy-hetzner.sh
```

## SSH

```bash
ssh -p 222 thesiu@dedi3543.your-server.de
```

## konsoleH Node.js (www.thesibook.gr)

- App: `/usr/home/thesiu/thesibook-booking-shine/frontend`
- Start: `server.js`
- Port: **3005**

## Partial deploy

```bash
DEPLOY_SKIP_BACKEND=true ./scripts/deploy/deploy-hetzner.sh   # frontend only
DEPLOY_SKIP_FRONTEND=true ./scripts/deploy/deploy-hetzner.sh   # WordPress only
DEPLOY_WP_SEED=false ./scripts/deploy/deploy-hetzner.sh          # skip CMS re-seed
```

See `GO-LIVE.md` for checklist.
