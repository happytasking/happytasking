# Sprint 0 — Crawlability

**Goal:** Make all important public Happy Tasking pages reliably crawlable and indexable by Google.

**Live origin:** `https://happytasking.com`  
**Audit date:** 26 August 2026  
Reviewed and approved 26 August 2026. Live after production `npm run build` and `happytasking-web` restart.

This sprint does **not**:

- whitelist Googlebot
- cloak (different HTML for Google vs humans)
- fabricate companies, metrics, discussions, issues, or opportunities
- treat a backend failure as an empty success page (`0 companies`, empty market, empty community)

---

## 1. `/companies` soft 404 — root cause (fixed before broader SEO)

Google Search Console Live Inspection reported `/companies` as a **soft 404**. The screenshot showed **“0 companies”** and **“Unexpected response from the server (HTTP 499).”**

This was **not** “Google cannot call the API.” The company API is healthy for anonymous and Googlebot-like clients (~25–90 ms, HTTP 200, 16 companies).

### What actually happened

1. `/companies` was a client-only shell. The first HTML had no company names.
2. `robots.txt` correctly `Disallow: /api/`.
3. Google’s inspection tool loaded the page, JS, and CSS, and **never requested** `/api/v1/companies`.
4. The UI treated a failed/aborted fetch as an **empty list** (`0 companies`).
5. Non-JSON / aborted responses were mapped to `Unexpected response from the server (HTTP ${status})`.
6. **HTTP 499 is nginx “client closed connection”**, not an API status the app returned. The crawler (or the browser tab) hung up before the API call completed; the UI still rendered a 200 HTML page that looked empty.

### Fix (already shipped, commit `a4d2a6b`)

- `/companies` and `/companies/[slug]` server-render from `API_PROXY_ORIGIN` (`http://127.0.0.1:5000`). Google does not need `/api/` through robots or Cloudflare to see names.
- API failure **throws**. The directory `error.tsx` says the directory is temporarily unavailable — it does **not** say “0 companies”.
- Missing slugs return **HTTP 404** via `notFound()`.
- Demo **detail** pages are `noindex, follow` until non-demo records exist. The directory itself stays indexable and labels DEMO data.
- `robots.txt` still disallows `/api/`. That remains correct **after** SSR.

This sprint keeps that pattern and applies it to the other SEO-critical public routes.

---

## 2. Rules used

| Rule | How it is applied |
| --- | --- |
| Public SEO content is not JS-only | Server Components fetch via `serverApi()` and pass `initial` into client islands |
| No Googlebot special-case | Same HTML for every UA; local API fetch is server-side, not UA-branched |
| No cloaking | Humans and Google get the same SSR HTML |
| No fabricated data | Empty lists are real empties; demo rows keep `DemoBadge` / demo copy |
| Failures are not empty-success 200s | `serverApi` throws `ServerApiError`; route `error.tsx` explains a fetch failure |
| Canonical host | Hardcoded `https://happytasking.com` in `web/src/lib/site.ts` (`SITE_ORIGIN`) |

**HTTP status caveat:** Next.js App Router `error.tsx` is an error boundary. The document is still often **HTTP 200** with failure copy. That is worse than a real 500, but it is **not** a soft-404 empty directory. Segment `notFound()` **does** return HTTP 404 (verified live for unknown company slugs).

---

## 3. Route audit (production, 26 Aug 2026)

Measurements are from `https://happytasking.com` **before** this sprint’s remaining SSR landed. `/companies` already reflected the earlier fix.

Legend:

- **Auth:** whether a session is required to **see** the page
- **Robots:** `robots.txt` allow/disallow for this path
- **Meta robots:** `<meta name="robots">` in HTML (absent = indexable default)
- **SSR primary:** whether Google-visible initial HTML contained the main entity content (names, titles, stats), not just chrome / placeholders
- **Soft-404 risk:** empty-looking 200, or JS-only body that collapses to “nothing here”

