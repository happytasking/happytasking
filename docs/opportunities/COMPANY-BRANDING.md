# Company branding

Logos live on **Company**, never copied onto every Opportunity.

## Priority

1. Existing Happy Tasking curated file (`/logos/{slug}.svg`) when present
2. Official company website / known brand domain favicon
   (`https://www.google.com/s2/favicons?domain=HOST&sz=128`)
3. `platformLogoDomain` from the authorized feed, stored as `Company.website`
   when we have no website yet
4. Generated initials fallback (`CompanyLogo` onError)

We do not hotlink AITraining.jobs static assets.
We do not scrape Google Images.
We do not import their `highlight` art.

## Resolution

`resolveCompanyLogoUrl` / `resolveCompany` during ingestion. A one-shot
backfill (`server/src/jobs/backfillOpportunityDiscovery.ts`) fills missing
`logoUrl` on existing companies.

SVG files already in `web/public/logos/` are first-party curated assets.
Remote favicons are PNG from Google’s favicon service (content-type/size
handled by the browser; broken images fall back to initials). SVG from
untrusted hosts is not executed.

## UI surfaces

- Homepage teaser cards
- TaskMatch opportunity cards
- Platform/company filter chips
- Opportunity detail
- Company current-opportunities

`alt` is `{company} logo`. Initials are `aria-hidden` beside the visible name.
