# AI provider layer

`apps/api/app/ai.py` defines a provider-neutral structured-output contract. Providers
must return Pydantic-validated `AgentSynthesis`; deterministic adapters and scoring
continue to work when all AI keys are absent.
