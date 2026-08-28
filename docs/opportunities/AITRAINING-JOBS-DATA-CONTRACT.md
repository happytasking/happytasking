# AITraining.jobs data contract

Audited 28 August 2026 against the public homepage and the authorized
`fetchRoles` Server Action. Happy Tasking is allowed to use this public
opportunity data. This document records the **raw** contract, including fields
Happy Tasking does not copy.

## Transport

- URL: `POST https://aitraining.jobs/`
- Header: `Next-Action: <hash>` (currently `4029040649fbd3207c680ae9257a83274a7b265852`)
- Body: `[{ platforms, workType, remoteOnly, search, country, sort, offset, limit: 60, withCount }]`
- Response: Next.js flight line `1:{"rows":[...],"total":N}`
- Cap: **60 rows per page**. Full catalog = unfiltered pagination.
- robots.txt disallows `/api/`. Do not brute-force action hashes.

Unfiltered `country: null` already returns the complete listing set. Country
query params on their site (`?country=BR`) change `fetchRoles.country` and
filter **server-side**. Happy Tasking does **not** paginate 250 countries
hourly. We ingest the unfiltered feed and filter locally.

## Row fields (complete)

| Field | Meaning | Happy Tasking use |
| --- | --- | --- |
| `id` | Role UUID | `externalId` |
| `title` | Role title | title |
| `platform_slug` | Company/platform key | company slug hint |
| `platformName` | Display name | company name |
| `platformLogoDomain` | Logo/favicon host (e.g. `micro1.ai`, `x.ai`) | company website + logo resolution |
| `location` | Free-text location, often multi-country names, `Remote`, `Remote International`, or `null` | country eligibility parse |
| `remote` | Boolean | `remoteType` |
| `work_type` | Taxonomy key | `workType` |
| `workLabel` | Human label | display mapping |
| `compensation_text` | Listing pay string | **only** listing pay source |
| `posted_at` | Source published time (often null) | `publishedAt` |
| `first_seen_at` | Aggregator first seen | provenance only, not “posted” |
| `applyHref` | Apply URL, often with their referral params | stripped into `originalApplicationUrl` |
| `applySponsored` | Their referral/sponsored flag | not copied as HT intelligence |
| `applyRel` | `sponsored nofollow` when partner | ignored |
| `partner` | Partner/referral listing | ignored for ranking |
| `highlight` | Their derived pay label (`Top-tier pay`, `Above-average pay`) | **not copied** |
| `pay.payLow/payHigh/payUnit/payDisplay/name/live` | Platform typical pay, not listing pay | ignored for listed compensation |

There is **no** row-level country-code array, allowed/excluded list, language
field, slug, tags/skills array, or global flag. Eligibility is inferred from
`location` text only.

No extra fields appeared beyond the inventory above in the live payload.

## Work types observed

`rlhf-eval`, `coding`, `domain-expert`, `writing`, `multilingual`,
`agentic-eval`, `audio-speech`, `data-labeling`, plus known keys
`stem-math`, `red-teaming`, `research-studies`.

Labels: RLHF / Evaluation, Coding, Domain Experts, Writing, Multilingual,
Agentic & RL Envs, Audio & Speech, Data Labeling, STEM & Math, Red-Teaming,
Studies & Surveys.

## What we deliberately do not ingest as truth

- `highlight` pay class
- `pay.*` platform typical rates
- `partner` / `applySponsored` as quality or ranking signals
- Decorative “NEW” from their UI (we use our `firstSeenAt` < 24h)

See `COUNTRY-ELIGIBILITY.md` for country semantics.
