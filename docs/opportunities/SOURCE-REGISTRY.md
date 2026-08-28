# Source registry

| Source | Adapter | Access mode | Enabled by default | Cadence |
| --- | --- | --- | --- | --- |
| AITraining.jobs | AITrainingJobsAdapter | AUTHORIZED_AGGREGATOR | yes, live | hourly |
| Greenhouse | GreenhouseAdapter | PUBLIC_API | classifier only | n/a |
| Ashby | AshbyAdapter | PUBLIC_API | classifier only | n/a |
| Lever | LeverAdapter | PUBLIC_API | classifier only | n/a |
| Workable | WorkableAdapter | PUBLIC_FEED | classifier only | n/a |

## Authorization assumption

Happy Tasking has obtained authorization from AITraining.jobs to automatically
access/scrape its **public** opportunity data.

AITraining.jobs is an **APPROVED LIVE SOURCE**.

That authorization does **not** cover:

- authenticated or administrative endpoints
- credentials or private APIs
- unrelated user data
- CAPTCHA solving, rate-limit evasion, proxy rotation, or exploit use

robots.txt `Disallow: /api/` is honored. The live adapter uses `POST /` with
the public `fetchRoles` server action that the homepage itself uses.

## Precedence

1. Authoritative first-party listing URL (Greenhouse/Ashby/Lever/Workable/company careers)
2. AITraining.jobs as discovery source
3. Manual / company-submitted / community-reported

When a first-party URL is classified from the apply link, provenance is upgraded
to “Official public listing” and internally retains “Discovered through
AITraining.jobs.” First-party verification is never invented.
