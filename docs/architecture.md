# Architecture

The public React/Vite surface calls versioned server endpoints. A production deployment can
point it at the standalone FastAPI service without duplicating domain types: the FastAPI
OpenAPI schema at `/api/v1/openapi.json` is the source for client generation.

FastAPI validates targets and orders, PostgreSQL stores normalized audit evidence and user
records, Redis carries rate-limit/job state, and Celery runs the audit state machine. Source
and protocol adapters normalize all third-party responses. Specialist agents operate only
on normalized evidence. Deterministic scoring reads versioned weights. The evidence reviewer
removes unsupported claims before the composer produces a Pydantic-validated report.

State machine:

`QUEUED → DISCOVERING → FETCHING_ONCHAIN_DATA → FETCHING_MARKET_DATA →
FETCHING_DOCUMENTATION → ANALYZING_YIELD → MAPPING_DEPENDENCIES → SCORING_RISKS →
RUNNING_SCENARIOS → REVIEWING_EVIDENCE → GENERATING_REPORT → COMPLETED`

Terminal alternatives are `FAILED`, `PARTIALLY_COMPLETED`, and `CANCELLED`.

Security boundaries: page/document content is untrusted; no adapter output can supply agent
instructions. Paid audits require a `PAID` order. Wallet access is read-only. Upload bytes
are private and quarantined before extraction. Admin writes require server-side roles.
