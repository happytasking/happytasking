# AITraining.jobs adapter

## Interface used

Public Next.js App Router server action `fetchRoles` on `POST https://aitraining.jobs/`.

- Header: `Next-Action: <hash>` (rediscovered from the homepage JS if the
  configured hash goes stale)
- Body: `[{ platforms:null, workType:null, remoteOnly:false, search:null, country:null, sort:"recent", offset, limit:60, withCount }]`
- Response: Next.js flight payload line `1:{"rows":[...],"total":N}`

This is a public JSON payload used by the live homepage, not `/api/` (disallowed
by robots.txt) and not a private Supabase key.

Observed 28 August 2026:

- 1,666 open roles (`total`)
- HTML SSR shows ~30 cards; client pages with `limit=30`
- Server action honors larger `limit` but caps at **60 rows per response**
- Full catalog = paginate `offset += rows.length` until `offset >= total`
- Do not reconstruct the catalog by fetching every country/work filter

## Row contract

`id, title, location, remote, work_type, compensation_text, platform_slug,
platformName, posted_at, first_seen_at, applyHref, applySponsored, pay`

`pay.payLow/payHigh` is **platform typical pay**, not listing pay. Listing
compensation is parsed from `compensation_text` only. Missing listing pay is
stored as null, never $0 and never replaced by platform medians.

`applySponsored` / `referralCode` are AITraining.jobs referrals, stored on
`rawDiscoveryApplicationUrl` and stripped from `originalApplicationUrl` with
explicit parameter rules.

Country codes are not on the row. Location text is parsed conservatively.
Remote ≠ worldwide. Unspecified eligibility is **unknown**, not confirmed
country eligibility. `/taskmatch?country=BR` defaults to confirmed worldwide
or explicitly Brazil listings. Unspecified location is opt-in via
`includeUnspecified=true`. Remote alone never implies Brazil eligibility.

Descriptions are not republished. A short factual summary is stored instead.

## Next-Action resilience

The `fetchRoles` action hash is a public Next.js identifier. It can change on
any AITraining.jobs deploy.

Happy Tasking does **not** brute-force hashes or call robots-disallowed `/api/`.

Runtime behavior:

1. Use the configured action id, refreshed from public homepage JS when
   discovery succeeds.
2. If the flight payload is missing/unreadable (`StaleFetchRolesActionError`),
   rediscover once from the public marketing chunk and retry.
3. If rediscovery fails, or a full fetch returns zero listings, throw
   `SourceDegradedError`. Source health becomes `DEGRADED`. Existing
   opportunities are preserved. Lifecycle stale/close is skipped.

A dedicated authorized JSON or feed endpoint remains the preferred long-term
integration. This adapter is a legal/public fallback until that exists.
