# Opportunity ingestion architecture

Happy Tasking ingests paid AI-training opportunities into the existing
`Opportunity` model. Sprint 4.5 catalog trust gates remain in force:

- public catalog requires `isDemo=false` on both the opportunity and company
- demo intelligence never attaches to real jobs
- missing pay/location/TaskScore/TaskPulse is omitted, never zero-filled
- `/taskmatch` remains the generic jobs URL; no `/jobs` or `/ai-training-jobs`

## Pipeline

Cron/systemd timer (`0 * * * *` equivalent via `OnCalendar=hourly`)
→ `node dist/jobs/syncOpportunities.js`
→ acquire `OpportunitySyncLock`
→ `OpportunitySyncRun`
→ enabled sources (AITraining.jobs live adapter)
→ normalize / validate / relevance
→ resolve companies (upgrade demo shells to real when live listings exist)
→ dedupe
→ upsert
→ lifecycle (ACTIVE → STALE → CLOSED; never hard-delete)
→ release lock

Manual `npm run opportunities:sync` uses the same pipeline.

## Source failure isolation

A failed source records `FAILED` on its result row and does not roll back
successful sources. The run status is `PARTIAL_SUCCESS` when any source
succeeds and another fails.

## Request strategy

AITraining.jobs is fetched from the public homepage `fetchRoles` Next.js
server action (`POST /`, not `/api/`, which robots.txt disallows). One
unfiltered catalog is paged (`limit=60`, the observed server cap) until
`total` is reached. Country/work/platform filters are applied locally after
ingest.

## JobPosting schema

JobPosting JSON-LD stays disabled. Happy Tasking republishes aggregated
listings with factual summaries, not as the original employer. Google’s
JobPosting guidelines require a direct posting relationship we do not have.