### `/`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~71 ms) |
| Auth | Public |
| Robots | Allowed |
| Meta robots | None (indexable) |
| Canonical | `https://happytasking.com` |
| SSR primary content | **Partial.** H1 “AI work right now” was in HTML. Company names in the document were largely from the search placeholder (“Outlier, Mercor, Turing”), not the leaderboard. Tables/stats waited on client `useEffect` fetches to `/companies`, `/market`, `/market/live`, `/reviews/latest`, `/companies/meta/skills`, `/market/trends`. |
| Client-side dependencies | `HomePage` is `"use client"`. Charts, search, retry. |
| APIs for meaning | `/companies`, `/market`, `/market/live`, `/reviews/latest`, `/companies/meta/skills` (trends optional) |
| Soft-404 behavior | Same class as old `/companies` if JS/API never runs: “— companies tracked”, skeleton rows. Failure copy could surface as `HTTP 499`. |
| Error states | Client `ErrorNote`. Failure did not throw at the document level. |
| This sprint | Server-load `loadHomePage()`. Initial HTML includes live market rows, company names, pulse stats, latest experiences. Fetch failure throws to `app/error.tsx`. |

### `/companies`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~76 ms) |
| Auth | Public |
| Robots | Allowed |
| Meta robots | None (indexable) |
| Canonical | `https://happytasking.com/companies` |
| SSR primary content | **Yes.** H1 “AI Work Companies”; Outlier, Mercor, Turing, Alignerr, DataAnnotation, etc. in HTML (~123 KB). |
| Client-side dependencies | Filters/sort hydrate in `CompaniesDirectory`. |
| APIs for meaning | `/companies`, `/companies/meta/domains` (server `serverApi`) |
| Soft-404 behavior | **Fixed.** Failures are not rendered as “0 companies”. |
| Error states | `companies/error.tsx` — “Company directory is temporarily unavailable”. Unknown slug → **404**. |
| Latency | HTML ~76 ms; upstream companies API ~10–90 ms on loopback. |

### `/companies/[slug]` (example: `/companies/outlier`)

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~80 ms) for known slugs; **404** for unknown slugs |
| Auth | Public |
| Robots | Allowed in `robots.txt` |
| Meta robots | `noindex, follow` while `isDemo` is true (all 16 production companies are currently demo) |
| Canonical | `https://happytasking.com/companies/outlier` |
| SSR primary content | **Yes.** H1 “Outlier” plus company body. |
| Client-side dependencies | Period toggle / extra panels hydrate. |
| APIs for meaning | `/companies/:slug` |
| Soft-404 behavior | Unknown slug is a real 404, not a 200 empty page. Demo pages are deliberately noindex so Google does not treat illustrative records as canonical company results. |
| Error states | `companies/[slug]/error.tsx` for upstream failures; `notFound()` for 404. |

### `/compare`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~55 ms) |
| Auth | Public |
| Robots | Allowed |
| Meta robots | None |
| Canonical | `https://happytasking.com/compare` |
| SSR primary content | **No.** Title was the site default. **No H1.** No company names. `useSearchParams` Suspense fallback was a skeleton. Options loaded in `useEffect`; failures became `setOptions([])`. |
| Client-side dependencies | Entire page client; side-by-side charts after `?a=` / `?b=`. |
| APIs for meaning | `/companies?limit=100`; `/companies/:slug` and `/trends` when sides selected |
| Soft-404 behavior | Thin shell, default title, no H1 — high risk. |
| Error states | Client error note; empty selects on list failure. |
| This sprint | Unique title; server-load company options (and selected sides); failure throws to `compare/error.tsx`. |

