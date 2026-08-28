# Opportunity sync job

## Command

Production:

```
/root/.nvm/versions/node/v24.16.0/bin/node \
  /root/happytasking/server/dist/jobs/syncOpportunities.js --trigger=cron
```

From the server package:

```
npm run opportunities:sync
# optional bounded import
node dist/jobs/syncOpportunities.js --max-records=50 --trigger=manual
```

Environment comes from `/root/happytasking/server/.env` (same file as the API).

## Scheduler

systemd timer `happytasking-opportunities-sync.timer` with `OnCalendar=hourly`
(equivalent to `0 * * * *`). Logs: `journalctl -u happytasking-opportunities-sync`.

## Lock

`OpportunitySyncLock` row id `opportunity-sync-global`. Acquire is an atomic
`INSERT ... ON CONFLICT DO UPDATE WHERE expiresAt < now()`. Overlapping cron
and admin “Sync now” exit `SKIPPED_LOCKED` without duplicating ingestion.
Stale locks expire after 50 minutes.

## Timeouts

- request 20s
- source 180s
- overall run 40 minutes (timer TimeoutStartSec=50min)

Timeouts are cleared after success so the process exits immediately.
`--max-records` is for bounded validation only. The hourly timer always
syncs the full catalog. Do not use a truncated run as production cron.

## Recovery

If a run is `FAILED`, inspect `OpportunitySyncRun.error` and source health.
Re-run the same command. Do not reseed. Do not close all jobs because one
source failed.
