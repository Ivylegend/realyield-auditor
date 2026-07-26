# Deployment

## Web

The validated Vinext build emits Cloudflare Worker-compatible ESM output and is deployed
through Sites. For Vercel, set `VITE_API_URL` to the public FastAPI URL and use the normal
Node build command `npm run build`.

## API and worker

Deploy `infra/docker/api.Dockerfile` twice: once with the default command for FastAPI and
once with `celery -A app.worker.celery worker --loglevel=INFO`. Provision PostgreSQL 16 and
Redis 7. Set every non-empty production value from `.env.example`, restrict CORS to the
production web origin, then run:

```bash
cd apps/api
alembic upgrade head
```

Use persistent private storage or an object store for uploads, configure a malware scanner,
and place the API behind TLS. Add Stripe webhook signature verification before enabling paid
checkout. Configure Sentry and OpenTelemetry endpoints for traces/errors.

Health probes: `/api/v1/health` for liveness and `/api/v1/ready` for readiness.