### `/market`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~46 ms) |
| Auth | Public |
| Robots | Allowed |
| Meta robots | None |
| Canonical | `https://happytasking.com/market` |
| SSR primary content | **No.** Default title, **no H1**, no stats. `loading === true` first paint was skeletons. |
| Client-side dependencies | Full dashboard client; charts on hydrate. |
| APIs for meaning | `/market`, `/market/trends` (optional) |
| Soft-404 behavior | Empty-looking 200 until JS + API. |
| Error states | “Market unavailable” empty state after client failure (still 200). |
| This sprint | Unique title; SSR dashboard; failure throws to `market/error.tsx`. Demo metrics stay labeled demo. |

### `/community`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~50 ms) |
| Auth | Public (posting can be guest) |
| Robots | Allowed |
| Meta robots | None |
| Canonical | `https://happytasking.com/community` |
| SSR primary content | **No.** Default title, **no H1**, no thread titles. List fetched in `useEffect` (`/community`). |
| Client-side dependencies | Sort tabs, compose form, pagination. |
| APIs for meaning | `/community` |
| Soft-404 behavior | Skeleton / empty list if fetch never runs. Live API has 8 discussions — they were invisible to no-JS crawlers. |
| Error states | Client `ErrorNote`; empty state “No discussions yet” only when the list is actually empty. |
| This sprint | Unique title; SSR thread list; failure throws to `community/error.tsx`. |

### `/issues`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~59 ms) |
| Auth | Public list; some reports stay private until published |
| Robots | Allowed (`/issues/new` is noindex via middleware) |
| Meta robots | None on the list |
| Canonical | `https://happytasking.com/issues` |
| SSR primary content | **No.** Default title, **no H1**, no issue titles. |
| Client-side dependencies | Filters, reporter/company-rep extra rows after auth. |
| APIs for meaning | `/issues` |
| Soft-404 behavior | Same JS-only list risk. Live API has 16 published issues. |
| Error states | Client error / “No published issues” empty state. |
| This sprint | Unique title; SSR public list; failure throws to `issues/error.tsx`. Signed-in company reps still refetch after auth for triage. |

### `/taskmatch`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~59 ms) |
| Auth | **Public landing.** Dashboard matches are personalized after login. List API is `optionalAuth`. |
| Robots | Allowed (`/taskmatch/profile` disallowed) |
| Meta robots | None |
| Canonical | `https://happytasking.com/taskmatch` |
| SSR primary content | **No.** Default title, **no H1.** `useAuth().loading` rendered skeletons, so Google never saw the landing copy. |
| Client-side dependencies | Auth gate, filters, saved/gap endpoints (auth). |
| APIs for meaning | Public: `/taskmatch`. Private: `/taskmatch/gaps`, profile. |
| Soft-404 behavior | Skeleton-only first HTML. |
| Error states | Logged-in empty “No strong matches yet.” |
| This sprint | Unique title; SSR landing + public opportunity cards (demo labeled). Auth loading no longer hides the landing. Logged-in users still hydrate the dashboard. |

### `/manifesto`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~104 ms) |
| Auth | Public |
| Robots | Allowed |
| Meta robots | None |
| Canonical | `https://happytasking.com/manifesto` |
| SSR primary content | **Yes.** H1 “The Happy Tasking Manifesto”; full editorial HTML (~70 KB). |
| Client-side dependencies | None for body |
| APIs | Markdown on the Next server (`readManifestoMarkdown`) |
| Soft-404 behavior | Low |
| Error states | Would fall through to root `error.tsx` if render failed |

### `/methodology`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~64 ms) |
| Auth | Public |
| Robots | Allowed |
| Meta robots | None |
| Canonical | `https://happytasking.com/methodology` |
| SSR primary content | **Yes.** H1 “Context around the numbers”. |
| Client-side dependencies | None for body |
| APIs | None |
| Soft-404 behavior | Low |
| Error states | Root error boundary |

### `/governance`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~62 ms) |
| Auth | Public |
| Robots | Allowed |
| Meta robots | None |
| Canonical | `https://happytasking.com/governance` |
| SSR primary content | **Yes.** H1 “Founder-led today. Community-informed by design.” |
| Client-side dependencies | None for body |
| APIs | None |
| Soft-404 behavior | Low |
| Error states | Root error boundary |

