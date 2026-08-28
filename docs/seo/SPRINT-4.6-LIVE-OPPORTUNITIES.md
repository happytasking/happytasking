# Sprint 4.6 — Live opportunities

Implemented on top of Sprint 4.5 (`feat(taskmatch): add trusted search landing`).
Trust gates were extended, not replaced.

## Ownership

- `/taskmatch` — generic AI-training jobs/work (canonical; query variants are not indexed separately)
- `/companies/{slug}` — company reputation + current jobs
- `/guides` — educational
- `/compare` — A vs B
- `/market` — market conditions + public hiring activity (not TaskPulse)

Sprint 5 mass linking and country/skill mills are not started.

## JobPosting

Disabled. Aggregated republished listings with summaries do not meet Google
JobPosting original-poster requirements.

## Deploy notes

Additive Prisma migration `20260828010000_opportunity_ingestion`.
systemd timer hourly. First production import should run `--max-records=50`
then a full sync if sample quality is acceptable.
