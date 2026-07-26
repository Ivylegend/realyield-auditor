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

## Free GitHub-connected stack

1. Connect the GitHub repository to Cloudflare Pages/Sites for the web project.
2. In Render, create a Blueprint from the repository. `render.yaml` creates the
   free FastAPI web service and runs migrations during each build.
3. Create a Neon Free PostgreSQL project and place its async connection string
   in Render as `DATABASE_URL` (`postgresql+asyncpg://...`).
4. Create an Upstash Redis Free database and place the TLS URL in Render as
   `REDIS_URL`.
5. Create an Upstash QStash project and place the token and signing keys in the
   corresponding Render variables. QStash calls
   `/api/v1/tasks/audits/{audit_id}` for hosted background work.
6. Set `APP_URL` and `ALLOWED_ORIGINS` to the deployed web origin.

Render Free does not include a continuously running background worker, so the
hosted free configuration uses QStash. Celery remains the local and paid-hosting
worker implementation.
