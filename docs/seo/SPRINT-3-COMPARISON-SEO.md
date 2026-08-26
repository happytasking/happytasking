# Sprint 3 — Comparison SEO engine

**Goal:** Permanent, server-rendered comparison landing pages that help a worker decide between two AI work companies — without publishing a thin N×(N−1)/2 grid.

**Canonical origin:** `https://happytasking.com`  
**Site name:** Happy Tasking  
**Tagline:** Know before you task.

Sprints 0–2 remain in force. Public list pages stay server-rendered. `/api/` stays disallowed. Demo company intelligence stays `noindex, follow` and out of the sitemap. Do not start Sprint 4 (guides, skill/country pages, bulk comparison content).

Do not:

- whitelist Googlebot
- cloak
- make Outlier vs Mercor indexable merely to test SEO
- declare a universal winner
- add `aggregateRating` / `Review` / `Product` JSON-LD
- generate all company combinations
- treat missing metrics as zero

---

## 1. Audit (before this sprint)

| Surface | Before | Gap |
| --- | --- | --- |
| `/compare` | Indexable SSR hub; H1 “Compare companies”; client selects companies | Keep as the interactive selector |
| Pair URLs | Only `/compare?a=outlier&b=mercor` (and reverse) | Query variants are not stable permalinks; they would compete with a landing page |
| Data load | `loadComparePage` → directory + two `/companies/{slug}` (90d) + trends; missing sides return `null` (hub stays 200) | Landings should reuse cached `loadCompany` and 404 on invalid pairs |
| Eligibility | Company-level `companySEOEligibility()` | No pair-level `comparisonSEOEligibility()` |
| Company pages | Linked to `/compare?a={slug}&b={other}` | Should point at the canonical landing with descriptive anchor text |
| Sitemap | Static `/compare` + companies / skills / opportunities | No comparison landings; must not dump every combination |
| Structured data | BreadcrumbList on the hub | Landings need Home → Compare → {A} vs {B}; no ratings |
| Duplicates | `?a=x&b=y` vs `?a=y&b=x` vs future `/compare/x-vs-y` vs `/compare/y-vs-x` | One canonical URL per pair |

Reusable: `publicPageMetadata()`, `Breadcrumbs` / BreadcrumbList, `loadCompany()` (React `cache`), `DemoBadge`, `ScoreBar`, `companySEOEligibility()`, `mayIndexListedResource()`, `serverApi()`.

Current production companies remain `isDemo: true`. Community metrics on those pages are seed/demo. **Do not index demo comparisons.**

---

## 2. Implementation plan (executed)

1. Canonical pair helper: alphabetical slug order (`en` localeCompare), never TaskScore.
2. Robust slug parse: try every `-vs-` partition; prefer longer left slugs; optional `knownSlugs`.
3. Route `/compare/[comparisonSlug]` as a Server Component with SSR comparison HTML.
4. Reversed / non-canonical slug → **308** to the canonical path.
5. Hub `/compare` stays. Full requests with two resolved companies in `?a=` + `?b=` **308** to the landing. One-sided `?a=` stays on the hub. Client dropdowns still use soft query updates (no full navigation).
6. `comparisonSEOEligibility()` on web + server; sitemap uses it plus domain overlap + caps.
7. Demo pairs: reachable, DEMO labeled, `noindex, follow`, out of sitemap, no rating JSON-LD.
8. Company intelligence links to `/compare/{canonicalSlug}` (“Compare Outlier and Mercor”). “Open the comparison tool” stays `/compare?a={slug}`.
9. Tests + isolated production build. No commit / push / deploy in this sprint until approved.

---

## 3. Canonical pair normalization

`normalizeComparisonPair(companyA, companyB)` lowercases both slugs and sorts with `localeCompare(..., "en")`.

**Not** by TaskScore, popularity, or request order.

Example: Outlier vs Mercor → **`/compare/mercor-vs-outlier`**.

| Request | Response |
| --- | --- |
| `/compare/mercor-vs-outlier` | 200 (canonical) |
| `/compare/outlier-vs-mercor` | **308** → `/compare/mercor-vs-outlier` |
| `/compare/Mercor-vs-Outlier` | **308** → `/compare/mercor-vs-outlier` (exact slug match) |

`comparisonPath(a, b)` is the shared href helper for company pages, hub chips, and related links.

---

## 4. Slug parsing

Do not split only on the first `-vs-`. `parseComparisonSlugCandidates` walks every `-vs-` partition where both sides pass `isIndexableSlug`. Longer left slugs are tried first so a future company `acme-vs-labs` can be compared with `mercor` as `acme-vs-labs-vs-mercor`.

The landing loads candidates in that order until both companies exist. Unresolvable slugs are HTTP 404.

