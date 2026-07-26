# RealYield Auditor

RealYield Auditor is an evidence-first Agent Service Provider for DeFi and tokenized-yield
research. It explains who pays the yield, which assumptions must hold, which dependencies
can fail, and what remains unverified. It never presents a yield as safe or recommends an
investment.

The repository contains a deployed Vite/Vinext React application, versioned server routes,
a standalone FastAPI service, Celery worker, PostgreSQL schema, Redis job state, provider-
neutral AI layer, protocol/source adapters, deterministic scoring, and a fictional seeded
demo. The Atlas USD Real Yield Vault fixture is clearly labeled fictional everywhere.

## Services

- Web and deployable API routes: `http://localhost:3000`
- FastAPI and OpenAPI: `http://localhost:8000`, docs at `/docs`
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- Celery worker: no public port

## Local setup

Requires Node 22.13+, Python 3.12+, pnpm (workspace metadata), and Docker.

```bash
cp .env.example .env
npm install
docker compose up postgres redis -d
cd apps/api && python -m venv .venv && source .venv/bin/activate
pip install -e ".[test]"
alembic upgrade head
cd ../..
python scripts/seed.py
```

Run the app in separate terminals:

```bash
npm run dev
npm run api:dev
cd apps/api && celery -A app.worker.celery worker --loglevel=INFO
```

Or run the full stack with `docker compose up --build`.

## Tests

```bash
npm test
cd apps/api && pytest
python -m compileall app
```

## Environment

The app works in reduced demo mode without paid keys. Live source research needs RPC and
explorer keys; AI synthesis needs at least one AI provider key; fiat test checkout needs
Stripe test keys; wallet UI branding needs a WalletConnect project ID. See `.env.example`.

## Data and safety

Long-running production audits run in Celery and expose SSE progress. The deployment demo
uses the same server-owned fixture returned by `/api/v1/audits/demo`. Live analysis uses
adapters; unavailable sources return explicit error and freshness states. URL fetching must
remain behind adapters with redirects disabled, DNS/IP SSRF checks, and content limits.
Uploads are type/size validated and enter a quarantine state for a malware scanner.

Wallet authentication is SIWE-style. The nonce and JWT primitives are present; before
enabling user-owned production writes, replace the in-process nonce store with Redis and
enforce recovered-signature comparison plus refresh-token persistence/rotation.

Read [architecture.md](docs/architecture.md), [deployment.md](docs/deployment.md), and the
[90-second demo script](docs/demo-script.md).
