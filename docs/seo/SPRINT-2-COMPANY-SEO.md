# Sprint 2 — Company SEO engine

**Goal:** Make `/companies/[slug]` a high-quality, server-rendered company intelligence page that becomes SEO-ready automatically when it has legitimate public/real data.

**Canonical origin:** `https://happytasking.com`  
**Site name:** Happy Tasking  
**Tagline:** Know before you task.

Sprint 0 and Sprint 1 remain in force. This sprint does not flip demo company pages to indexable, add demo URLs to the sitemap, or publish demo metrics as genuine community intelligence.

Do not start Sprint 3 (comparison SEO engine, guides, large editorial content).

---

## 1. Audit (before this sprint)

| Surface | Before | Gap |
| --- | --- | --- |
| `/companies/[slug]` HTML | Server Component loads the company, then a client dashboard hydrates | Name/description were in the RSC payload, but H1 was the bare name; reviews, similar companies, and semantic H2s were client-only or missing |
| Metadata | `{Name} reviews, pay and task availability` + `· Happy Tasking`; demo title tagged `(demo data)` | Need `{Name} Reviews, Pay & Task Availability \| Happy Tasking` with matching OG/Twitter |
| Eligibility | API sitemap + `mayIndexListedResource()` + `isDemo` lock; content helper required 40-char description **or** any real review/pay/availability/opportunity/issue | Needed a named `companySEOEligibility()` with reasons, website as a public-identity signal, and no “10 reviews” rule |
| Demo pages | `noindex, follow`; excluded from sitemap | Keep |
| JSON-LD | Site Organization + WebSite in root; BreadcrumbList on the page | No listed-company Organization; must not add AggregateRating/Review |
| Similar / compare | Compare link in the dashboard only | No similar-company list; no descriptive compare links |
| Reviews | Client fetch in a tab | Google had to run JS to see review bodies |
| Official vs community | Mixed in one overview | No source labels |
| 404 | HTTP 404, `noindex`, no `/companies` canonical | Keep |

All current production companies remain `isDemo: true`. Community metrics on those pages are seed/demo.

---

## 2. Eligibility rule

`companySEOEligibility(input)` is the company-detail decision. It returns:

```
{ indexable: boolean, includeInSitemap: boolean, reasons: string[] }
```

`indexable` and `includeInSitemap` are always equal. A URL must not be `noindex` and in the sitemap.

### Reasons (blockers)

| Reason | When |
| --- | --- |
| `DEMO_ONLY` | `isDemo === true` |
| `PRIVATE` | `companyStatus` is set and is not `ACTIVE` |
| `INVALID_COMPANY` | missing name or slug |
| `ERROR_STATE` | core fetch failed (callers pass this; they must not render a fake empty scorecard) |
| `INSUFFICIENT_CONTENT` | no unique public identity **and** no real community evidence |
| `INSUFFICIENT_REAL_DATA` | placeholder description (name-only copy), no public website, no community evidence |

### What counts as unique public identity (no review-count floor)

- Description ≥ 40 characters, **or**
- Public `http(s)` website that is not localhost / IP / preview host, **and** description ≥ 20 characters

### What counts as real community evidence

Any of: non-demo reviews, pay reports, availability reports, active non-demo opportunities, public non-demo issues. **One** real review is enough. There is no “must have 10 reviews” rule.

### Transition (data-driven, not per-company code)

```
DEMO                → noindex, follow; excluded from sitemap  (DEMO_ONLY)
REAL PUBLIC IDENTITY → potentially indexable if not thin
REAL COMMUNITY DATA  → richer sections + metadata still company-specific
SEO ELIGIBLE         → index, follow + sitemap  (no blockers)
```

The API sitemap (`GET /api/v1/sitemap`) uses this function. The company page uses the same function (or the `seo` object on the company payload) **and** the Sprint 1 `mayIndexListedResource()` lock so a sitemap bug cannot index demo intelligence.

---

## 3. What was implemented

- `companySEOEligibility()` on server (`companySeo.eligibility.ts`) and web (`companySeo.ts`) — keep these in sync
- Sitemap company rows go through `includeInSitemap`
- Company API adds `workDomains`, `similarCompanies`, `resolution` (omitted for demo), `seoEvidence`, `seo`
- Company page metadata: title/description/OG/Twitter/canonical via `companyPageMetadata()`
- Server-rendered `CompanyIntelligence`: semantic H1/H2s, official vs community labels, sample sizes, first-page reviews, similar companies, compare links to the existing `/compare` tool, TaskMatch CTA
- Listed-company Organization JSON-LD **only** when indexable and not demo; no ratings/reviews/TaskScore in JSON-LD
- Existing BreadcrumbList unchanged (Home → Companies → {Name})
- Interactive dashboard remains below as “Explore the data” (h3s), not a second H1
- Empty sections omitted
- Demo resolution metrics omitted (not published as real)
- Invalid slug still HTTP 404 / noindex / no directory canonical

---

## 4. Structured data policy

Used:

- Site `Organization` + `WebSite` (Sprint 1, root layout)
- `BreadcrumbList` (existing)
- Listed-company `Organization` when SEO-eligible (name, url, description only)

**Not used:** `aggregateRating`, `Review`, `ratingValue`. TaskScore is a composite 0–100 community score, often demo, and is not a Google star rating. When policy is uncertain, we do not add it.

---

## 5. Manual Google Search Console checks

After a real (non-demo) company exists:

| URL | Crawl allowed | Fetch | Indexing allowed | Notes |
| --- | --- | --- | --- | --- |
| `/companies` | Yes | Successful | Yes | Directory; DEMO labels OK |
| `/companies/{demo-slug}` | Yes | Successful | **No** | Reason: `noindex`. Do not request indexing |
| `/companies/{eligible-real-slug}` | Yes | Successful | Yes | Only after eligibility is true and the slug is in sitemap.xml |

Do not request indexing of demo company URLs.

---

## 6. Validation checklist

- [ ] Demo company remains `noindex, follow`
- [ ] Demo company absent from sitemap
- [ ] Real eligible company is indexable (unit-tested; none live yet)
- [ ] Real eligible company enters sitemap when data says so
- [ ] Invalid slug HTTP 404
- [ ] Title is `{Name} Reviews, Pay & Task Availability \| Happy Tasking`
- [ ] Canonical is `https://happytasking.com/companies/{slug}`
- [ ] OG title is company-specific
- [ ] SSR HTML contains company name and H1
- [ ] Empty sections do not render
- [ ] Demo metrics do not appear in structured data
- [ ] Eligibility reasons are deterministic
- [ ] Lint, typecheck, server tests, isolated production build

---

## 7. Remaining risks

- Every live company is still demo, so Google will keep seeing `noindex` on detail URLs until real rows exist.
- Reviews tab after the first page is still client-paginated; the first eight review bodies are in the initial HTML.
- `/compare?a=&b=` is the existing tool, not a Sprint 3 comparison landing page.
- Next.js `error.tsx` can still be HTTP 200 on backend failure; copy states it is a fetch failure, not an empty scorecard.
- Eligibility logic is duplicated on server and web; tests on both sides must stay aligned.