`parseComparisonSlug(raw, knownSlugs?)` uses known company slugs when provided.

---

## 5. Legacy query URLs

| URL | Behavior |
| --- | --- |
| `/compare` | Unchanged hub. Indexable. Canonical `https://happytasking.com/compare` |
| `/compare?a=outlier` | Hub with one side preselected. **No redirect.** Canonical remains `/compare` |
| `/compare?a=outlier&b=mercor` | Server loads both companies, then **308** to `/compare/mercor-vs-outlier` |
| `/compare?a=mercor&b=outlier` | Same canonical landing (pair is normalized) |
| `/compare?a=outlier&b=outlier` | Stays on the hub (invalid pair is not a landing) |
| `/compare?a=fake&b=mercor` | Stays on the hub if a side fails to load (preserves tool UX; not a competing 200 landing) |

The in-page comparison tool uses `useSoftQuery`. Changing dropdowns does **not** full-navigate, so a user can still compare on `/compare` until they share or refresh a two-company URL.

Popular chips and company-page pair links use the permanent path.

---

## 6. Eligibility

`comparisonSEOEligibility(companyA, companyB, comparisonData?)` returns:

```
{ indexable: boolean, includeInSitemap: boolean, reasons: string[] }
```

`indexable` and `includeInSitemap` are always equal in the helper. The page also applies Sprint 1 `mayIndexListedResource("comparisons", slug, isDemo)` so a pair is only `index, follow` when it is listed in the sitemap **and** neither company is demo.

There is **no** “both companies need 10 reviews” rule.

### Reasons (blockers)

| Reason | When |
| --- | --- |
| `SAME_COMPANY` | slugs equal |
| `INVALID_PAIR` | missing name or slug |
| `DEMO_ONLY` | either company is demo |
| `PRIVATE` | either company is not `ACTIVE` |
| `COMPANY_A_INELIGIBLE` / `COMPANY_B_INELIGIBLE` | that company fails company SEO for a non-demo, non-private reason |
| `INSUFFICIENT_COMPARISON_DATA` | neither side has a public identity **and** there are no comparable dimensions |
| `INSUFFICIENT_DISTINCT_CONTENT` | both public websites resolve to the same host (near-duplicate listings) |
| `ERROR_STATE` | caller reports a fetch failure |

A pair of two company-SEO-eligible listings is enough comparative value even with limited community reports. Demo pairs never qualify for index/sitemap.

### Product-valid vs SEO-eligible

`isValidRelatedComparison(companyA, companyB)` / `comparisonProductValidity()` is the **product** gate for related chips and company-page comparison links.

| | Shown to users | Indexed + sitemap |
| --- | --- | --- |
| Product-valid, including demo | Yes | No, unless also SEO-eligible |
| SEO-eligible (`comparisonSEOEligibility().indexable` and listed) | Yes | Yes |

Product blockers (not `DEMO_ONLY`): `SAME_COMPANY`, `INVALID_PAIR`, `PRIVATE`, `INSUFFICIENT_COMPARISON_DATA`, `INSUFFICIENT_DISTINCT_CONTENT`, `ERROR_STATE`. Invalid slugs are `INVALID_PAIR`.

Related chips still come only from `similarCompanies` (API cap 6, UI cap 4). This does not generate all company combinations.

### Sitemap pair selection (programmatic safety)

A comparison URL may exist as a 200 page without entering the search architecture.

Sitemap pairs are **not** all combinations:

- both companies already pass `companySEOEligibility().includeInSitemap`
- they **share a work domain** (opportunities or pay reports)
- max **3 pairs per company**
- max **40** comparisons total
- only the canonical slug (never both pair orders)

Today every live company is demo, so the comparisons list is empty.

---

## 7. Demo vs future real data

| | Current demo pair (e.g. Mercor vs Outlier) | Future real eligible pair |
| --- | --- | --- |
| User access | Yes, if the companies exist | Yes |
| DEMO badge | Yes | No |
| robots | `noindex, follow` | `index, follow` |
| sitemap | Excluded | Included (if selected) |
| JSON-LD metrics | None | Still no ratings |
| Evidence contrast copy | Not shown as real intelligence | Dimension-level “currently reports higher …” only when both values exist |

---

## 8. Metadata

Eligible / ineligible share the same title pattern; robots differ.

**Title:** `{Company A} vs {Company B}: Pay, Tasks, Reviews & Stability | Happy Tasking`

Example: `Mercor vs Outlier: Pay, Tasks, Reviews & Stability | Happy Tasking`

**Description:** Compare {A} and {B} using community-reported pay, task availability, stability, contributor experiences and AI-work intelligence from Happy Tasking. Demo adds: `Illustrative demo data — not production metrics.`