### `/open-source`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~64 ms) |
| Auth | Public |
| Robots | Allowed |
| Meta robots | None |
| Canonical | `https://happytasking.com/open-source` |
| SSR primary content | **Yes.** H1 “Built openly. Improved together.” |
| Client-side dependencies | None for body |
| APIs | None |
| Soft-404 behavior | Low |
| Error states | Root error boundary |

### `/robots.txt`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~97 ms), `text/plain` |
| Auth | Public |
| Generated by | `web/src/app/robots.ts` |
| Live body | Cloudflare **prepends** managed Content-Signals and bot blocks (`GPTBot`, `Google-Extended`, etc.), then our rules: |

```
User-Agent: *
Allow: /
Disallow: /api/
Disallow: /moderation/
Disallow: /onboarding/
Disallow: /profile
Disallow: /taskmatch/profile

Host: https://happytasking.com
Sitemap: https://happytasking.com/sitemap.xml
```

| Field | Finding |
| --- | --- |
| Google search indexing | Cloudflare `Content-Signal: search=yes`. We do **not** add a Googlebot allow for `/api/`. |
| Cloaking | None. Same file for every UA. |
| This sprint | No change. Disallow `/api/` is correct once public pages SSR. |

Private HTML surfaces also send `X-Robots-Tag: noindex, nofollow` from `web/src/middleware.ts` (`/login`, `/register`, `/onboarding`, `/profile`, `/moderation`, `/taskmatch/profile`, `/reviews/new`, `/issues/new`). Verified live: `/login` → `noindex, nofollow`.

### `/sitemap.xml`

| Field | Finding |
| --- | --- |
| HTTP status | 200 (~62 ms) |
| Auth | Public |
| Canonical URLs | All `https://happytasking.com/...` — no localhost, IPs, or preview hosts |
| Static routes included | `/`, `/companies`, `/compare`, `/community`, `/market`, `/issues`, `/taskmatch`, `/about`, `/manifesto`, `/methodology`, `/governance`, `/open-source`, `/for-companies`, `/privacy-for-contributors`, `/terms` |
| Dynamic URLs | Empty while companies / opportunities / skills-without-live-non-demo-opps are demo-only (`server/src/services/sitemap.service.ts`). That is intentional, not a fetch bug. |
| This sprint | No sitemap policy change. |

---

## 4. What this sprint changes in code

| Surface | Change |
| --- | --- |
| `web/src/lib/serverApi.ts` | Generic upstream error copy (not “Company data…”). Failures still throw. |
| `web/src/lib/publicPages.ts` | Cached loaders for home, market, community, issues, TaskMatch, compare |
| `/` | Async server page → `loadHomePage()` → `HomePage initial` |
| `/compare` | Server page + unique metadata; options (and `?a`/`?b` sides) SSR |
| `/market` | Server page + unique metadata; dashboard SSR |
| `/community` | Server page + unique metadata; discussion list SSR |
| `/issues` | Server page + unique metadata; issue list SSR |
| `/taskmatch` | Server page + unique metadata; landing + public opportunity cards SSR; do not block on auth |
| Error UI | Route `error.tsx` files + shared `PublicDataError`. Copy says **unavailable**, not empty. |
| `next.config.ts` | `distDir` honors `NEXT_DIST_DIR` so a verify build does not overwrite live `web/.next` |

Filters, charts, compose forms, and logged-in TaskMatch dashboards stay client-side.

---

## 5. Remaining crawl risks (out of this sprint’s route list, still real)

