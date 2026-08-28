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

If a run is `FAILED` or a source is `DEGRADED`, inspect
`OpportunitySyncRun.error`, `OpportunitySyncSourceResult`, and source health.
Re-run the same command. Do not reseed. Do not close all jobs because one
source failed.

A failed or degraded AITraining.jobs fetch never reconciles lifecycle.
Truncated `--max-records` runs also skip stale/close so a bounded import cannot
mass-close the catalog. 26h STALE and 72h CLOSED require a successful full
fetch plus legitimate absence (the listing was not in that complete catalog).

Manual `npm run opportunities:sync` and the timer `--trigger=cron` share
`syncOpportunities()`. Overlapping runs exit `SKIPPED_LOCKED`.

The oneshot process disconnects Prisma and exits after completion. Timeouts
are cleared in `withTimeout`.

Hourly reruns must not recreate the catalog. Matching is external id, then
application URL, then fingerprint. Creates allocate a unique slug using a hash
of the full source id (not a truncated prefix) and skip occupied slugs so a
collision cannot abort the whole source.

## Least privilege

The timer currently runs as `root` because API and web also run as root and
the tree lives under `/root/happytasking`. There is no existing dedicated
Happy Tasking service user. Creating one now would require ownership changes
on the app tree, nvm Node path, PostgreSQL credentials, and EnvironmentFile
access — a deployment risk during a hardening sprint.

Do **not** change `User=` until a dedicated user is provisioned in a
controlled deploy. Recommended later migration:

1. Create `happytasking` (or reuse a dedicated existing user) with login
   disabled.
2. Grant read/execute on `/root/happytasking` (or move the app out of `/root`)
   and read on `server/.env`.
3. Confirm Node at the nvm path is executable by that user.
4. Confirm PostgreSQL connectivity with the same DATABASE_URL.
5. Change `User=` on `happytasking-api`, `happytasking-web`, and
   `happytasking-opportunities-sync` together.
6. `daemon-reload` and verify one successful hourly sync before leaving it.

Never switch the scheduler user in isolation if that would break ingestion.