**Canonical:** `https://happytasking.com/compare/{canonicalComparisonSlug}`

Open Graph and Twitter/X use the same title, description, and canonical URL. They do not inherit homepage metadata.

---

## 9. Semantic page (SSR)

H1: `{Company A} vs {Company B}: AI Work Comparison`

Intro states that Happy Tasking does not declare a universal winner.

H2s render only when there is something to show:

Quick Comparison · TaskScore · Pay · Task Availability · Project Stability · Payment Reliability · Reviewer Fairness · Guideline Clarity · Support · Transparency · Contributor Experience · Issues & Resolution (non-demo resolution only) · Which Company Fits You Better? · Explore {A} · Explore {B} · Related Comparisons (capped, similar-company pairs) · Find AI Work That Matches Your Skills

Missing metrics: **Not enough data**. Never coerced to `0`.

Sample size, verified count, confidence, and measurement window are shown when the score payload includes them.

TaskMatch CTA: “Find companies that match your skills” → `/taskmatch`. Also `/methodology`, `/companies`, `/compare` (tool).

---

## 10. Internal linking

| From | To | Anchor |
| --- | --- | --- |
| Comparison | `/companies/{a}`, `/companies/{b}` | “{Name} reviews, pay and task availability” |
| Comparison | `/companies`, `/taskmatch`, `/methodology`, `/compare` | Descriptive |
| Company page | `/compare/{canonical}` | “Compare {A} and {B}” |
| Company page | `/compare?a={slug}` | “Open the comparison tool” |
| Hub chips | `/compare/{canonical}` | Popular pair labels |

Related comparisons: at most four pairs from `similarCompanies`. Each chip must pass `isValidRelatedComparison()` (product-valid). Canonical order, no self-pair, no giant grids.

**Product-valid** (may show to users): both companies are public listings that can render a meaningful comparison. Demo pairs are allowed.

**SEO-eligible** (may index + sitemap): product-valid **and** `comparisonSEOEligibility().indexable` **and** listed in the sitemap. Demo stays `noindex`.

---

## 11. Structured data

Used: existing site `Organization` + `WebSite` (root) + page `BreadcrumbList` (Home → Compare → {A} vs {B}).

**Not used:** `aggregateRating`, `Review`, `Product`, TaskScore in JSON-LD. Demo metrics never appear in JSON-LD.

---

## 12. Error states

| URL | Behavior |
| --- | --- |
| `/compare/outlier-vs-outlier` | HTTP 404, `noindex` |
| `/compare/fake-company-vs-mercor` | HTTP 404, `noindex` |
| Unparsable slug | HTTP 404 |
| Backend failure | Throws (not an empty fake comparison) |

These are not soft-404 HTTP 200 pages.

---

## 13. Search Console validation

| URL | Crawl | Fetch | Index | Notes |
| --- | --- | --- | --- | --- |
| `/compare` | Yes | Successful | Yes | Hub; DEMO labels OK |
| `/compare/mercor-vs-outlier` | Yes | Successful | **No** | `noindex` because current data is demo; absent from sitemap |
| `/compare/outlier-vs-mercor` | Follow 308 | — | — | Canonical is `mercor-vs-outlier` |
| `/compare?a=outlier&b=mercor` | Follow 308 | — | — | Same canonical landing |
| Future real eligible pair | Yes | Successful | Yes | Self canonical; in sitemap.xml |

Do not request indexing of demo comparison URLs.

---

## 14. Validation checklist

- [x] Canonical order is alphabetical and stable
- [x] Reversed pair redirects (page `permanentRedirect` 308)
- [x] Same-company / invalid → 404
- [x] Demo → noindex, not in sitemap
- [x] Real eligible pair → index + sitemap (unit)
- [x] Comparison-specific title / canonical / OG / Twitter
- [x] Missing metrics are “Not enough data”, not 0
- [x] `/compare` hub unchanged and still in static sitemap
- [x] Query two-company URLs collapse to the landing
- [x] No N×(N−1)/2 sitemap explosion
- [x] Lint, typecheck, server tests, isolated production build

---

## 15. Remaining risks

- Every live company is still demo, so Google will keep seeing `noindex` on comparison landings until real rows exist.
- Eligibility helpers are duplicated on server and web; tests on both sides must stay aligned.
- Related comparison chips use `similarCompanies` (max 6 from the API, max 4 shown) and `isValidRelatedComparison()`. They are not gated on sitemap eligibility. Demo pairs may appear in the UI and stay `noindex`.
- A two-company refresh of `/compare?a=&b=` now lands on the permalink instead of the interactive hub (by design). The hub remains at `/compare` and `/compare?a={one}`.
- Next.js `error.tsx` can still be HTTP 200 on backend failure; copy must not look like an empty successful comparison.