1. **`/community/[id]`, `/issues/[publicId]`, `/taskmatch/opportunities/[slug]`** are still client-fetched detail pages. Linked from SSR lists, but Google’s first HTML on the detail URL is still a skeleton. Next crawlability sprint should SSR these the same way as `/companies/[slug]`.
2. **All current companies/opportunities are demo.** Directory/list pages are indexable with DEMO labels. Detail company URLs are `noindex, follow`. Sitemap omits demo entities. Do not flip `noindex` off until non-demo records exist.
3. **Next.js `error.tsx` ≈ HTTP 200** with failure copy. Prefer fixing the API over relying on Google to interpret that page.
4. **Cloudflare managed `robots.txt` prefix** can change independently of Next. Recheck if Allow/Disallow ever disappears.
5. **Empty UGC is allowed.** If community or issues are genuinely empty, SSR still has H1 + explanation. That is not a fabricated list; Google may still recrawl.

---

## 6. Validation checklist

Verified **26 Aug 2026** against `NEXT_DIST_DIR=.next-verify` + `next start -p 3010`, then against production after `npm run build` and `systemctl restart happytasking-web`. Live HTML on `https://happytasking.com` matches the origin (`127.0.0.1:3000`).

### Build and quality

- [x] `npm run lint` in `web/` (only pre-existing onboarding hook warning)
- [x] `npx tsc --noEmit` in `web/`
- [x] `NEXT_DIST_DIR=.next-verify npm run build` in `web/` succeeds
- [x] Isolated `next start` does **not** overwrite `/root/happytasking/web/.next`

### HTTP status (verify server :3010)

- [x] `/` `200`
- [x] `/companies` `200`
- [x] `/companies/outlier` `200`
- [x] `/companies/this-company-does-not-exist-xyz` `404`
- [x] `/compare` `200`
- [x] `/market` `200`
- [x] `/community` `200`
- [x] `/issues` `200`
- [x] `/taskmatch` `200`
- [x] `/manifesto` `/methodology` `/governance` `/open-source` `200`
- [x] `/robots.txt` `200`
- [x] `/sitemap.xml` `200`

### Google-visible initial HTML (no JS)

- [x] `/` contains H1 and real company names in the leaderboard/live table, not only the search placeholder (`/` HTML grew ~39 KB → ~121 KB)
- [x] `/companies` contains H1 “AI Work Companies” and multiple company names
- [x] `/compare` contains H1 “Compare companies” and company names in `<option>`s
- [x] `/market` contains H1 “AI Work Market” and pulse/stat labels
- [x] `/community` contains H1 “Community” and real discussion titles
- [x] `/issues` contains H1 “Issues” and real issue titles
- [x] `/taskmatch` contains H1 and opportunity titles (e.g. AI Coding Expert)
- [x] Trust pages still contain their editorial H1s
- [x] No page’s first HTML is “0 companies” or `HTTP 499` because a list fetch failed
- [x] Unique `<title>` on compare / market / community / issues / taskmatch (not only the default tagline)

### robots + sitemap + canonical

- [x] `/robots.txt` still `Allow: /` and `Disallow: /api/`
- [x] `/robots.txt` `Sitemap: https://happytasking.com/sitemap.xml`
- [x] `/sitemap.xml` uses only `https://happytasking.com` loc URLs
- [x] Public pages’ `rel=canonical` is `https://happytasking.com...` — no localhost, `127.0.0.1`, www, or preview hosts (including the :3010 verify server)
- [x] `/login` still `X-Robots-Tag: noindex, nofollow`
- [x] Demo company detail still `noindex, follow`

### Policy

- [x] No Googlebot User-Agent branch
- [x] No extra HTML for crawlers
- [x] Demo data remains labeled; no invented rows to “look full”
- [x] API failure pages do not read as successful empty directories

### Deploy (after review)

- [x] Approved production `npm run build` + `systemctl restart happytasking-web`
- [x] Repeat the HTML/status checks on `https://happytasking.com`
- [ ] Request indexing for `/` `/companies` `/compare` `/market` `/community` `/issues` `/taskmatch` in Search Console
- [ ] Confirm `/companies` Live Inspection is no longer a soft 404
