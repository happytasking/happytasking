# Sprint 1 — Technical SEO foundation

**Goal:** A consistent technical SEO layer on top of Sprint 0 crawlability, without indexing demo/seed intelligence.

**Canonical origin:** `https://happytasking.com`  
**Site name:** Happy Tasking  
**Tagline:** Know before you task.

This file did not exist in the repo when Sprint 1 started. It is the audit, eligibility rules, implementation record, and validation checklist.

Sprint 0 remains in force: public list pages stay server-rendered; `/api/` stays disallowed; demo company intelligence stays `noindex`; demo URLs stay out of the sitemap.

Do not:

- whitelist Googlebot
- cloak
- fabricate organization, social, address, rating, or legal facts
- remove `noindex` from demo company intelligence to make Search Console green
- start Sprint 2 (content depth, article schema, etc.)

---

## 1. Audit vs requirements (before this sprint)

| Requirement | Before | Gap |
| --- | --- | --- |
| `metadataBase` | `https://happytasking.com` in root layout | Keep |
| Title template | `default` + `%s · Happy Tasking` | Keep; some pages still inherited the homepage OG title |
| Meta descriptions | Most public pages had unique copy; `/for-companies` did not | Unique description + OG/Twitter |
| Canonical URLs | `canonicalMetadata()` → happytasking.com | Keep; 404 inherited `/companies` canonical |
| Open Graph | Root card only; child `title` did not replace `og:title` | Per-page OG via `publicPageMetadata()` |
| Twitter/X | Root `summary_large_image`; no fake `@site` | Per-page titles; still no invented handle |
| `robots.txt` | Allow `/`, disallow `/api/` and some private paths | Align disallow list with private prefixes (`/login`, `/register`, …) |
| `sitemap.xml` | Static public routes + `/api/v1/sitemap` (excludes demo) | Same engine must drive robots metadata |
| Favicon / icons | `/brand/logo-mark-*.png`, OG JPG, live 200 | Keep; no fake assets |
| WebSite JSON-LD | Missing | Add |
| Organization JSON-LD | Missing | Add with only real fields (name, url, logo, GitHub `sameAs`) |
| Breadcrumb foundations | Missing | JSON-LD + visible trail on public pages |
| HTTP → HTTPS | Nginx 301 | Keep (ops, not Next) |
| www → apex | Nginx 301 `https://happytasking.com$request_uri` | Keep |
| 404 | Next default; company miss is HTTP 404 | Dedicated copy; `noindex`; no fake empty directory |
| Private noindex | Middleware `X-Robots-Tag`; only some layouts had meta robots | Shared private list + layouts |
| Demo noindex | Company detail only | Also opportunities, skills not in sitemap, demo discussions/issues |
| Sitemap ↔ robots consistency | Sitemap already omitted demo; some noindex URLs were not the issue — **indexable demo opportunity URLs were** | `mayIndexListedResource()` |

### Sprint 0 regression risks

- Do not move `/companies`, `/`, `/market`, `/community`, `/issues`, `/taskmatch`, `/compare` back to client-only fetches.
- Do not allow `/api/` in `robots.txt`.
- Do not add demo company slugs to the sitemap.
- Do not treat API failure as “0 companies”.

---

## 2. Eligibility rule (one decision)

A **resource URL** (`/companies/{slug}`, `/taskmatch/opportunities/{slug}`, `/skills/{slug}`) is indexable **if and only if**:

1. It is included in `GET /api/v1/sitemap` (non-demo, active, enough public content), **and**
2. The record itself is not demo (`isDemo` lock).

That decision drives:

- `<meta name="robots">` / Next `robots`
- sitemap.xml inclusion (the API is the list)

A URL must not be `noindex` **and** listed in the sitemap. Demo company pages stay `noindex, follow` and absent from the sitemap.

**Static public routes** (`/`, `/companies`, `/compare`, …) are the `STATIC_PUBLIC_ROUTES` list. That list is the sitemap static section. Private prefixes never appear there.

**UGC detail URLs** (`/community/{id}`, `/issues/{publicId}`) are not in the sitemap yet (Sprint 2). Demo or non-public ones are `noindex`. Real public ones may be indexed without being in the sitemap — that does not violate the noindex∩sitemap rule.

**Directory, market, homepage** stay indexable even while metrics are demo-labeled. The prohibition is on indexing **demo company intelligence URLs**, not on labeling DEMO in a public directory.

---

## 3. What was implemented

- Shared `publicPageMetadata()` (canonical + description + OG + Twitter + robots)
- Shared `PRIVATE_PREFIXES` for middleware, `robots.txt`, and private layouts
- Shared `loadIndexableLists()` for sitemap.xml and resource `robots`
- WebSite + Organization JSON-LD (GitHub only in `sameAs`; no email/address/ratings)
- Breadcrumb JSON-LD + visible crumbs
- Custom 404 pages (`noindex`)
- Demo/unlisted opportunities and skills `noindex`
- Demo discussions `noindex`; demo or non-public issues `noindex`
- `/for-companies` unique title/description

HTTP/www redirects were already correct in nginx and were left alone.

---

## 4. Validation checklist

### Build and tests

- [x] Isolated `NEXT_DIST_DIR=.next-verify` production build
- [x] `npx tsc --noEmit` in `web/`
- [x] `npm run lint` in `web/`
- [x] `npx tsx src/lib/indexability.test.ts` in `web/`
- [x] `npm test` in `server/` (includes sitemap eligibility)

### Generated metadata (verify server :3010)

- [x] `/` has `metadataBase`-resolved canonical `https://happytasking.com`
- [x] `/compare` OG title is the compare title, not the homepage tagline
- [x] `/companies/outlier` is `noindex, follow` and **not** in `/sitemap.xml`
- [x] `/login` is `noindex, nofollow` (meta and `X-Robots-Tag`)
- [x] JSON-LD `@graph` has Organization + WebSite; SearchAction target is `/companies?search={search_term_string}`
- [x] BreadcrumbList present on `/companies`
- [x] `/robots.txt` disallows `/api/` and private prefixes; sitemap URL is production
- [x] `/sitemap.xml` loc URLs are only `https://happytasking.com/...` (15 static URLs; no demo companies)
- [x] Unknown company slug is HTTP 404, `noindex`, not an empty scorecard
- [x] Favicon / OG image still 200 on production origin

### Google Search Console (after deploy)

- [ ] Confirm `/companies` inspection still succeeds (Sprint 0)
- [ ] URL inspection `/companies/{demo-slug}`: crawled, **excluded as noindex** (expected)
- [ ] Do not request indexing of demo company URLs
- [ ] Sitemaps: `https://happytasking.com/sitemap.xml` — only indexable URLs
- [ ] Enhancement: Logo / sitelinks once JSON-LD is live; ignore missing Organization extras we did not invent

### Policy

- [ ] No Googlebot UA branch
- [ ] No demo rows added to the sitemap
- [ ] No fabricated `sameAs` profiles
