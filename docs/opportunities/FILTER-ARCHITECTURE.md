# TaskMatch filter architecture

Serving layer is the Happy Tasking database. Filters never call
AITraining.jobs.

## URL parameters (canonical path remains `/taskmatch`)

| Param | Meaning | Invalid |
| --- | --- | --- |
| `q` | Search title, company, skills, domain, location, work type | trimmed, max 80, `%`/`_` stripped |
| `country` | ISO 3166-1 alpha-2 | ignored |
| `includeUnspecified` | `true` to add UNSPECIFIED when country is set | ignored |
| `workType` | Source taxonomy key | ignored |
| `domain` | Legacy HT domain slug | still honored if `workType` absent |
| `company` | Company slug | empty result if unknown |
| `remote` | `true` = listed remote | ignored |
| `sort` | see below | falls back to recommended/newest |
| `skill`, `pulse`, `minTaskScore`, `includeWorkedWith` | authenticated extras | ignored if invalid |

Query variants are **not** SEO routes and are **not** in the sitemap.

## Sort

| Value | Rule |
| --- | --- |
| `newest` / `recent` | `publishedAt`, else `firstSeenAt`. Not `lastVerifiedAt`. |
| `pay` | Comparable **hourly** `maxRate` only. Per-task/milestone excluded. No currency conversion. |
| `recommended` | `0.6 * match + 0.4 * quality` (anonymous uses 40 as missing match). Referral does not affect it. |
| `match` | Personalized TaskMatch score |
| `verified` | `lastVerifiedAt` recency |
| `quality` / `taskscore` | Community intelligence when present |

## Facets

Company and work-type counts are `groupBy` queries on the current catalog
filters (except the facet’s own dimension). Country confirmed counts are
tallied from `countryRestrictions` in one compact select. No N+1, no full
row fetch of 1,500 records for company chips.

## Search

Debounced 300ms in the client. Server uses Prisma `contains` (case
insensitive). Fine at ~1,500 rows; add a GIN/trgm index only if the catalog
grows toward 50k+.

## NEW badge

`publishedAt` within 24 hours. Listings without a source published date do not
inherit Happy Tasking's ingest timestamp as "NEW" — that would have marked the
entire first catalog as new.

- `(countryEligibility, status, isDemo)`
- `(status, isDemo, publishedAt)`
- `(status, isDemo, maxRate)`
- GIN on `countryRestrictions`
