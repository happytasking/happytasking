# Sprint 4.5 — TaskMatch search landing & product intent

**Status:** Audit + plan. **Not implemented.** Wait for approval before any code change.  
**When:** After SEO Research v1 (`docs/seo/keyword-research/`, commit `2d21a10`). **Before Sprint 5.**  
**Canonical origin:** `https://happytasking.com`  
**Site:** Happy Tasking — Know before you task.  
**Primary URL:** `/taskmatch`  
**Audit date:** 26 August 2026 (code + live production HTML)

This sprint exists because SEO Research v1 assigned **generic transactional job intent** to TaskMatch (`ai training jobs` and cluster) and recommended **IMPROVE PRODUCT** — not a second jobs URL.

Do not:

- implement in this document pass
- modify application code, schema, or dependencies
- publish a Guide
- create `/ai-training-jobs`, `/jobs`, `/taskmatch/remote`, `/taskmatch/coding`, `/taskmatch/evaluator`, `/taskmatch/trainer`
- fabricate jobs, pay, TaskPulse, match scores, or timestamps
- emit `JobPosting` / `aggregateRating` JSON-LD
- start Sprint 5’s internal-linking engine
- commit or deploy from this audit

---

## 1. Executive summary

`/taskmatch` is already the **correct canonical** for generic AI-work job searches. It is indexable, in the sitemap, server-rendered for anonymous visitors, and linked from nav/footer.

It does **not** yet behave like a search landing for that intent.

Live production (`https://happytasking.com/taskmatch`, 26 August 2026):

- Title: `TaskMatch · Happy Tasking`
- H1: `One profile. Better AI-work matches.`
- Robots: `index, follow`
- Canonical: `https://happytasking.com/taskmatch`
- SSR shows **six DEMO opportunity cards** (Mercor, Alignerr, Surge AI, Outlier, DataAnnotation, Turing) with listed pay and **opportunity-quality percentages** (example: Mercor “AI Coding Expert” quality **85%**, match **—**)
- Opportunity detail URLs are **not** in the sitemap (correct: all listings `isDemo: true`)
- No `JobPosting` JSON-LD (correct)

The product already has a dual-score matching engine, filters (logged-in only), save/journey workflow, and company-level TaskPulse. The gap is not “missing filters.” Competitors already combine jobs + filters + apply links. Happy Tasking’s differentiation is **listing facts + profile match + independent company intelligence**, with open jobs kept distinct from task availability.

**Recommendation: GO WITH CONDITIONS.** Ship a stronger `/taskmatch` landing and honest empty/demo states. Do not treat demo listings or demo-derived quality/TaskPulse as indexable evidence of live hiring.

---

## 2. Current architecture audit

Live and code findings. Nothing here is a volume estimate.

### 2.1 Route architecture

| Route | Kind | Auth | Notes |
| --- | --- | --- | --- |
| `/taskmatch` | Public hub | Optional | Indexable. Anonymous landing vs logged-in dashboard on the **same URL** |
| `/taskmatch/opportunities/[slug]` | Public detail | Optional | Metadata in `layout.tsx`; **body is client-fetched** |
| `/taskmatch/profile` | Private | Required | `privatePageMetadata()`; middleware `noindex, nofollow` |
| `/skills/[slug]` | Public skill listings | Optional | Body client-fetched; indexable only if sitemap lists the skill (needs non-demo opportunities) |
| `/onboarding` | Private | Required (redirects to `/register`) | Profile bootstrap, then CTA to TaskMatch |
| `/moderation/opportunities` | Staff | Moderator | Create / verify / close listings |

API (`/api/v1/taskmatch`, Express):

- `GET /` — `optionalAuth` — list + score
- `GET /opportunities/:slug` — `optionalAuth`
- `GET /gaps`, `/profile`, `/saved`, `GET /company/:slug`, save/status — `requireAuth`
- Admin CRUD + verify/close — moderator

**Do not add** `/jobs`, `/ai-training-jobs`, or role-sliced TaskMatch paths in this sprint.

### 2.2 Server / client rendering

| Surface | Rendering |
| --- | --- |
| `/taskmatch` | Server page (`revalidate = 120`) calls `loadPublicTaskMatch()` → `GET /taskmatch?sort=recommended`. Client `TaskMatchPage` SSR-renders **Landing** when `useAuth().user` is null (Googlebot path). Logged-in users skip `initial` and client-fetch a personalized dashboard |
| Opportunity detail | Layout generates metadata; page is `"use client"` and loads after mount. Sprint 0 leftover |
| Skill pages | Same client-fetch leftover |

Anonymous SSR **does** include H1, intro, CTAs, and opportunity cards. Confirmed in production HTML.

### 2.3 Current H1

| Audience | H1 |
| --- | --- |
| Anonymous (crawlers) | `One profile. Better AI-work matches.` |
| Logged-in | `Find the AI work that fits you.` |

Eyebrow: `TaskMatch`. The anonymous H1 is product-matching copy, not transactional job-intent copy.

### 2.4 Metadata

From `web/src/app/taskmatch/page.tsx` via `publicPageMetadata()`:

| Field | Current |
| --- | --- |
| Title | `TaskMatch` → template `TaskMatch · Happy Tasking` |
| Description | “Find where your AI skills fit best. TaskMatch estimates role fit and, separately, whether an opportunity looks worth pursuing using independent Happy Tasking intelligence.” |
| OG/Twitter | Same title/description; shared `/brand/og-image.jpg` |
| Language / locale | `en` / `en_US` (root layout) |

### 2.5 Canonical

`https://happytasking.com/taskmatch` (hardcoded origin in `web/src/lib/site.ts`). No trailing-slash duplicate for this path.

### 2.6 robots / indexability

| Rule | Status |
| --- | --- |
| `/taskmatch` | `index, follow` (default `publicPageMetadata`) |
| `/taskmatch` in `STATIC_PUBLIC_ROUTES` | Yes, sitemap priority **0.9**, changeFrequency **daily** |
| `/taskmatch/profile` | Private prefix; `X-Robots-Tag: noindex, nofollow` |
| Opportunity URLs | `mayIndexListedResource("opportunities", slug, isDemo)` — demo → never index |
| `robots.ts` | Allows `/`; disallows `/api/` and private prefixes. Does **not** disallow `/taskmatch` |

### 2.7 Sitemap

- Hub: `https://happytasking.com/taskmatch` present.
- Opportunity URLs: **none** in production sitemap (all seed listings `isDemo: true`; `indexableOpportunities()` requires `isDemo: false` and a non-demo active company).
- Skill URLs: only if a non-demo active opportunity references the skill — currently none expected.

### 2.8 SSR-visible content (production)

Confirmed in HTML:

- Breadcrumbs Home / TaskMatch + BreadcrumbList JSON-LD
- Site Organization + WebSite JSON-LD (root layout)
- Hero + register/login
- “Current opportunities” + six demo cards with DEMO badges
- DualScore: match `—`, quality numeric (e.g. 85%)
- Pay ranges, Availability pill, TaskScore
- “View match” / “How to apply” links
- **No** domain/skill filters on the anonymous tree
- **No** JobPosting schema

### 2.9 Opportunities data source

Prisma `Opportunity` (+ skills, domains, languages). Public list: `listMatches()` in `server/src/services/taskmatch.service.ts`. Seed: `server/prisma/taskmatch-seed.ts`. Moderators can create rows via `/moderation/opportunities`.

`sourceType`: `ADMIN` | `PUBLIC_LISTING` | `COMPANY_SUBMITTED` | `COMMUNITY_REPORTED`. Mapped labels already exist (`Official public listing`, `Company-submitted`, `Community reported`, `Happy Tasking curated`).

### 2.10 DEMO vs REAL

**All current production listings are DEMO** (`isDemo: true` in seed). All production companies remain `isDemo: true`.

The hub is still **indexable** and SSR includes those cards. DemoBadge copy: “Illustrative demo data — not production metrics.” Pay, quality %, and TaskPulse still appear as numbers next to the badge.

Demo data must never become indexable evidence. Today it is visually labeled, but it is still the primary catalog Google sees for a jobs-intent URL.

### 2.11 Filtering architecture

API query (`matchQuerySchema`): `domain`, `skill`, `company`, `country`, `pulse`, `minTaskScore`, `minQuality`, `minRate`, `paymentModel`, `workload`, `includeWorkedWith`, `sort`, `limit`.

Logged-in UI exposes: domain, skill, sort, TaskPulse, min TaskScore, include-worked-with. **Not** exposed: country, pay floor, payment model, company (query param exists; `CompanyMatches` links `?company=`).

Anonymous landing: **no filters**.

Sort: `recommended` (0.6 match + 0.4 quality), `match`, `quality`, `pay`, `taskscore`, `newest`, `verified`. For anonymous users, match is null so recommended ≈ quality.

Pulse filter values: `HIGH` | `MODERATE` | `LOW` | `NO_TASKS` — **company TaskPulse**, not “this listing is hiring.”

### 2.12 User-profile matching architecture

`computeCandidateMatch()` (`server/src/lib/taskmatch.ts`): weighted skills 0.4, experience 0.2, language/country/availability/rate 0.1 each (overridable via `platformSetting` `taskmatchWeights`).

Outputs: score 0–100 or null, dimension scores, match/gap reasons, available dimension count. `matchConfidence` is LOW/MODERATE/HIGH from profile completeness, opportunity completeness, and verification age — **not** a guarantee.

Anonymous list: `candidateMatch` is **null**. Cards still show DualScore with match `—`.

Do not invent a second public “match %” for anonymous visitors.

### 2.13 Authentication requirements

Browsing `/taskmatch` and opportunity HTML: **not required**. Save, journey status, gaps, profile edit, company-match strip: **required**. Onboarding: required (unauthenticated → `/register`).

### 2.14 Anonymous-user experience

Hero (matching, not jobs) → immediate Register / Log in → demo “Current opportunities” → opportunity detail (client) with apply URL. No browse-by-domain, no “why this is not a job board,” no links to `/guides`, `/market`, `/compare`, `/issues`. Company name on the card is **not** a link (detail page does link).

### 2.15 Internal links

| From | To TaskMatch |
| --- | --- |
| Nav (desktop + mobile) | `/taskmatch` |
| Footer Product | `/taskmatch` |
| Guides hub + article CTA | `/taskmatch` |
| Company intelligence `taskmatch` section | `/taskmatch` (generic, not `{company} jobs`) |
| Comparison intelligence | `/taskmatch` |
| Skill pages | back to `/taskmatch` |
| Onboarding done | `/taskmatch` |
| Profile | `/taskmatch` + `/taskmatch/profile` |

Logged-in TaskMatch → `/taskmatch/profile`, `/skills/{slug}`. Cards → opportunity detail. Detail → `/companies/{slug}`. **No** TaskMatch links to `/compare`, `/guides`, `/market`, `/issues`.

### 2.16 Company links

Detail: company name → `/companies/{slug}`, “Company reputation.” Cards: company name is plain text. `CompanyMatches` on company pages is **logged-in only** and hits `GET /taskmatch/company/:slug`.

Company-specific job intent stays on `/companies/{slug}` (Research v1). TaskMatch must not rank `dataannotation jobs` / `mercor jobs`.

### 2.17 Structured data

| Type | Present on `/taskmatch`? |
| --- | --- |
| Organization + WebSite | Yes (root) |
| BreadcrumbList | Yes |
| JobPosting | **No** |
| ItemList of jobs | **No** |
| aggregateRating | **No** |

Opportunity pages: BreadcrumbList in layout (third crumb is labeled “Opportunity” but `path` is `/taskmatch` — weak). No JobPosting.

### 2.18 Empty / error states

| State | Behavior |
| --- | --- |
| Anonymous, zero listings | `EmptyState`: “No public opportunities yet” |
| Logged-in, zero matches | “No strong matches yet” + profile CTAs |
| Hub fetch failure | `taskmatch/error.tsx` — distinguishes outage from empty catalog |
| Opportunity 404 | EmptyState + back to TaskMatch |

Production is **not** empty; it is a demo catalog.

### 2.19 Mobile behavior

Not separately instrumented. Patterns: `container-page`, `flex-wrap`, `min-h-11` on primary landing CTAs, sticky nav with hamburger `< md`. Filter grid is `sm:grid-cols-2 lg:grid-cols-3`. DualScore is two columns on all widths. No dedicated mobile TaskMatch layout.

### 2.20 Accessibility

- Breadcrumb `nav aria-label="Breadcrumb"`
- Landing CTAs `min-h-11`
- Filter `<label>` + `<select>`
- Opportunity loading `role="status"`
- AvailabilityPill `title` for trend; DEMO badge has title
- DualScore match `—` is not announced as “unavailable”
- Opportunity card company name is not a link (keyboard users skip company intelligence)
- Logged-in “Include companies I have worked with” checkbox has no explicit `id`/`htmlFor` pairing beyond wrapping `<label>`

### 2.21 Analytics / event hooks

| Event | When | Auth |
| --- | --- | --- |
| `pageview` | `PageViewTracker` on path change | Any |
| `taskmatch_opened` | `listMatches` when `userId` set | Logged-in only |
| `opportunity_viewed` | Opportunity detail load | Logged-in only |
| `opportunity_saved` | Save | Logged-in |
| `profile_gap_viewed` | Gaps | Logged-in |
| `apply_clicked` | Public apply button via `POST /profile/events` | Fired from client; profile events typically need auth |
| Named marketing page events | Manifesto etc. — **not** TaskMatch | — |

No anonymous `taskmatch_landing_viewed` or filter-change events.

---

## 3. Search-intent findings

Evidence classes from Research v1. **Ads Competition is advertising competition, not organic SEO difficulty.** Organic difficulty is **UNKNOWN**. Do not convert UNKNOWN to zero.

### VERIFIED KEYWORD PLANNER DATA

Period: **1 August 2025 – 31 July 2026**. US / English CSV exports. Rounded directional demand, not a traffic forecast.

| Query | Avg monthly searches | YoY | Ads competition | Owner |
| --- | --- | --- | --- | --- |
| `ai training jobs` | **50,000** | **+900%** | Medium | `/taskmatch` PRIMARY |
| `remote ai training jobs` | **5,000** | UNKNOWN | Medium | `/taskmatch` PRIMARY |
| `ai trainer jobs` | **5,000** | UNKNOWN | Low | `/taskmatch` PRIMARY |
| `ai coding jobs` | **500** | UNKNOWN | Medium | `/taskmatch` PRIMARY |
| `ai evaluator jobs` | **500** | UNKNOWN | Medium | `/taskmatch` PRIMARY |
| `llm evaluator jobs` | **50** | UNKNOWN | Low | Supporting long-tail on `/taskmatch` |
| `ai work from home` | **500** | **+900%** | Medium | Supporting / emerging — **monitor** |

Not TaskMatch-primary (unchanged):

| Query | Volume | Owner |
| --- | --- | --- |
| `dataannotation jobs` | 50,000 | `/companies/dataannotation` |
| `mercor jobs` | 5,000 | `/companies/mercor` |
| `what is an ai trainer` | 500 | `/guides/what-is-an-ai-trainer` (not created) |
| `mercor vs dataannotation` | **UNKNOWN** | Compare when eligible |

### OBSERVED SERP EVIDENCE

Generic `… jobs` strings: **find available work** (HIGH). SERPs are job boards, aggregators, role landings, and hybrid guide+jobs pages.

### INTERNAL STRATEGIC ASSESSMENT

One page + cluster. Ranks 1 and 4–7 in FIRST-10 share `/taskmatch`. Action: **IMPROVE PRODUCT**.

---

## 4. Competitive gap

Transactional AI-training-job SERPs already offer some mix of: live jobs, platform name, pay, country, skill/domain filters, apply links, freshness, matching, platform profiles.

**Jobs + filters + matching is table stakes**, not a differentiator.

Happy Tasking can occupy a different SERP promise: *this opening, plus whether the platform is worth your time* — if listing facts and community facts stay on **separate trust levels**, and if open jobs are not confused with TaskPulse.

Until real non-demo listings exist, Happy Tasking cannot honestly compete as a live job board. It can compete as an **honest matching + intelligence product** that will attach to real openings.

---

## 5. Happy Tasking differentiation

Brand tagline (do not replace in this sprint without copy review): **Know before you task.**

Do **not** hard-code “Find the AI work that's actually worth your time.” as a slogan. It is a **strategic concept** for IA and metadata, not approved brand replacement.

TaskMatch should eventually combine:

| Layer | Role |
| --- | --- |
| Public opportunity data | Is this company recruiting for this role? |
| User professional profile | Am I a fit? |
| Matching + explanations | Honest scores only when the profile supports them |
| Company intelligence | Reviews, TaskScore |
| Community experience | Issues, tips (public process only) |
| Pay intelligence | Community pay vs listed rate — labeled |
| TaskPulse | Are approved contributors receiving work **now**? |
| Stability / payment reliability | Company-level community |
| Screening / application intelligence | Public process + community-reported difficulty, never leaks |

**Critical distinction**

- **Open job** = recruiting signal on an opportunity row (`status`, `applicationUrl`, `lastVerifiedAt`).
- **Task availability** = community TaskPulse / `TaskAvailabilityReport` (are people getting tasks).

Do not conflate. A card must not use a TaskPulse pill as proof that the listing is a live job, or a job row as proof that the queue is active.

---

## 6. Current real-data inventory

What the **schema and engine already support**. Production values today are almost entirely demo/seed.

### Opportunity row (supportable fields)

| Field | In schema / API today | On card today | Production reality |
| --- | --- | --- | --- |
| Role title | Yes | Yes | Demo titles |
| Company | Yes | Name, no link | Demo companies |
| Source type + label | Yes | No (detail only) | Seed `PUBLIC_LISTING` / `COMMUNITY_REPORTED` |
| Source URL | Yes | No (detail only) | Public marketing URLs |
| Pay min/max | Yes | Yes if present | Demo ranges |
| Pay unit / currency / model | Yes | Unit implied `/h` | Hourly USD in seed |
| Country eligibility | `countryRestrictions[]` | No | Seed lists / empty = open |
| Remote status | `remoteType` | No | Seed `REMOTE` |
| Required skills | Yes | No | Seed skills |
| Domain | Yes | No | Seed domains exist in catalog |
| Employment/project type | `paymentModel` only — not full-time vs contract | No | Hourly / per-task / milestone / mixed |
| Posted date | `publishedAt` | No | Seed |
| Last verified | `lastVerifiedAt`; stale if > 14 days | Stale note only | Seed dates |
| Application URL | Yes | “How to apply” hash link | Public sites |
| Company intelligence link | Company slug | **Missing on card** | Company pages `noindex` while demo |
| DEMO flag | `isDemo` | DemoBadge | All true |

### Matching / intelligence (engine exists; data may be demo)

| Signal | Engine | Honest for anonymous indexable HTML? |
| --- | --- | --- |
| Candidate match % + reasons | Yes, profile required | No % without a profile (already `—`) |
| Opportunity quality % | Company-level TaskScore + pulse + pay/stability/etc. | **No** while company/reviews are demo — yet production shows 85% |
| TaskScore | Company reviews; null if sample &lt; 5 | Demo reviews can meet the floor |
| TaskPulse | `getTaskPulse()` last 7 days; **does not filter `isDemo` reports** | Not a live-job signal; demo-contaminated |
| Community pay | Pay reports / quality dimension | Demo |
| Stability / payment reliability | Review dimensions | Demo |
| Screening difficulty | `ScreeningReport` aggregate on detail | Demo / empty |
| Match explanation | Reasons array | Only logged-in |

Domain catalog already includes coding, writing, STEM/science/math, languages/translation, healthcare, legal, finance, generalist, data-annotation, research, other. **Do not mint discovery chips unless at least one non-demo listing (or an honest empty label) exists for that domain.**

---

## 7. Missing-data inventory

| Gap | Class |
| --- | --- |
| Non-demo `Opportunity` rows attached to eligible companies | BLOCKER for a live jobs catalog |
| Non-demo companies (eligibility) | BLOCKER for company links as ranking destinations |
| Non-demo reviews / pay / availability reports | BLOCKER for public quality / TaskPulse / TaskScore on cards |
| `getTaskPulse` / `getCompanyTaskScore` excluding demo rows | Trust bug even after some real data exists |
| Opportunity-level availability (vs company-level pulse) | Not in schema — do not fake it |
| Posted-at vs last-verified displayed on cards | Fields exist; UI omits |
| Anonymous country / remote / domain browse | UI missing; only after real taxonomy population |
| Ingestion pipeline (public listing crawl / company submit / community report QA) | Process, not a new URL |
| `JobPosting`-eligible fields (valid hiring org, apply, datePosted, jobLocation) | Do not emit schema until real listings satisfy Google’s rules |
| Published educational Guide for `what is an ai trainer` | Separate FIRST-10 #8; supporting link only |
| Organic keyword difficulty | UNKNOWN — do not invent |

---

## 8. Anonymous UX proposal

Goal: a search visitor can **understand the market and the product** without registering first.

Proposed flow (fit existing panels, eyebrows, `page-title`, `btn-accent`):

1. **Hero** — people-first H1 aligned with job intent + matching, not keyword stuffing. Short intro: listings when real; intelligence always separate. Keep “Know before you task.” in supporting copy if used. **Not** a forced signup wall.
2. **Trust line** — estimated matches ≠ offers; HT does not hire.
3. **Current legitimate opportunities** — non-demo `ACTIVE` listings only in the primary catalog. If none: honest empty state (“We don’t list live openings yet”). Demo rows, if shown at all, in a clearly labeled **illustrative** block that is not the jobs catalog.
4. **Browse / filters** — domain, remote, skill, country **only if** backed by real listing facets. Otherwise omit the control (do not show empty theater).
5. **Role/domain discovery** — chips from domains that have ≥1 real listing (or “no openings in this category yet”). Do not invent a healthcare chip to look complete.
6. **Cards** — see §10. No anonymous match %.
7. **Why TaskMatch is different** — open job vs task availability; listed pay vs community pay; company intelligence. No competitor-bashing.
8. **Company intelligence** — links to `/companies` directory and, when eligible, specific companies **as supporting**, never as `{company} jobs` H1.
9. **How TaskMatch works** — two scores, kept separate; profile optional.
10. **Personalization CTA** — after the catalog, not before: complete profile / register.
11. **Supporting links** — `/guides`, `/market`, `/compare`, `/issues` with non-cannibal anchors.

Keep register/login in the header. Remove the hero as the **only** next step.

---

## 9. Logged-in UX proposal

Keep the dashboard on `/taskmatch` (same canonical). Do not split `/taskmatch/app`.

Add / keep:

- Profile strength + `/taskmatch/profile`
- Personalized order (`recommended` / `match`) using the existing engine
- Match % and “why you match” / gaps **when dimensions exist**; omit rather than show 0 from missing fields
- Quality score **only** from non-demo intelligence with sufficient sample; else “Limited community data”
- Existing save + journey on the detail page
- Filters: keep domain/skill/sort; pulse labeled as **task availability (community), not hiring status**; hide pulse/TaskScore filters if all values would be demo-derived
- Skill-gap module (already exists)

Do not show a high-confidence match from a nearly empty profile (`matchConfidence` already caps this — preserve it).

---

## 10. Opportunity-card data contract proposal

**Listing facts** (opportunity row) vs **community facts** (company intelligence). Never one combined “trust %.”

### Card — listing facts (show if present and non-demo catalog)

- Title (link to detail)
- Company name (link to `/companies/{slug}`)
- DemoBadge if `isDemo` (should not appear in primary indexable catalog)
- Source label + optional source URL
- Pay range + unit, or omit
- Remote type
- Country: “Remote / listed countries” or omit if unspecified (do not invent “worldwide”)
- Domain + required skills (subset)
- Last verified + stale warning
- Apply / how-to-apply (existing)

### Card — community facts (separate row or “Company intelligence” cluster)

- TaskScore or omit
- TaskPulse **labeled** “Contributor task availability (last 7 days)” or omit if no real sample
- Quality score or omit if `insufficient` or demo-derived
- Link: company intelligence

### Card — match (logged-in only)

- Estimated fit % + confidence word
- Up to ~3 match reasons
- Never for anonymous SSR

### Out of card until real

- Screening difficulty
- Payment reliability / stability as unlabeled numbers
- Fake freshness (“updated 3 minutes ago”)

Detail page can keep richer sections; same provenance rules.

---

## 11. Provenance / trust model

Align with existing `sourceLabel()`; do not invent a fourth unnamed source.

| Label | Maps to | Use for |
| --- | --- | --- |
| Official / public listing | `PUBLIC_LISTING` | Sourced job facts |
| Company-submitted | `COMPANY_SUBMITTED` | Sourced job facts |
| Community reported | `COMMUNITY_REPORTED` | Sourced job facts **and** TaskPulse / pay / tips — always named |
| Happy Tasking derived | `ADMIN` / computed TaskScore, quality, match | Scores, not a job existence claim |

Rules:

- Missing metric → omit or “No data,” never zero.
- Demo → not indexable evidence; not in sitemap; not in primary catalog.
- Open job ≠ TaskPulse.
- Listed pay ≠ community pay.
- Match % ≠ hiring probability.
- `lastVerifiedAt` is a verification timestamp, not “posted just now.”

---

## 12. TaskPulse future architecture

**Do not implement fake TaskPulse. Do not finalize a public TaskPulse SEO URL** (`/taskpulse` is out of scope — Research v1).

### What already exists

`TaskAvailabilityReport`: `companyId`, optional `domainId`, `country` / `countryCode`, `reportDate`, `availabilityStatus` (`HIGH` | `MODERATE` | `LOW` | `NO_TASKS`), `verificationStatus`, `isDemo`, optional skills, user id (private).

`getTaskPulse(companyId, { domainId, windowDays = 7 })` averages statuses to one pill + trend vs previous window + `sampleSize`.

### Gaps (do not silently fill)

- No `isDemo: false` filter
- No public confidence / minimum sample (TaskScore has a floor of 5; pulse does not)
- No project-level field (domain is the closest)
- Company-level pulse is reused on every opportunity card
- Status vocabulary is not ACTIVE / MIXED / NO RECENT SIGNAL

### Conceptual mapping (not a rename in 4.5 unless justified)

| Current enum | Concept |
| --- | --- |
| `HIGH` | Active queue signal |
| `MODERATE` | Mixed |
| `LOW` | Low |
| `NO_TASKS` | No tasks reported |
| `availability: null` | **No recent signal** (pill already: “No data”) |

Do **not** ship ACTIVE/MIXED as new enums in this sprint. Revisit when real reports exist.

### Privacy-safe aggregate (recommendation)

- Public pulse: `isDemo: false` only; never user ids
- Minimum sample (propose 3–5 independent reports in window) else omit
- Roll up by company + optional domain + optional country — no row-level public dump
- Freshness window stated in UI (“last 7 days”)
- Contributors report status; HT publishes the aggregate only

---

## 13. SEO metadata proposal

One H1. Do not stuff the cluster into the H1. Supporting terms belong in intro, cards, and filters when real.

| Field | Proposal | Do not |
| --- | --- | --- |
| Title | `Find AI training work that fits you` → `Find AI training work that fits you · Happy Tasking` | `AI training jobs, remote AI training jobs, AI trainer jobs…` |
| Meta description | ~150–160 chars: AI training / evaluation work, listings when real, match + independent company context. Honest if the catalog is empty | Claim “thousands of live jobs” |
| H1 | Prefer one line in the family of logged-in copy: **Find AI training work that fits you.** Evaluate against brand; keep tagline elsewhere | Exact-match `ai training jobs` as H1 if it reads stuffed; never all cluster terms |
| Intro | Job intent + differentiation + trust | Invent counts |
| Canonical | Stay `https://happytasking.com/taskmatch` | Query-param canonicals per filter |
| robots | Stay `index, follow` **if** demo catalog is not the primary SSR body | Index a demo job board |
| OG/Twitter | Match title + description; existing OG image unless a real TaskMatch image exists | Fake job collage |
| Breadcrumbs | Home → TaskMatch (keep) | “AI Training Jobs” as breadcrumb name |

Filter URLs (`?domain=coding`) should `rel=canonical` to `/taskmatch` (already path-canonical). Do not index filter variants as separate pages in 4.5.

---

## 14. SSR / indexability proposal

| URL | Index? | SSR body |
| --- | --- | --- |
| `/taskmatch` | Yes | Hero, honest catalog or empty state, differentiation, supporting links. **Primary catalog = non-demo only** |
| Demo listings | Never as live jobs | Optional labeled illustrative section **or** omit from public HTML |
| `/taskmatch/opportunities/{slug}` | Only `mayIndexListedResource` (non-demo, sitemap) | Follow-on: server-render detail (out of landing MVP if needed) |
| `/taskmatch/profile` | Never | Unchanged |
| `/taskmatch?domain=` | Canonical hub | No extra sitemap entries |

Structured data:

- Keep Organization, WebSite, BreadcrumbList
- **No JobPosting** until a specific non-demo listing meets Google’s JobPosting requirements
- **No ItemList of fake jobs**
- **No aggregateRating**
- Optional later: `ItemList` of real indexable opportunity URLs only

If the only listings are demo, the indexable page should look like an **empty-but-honest product landing**, not a populated job SERP.

---

## 15. Internal-link proposal

TaskMatch-specific only. **Not** Sprint 5’s sitewide engine.

| From `/taskmatch` | To | Anchor intent |
| --- | --- | --- |
| Card / company name | `/companies/{slug}` | Company intelligence (not `{company} jobs`) |
| Supporting | `/companies` | Directory |
| Supporting | `/compare` | Pair picker; pair landings only when eligible |
| Supporting | `/guides` | Education (hub; no unpublished slugs as 200) |
| Supporting | `/market` | Broad conditions now |
| Supporting | `/issues` | Resolution, not a second review URL |
| Logged-in gaps | `/skills/{slug}` | Only if that skill URL is allowed to exist; do not mill |

Inbound already exists from nav, footer, guides CTA, company/comparison TaskMatch sections. Tighten company-page CTA so it does not imply TaskMatch owns `{company} jobs`.

Forbidden: TaskMatch H1 or title using `dataannotation jobs`, `mercor reviews`, `{A} vs {B}`, `what is an ai trainer`.

---

## 16. Conversion proposal

Current: hero **Build your profile** / **Log in** before the visitor has seen listings. Onboarding is post-register (country → domains → skills → companies → TaskMatch).

Proposed low-friction:

**Organic visitor → browse honest catalog → understand differentiation → optional personalize → register / complete profile → personalized matches → save / apply.**

- Primary catalog CTA: View listing / How to apply (public URL)
- Secondary: “See matches for your skills” → register or login
- After register: existing onboarding, then `/taskmatch` dashboard
- Do not require signup to read empty state or company directory
- Do not gate public apply URLs behind login (already not gated)

---

## 17. Accessibility / mobile considerations

- One H1; card titles stay `h2`
- Filters: visible labels; don’t rely on placeholder-only
- Pulse / quality: text equivalent, not color alone
- Omit `—` match or give `aria-label="Sign in to see estimated fit"`
- Company name as link
- Keep `min-h-11` on actions; stacked DualScore below `sm` if two columns get cramped
- Empty vs error copy already distinguished — keep
- Don’t auto-play or layout-shift the catalog after hydration for crawlers (prefer server-rendered anonymous tree)

---

## 18. Analytics events proposal

Keep existing logged-in events. Add **only** if implementation ships (names indicative):

| Event | Anonymous? | Purpose |
| --- | --- | --- |
| `taskmatch_landing_viewed` | Yes | Funnel (pageview exists; named event optional) |
| `taskmatch_filter_changed` | Logged-in (and anonymous if filters ship) | Product |
| `taskmatch_empty_state_viewed` | Yes | Detect catalog gap vs bugs |
| `taskmatch_illustrative_demo_shown` | Yes | Guardrail — should trend to zero |
| `opportunity_apply_clicked` | Prefer any user | Today `apply_clicked` on detail |
| `taskmatch_personalize_clicked` | Yes | Conversion |

Do not log PII. Do not fire `taskmatch_opened` for Googlebot.

---

## 19. Implementation plan

Wait for approval. Suggested phases **inside 4.5** (still one URL):

**Phase A — Trust gates (required)**  
Primary public catalog = `isDemo: false` (and company not demo). Demo intelligence must not populate quality/TaskPulse/TaskScore on indexable cards. Empty state if none. Optional labeled illustrative block — default **omit** from SSR.

**Phase B — Search landing IA + metadata**  
Rewrite anonymous `Landing`: H1, intro, empty/catalog, differentiation, how it works, late CTA, supporting links. Update title/description. Keep design system.

**Phase C — Cards**  
Provenance, company link, remote/country/skills when present, separate community cluster, hide anonymous match theater.

**Phase D — Logged-in honesty**  
Pulse filter copy; omit demo-derived quality; keep matcher.

**Phase E — Tests**  
Indexability, no JobPosting, demo excluded from primary SSR, metadata, empty vs error.

**Explicitly later / not 4.5 MVP**

- Opportunity-detail SSR (recommended soon; not required to ship the hub)
- Real listing ingestion ops
- TaskPulse enum rename / public TaskPulse product
- Skill/country programmatic SEO
- JobPosting JSON-LD
- Sprint 5 link graph
- Publishing Guide A

---

## 20. Test plan

| Case | Expect |
| --- | --- |
| `GET /taskmatch` 200 | Indexable hub |
| HTML title / canonical / robots | Proposed metadata; `index, follow` |
| SSR H1 | Single proposed H1 for anonymous |
| Primary catalog | Zero demo cards as live jobs |
| Empty catalog | Honest empty, not error.tsx copy |
| API failure | error.tsx, not empty catalog |
| Sitemap | Hub present; demo opportunity slugs absent |
| Detail demo | `noindex`; out of sitemap |
| JSON-LD | No JobPosting, no aggregateRating |
| Anonymous | No match % |
| Logged-in matcher | Scores only with profile dimensions; confidence cap held |
| Cannibalization | No `{company} jobs` / vs / educational H1 |
| A11y smoke | Labels, one H1, 44px-class CTAs |
| Mobile | Hero + cards usable; no horizontal trap |
| Isolation | `NEXT_DIST_DIR=.next-verify` if building; do not overwrite live `.next` |

---

## 21. Risks

| Risk | Severity | Mitigation |
| --- | --- | --- |
| Indexable demo job SERP (current production) | **Critical** | Phase A before celebrating rankings |
| Quality % / TaskPulse from demo reviews on hub | **Critical** | Don’t attach demo intel to public cards |
| Conflating hiring vs task availability | High | Labels; pulse not a job badge |
| Keyword-stuffed H1 cannibalizing later guides | High | One people-first H1; cluster in body |
| Creating `/jobs` or role URLs | High | Non-goal |
| JobPosting on demo/incomplete rows | High | Forbidden |
| Filters implying a full market that isn’t there | Medium | Hide unsupported facets |
| Logged-in vs anonymous H1 split confusing QA | Medium | Align anonymous H1; logged-in can stay personalized subtitle |
| Opportunity detail still client-only | Medium | Follow-on SSR |
| `getTaskPulse` includes demo reports | High | Filter `isDemo: false` when computing public pulse (implementation, not this audit) |

---

## 22. Explicit non-goals

- Sprint 5 internal linking / skill / country mills / mass content
- New routes listed in the brief
- Publishing MDX guides
- Schema migrations for a new TaskPulse product
- Fake jobs, fake counts, fake pulse
- JobPosting / aggregateRating
- N×N comparisons
- Indexing demo companies or demo listings
- Replacing the brand tagline
- Changing eligibility engines for companies/comparisons/guides except where TaskMatch list filters must respect `isDemo`
- Deploy / commit from the audit pass

---

## 23. Recommendation

### GO WITH CONDITIONS

Architecture is the right URL. Research v1 ownership is settled. The matching engine and provenance enums are a head start.

Do **not** GO unconditionally: production `/taskmatch` is an indexable page whose SSR catalog is demo jobs plus demo-derived quality scores. That violates the trust rules that make Happy Tasking worth ranking.

**Conditions**

1. Primary indexable catalog contains only non-demo opportunities (empty state allowed and preferred over demo-as-jobs).
2. No JobPosting / aggregateRating / fake ItemList.
3. No new job-intent routes.
4. Ads competition never treated as SEO difficulty; UNKNOWN volumes stay UNKNOWN.
5. Open job ≠ TaskPulse; listing facts ≠ community facts.
6. Match % only with a real profile; no invented scores.
7. Company-branded jobs stay on company pages; educational queries stay off TaskMatch H1.
8. TaskPulse not faked; public pulse must ignore demo reports when code changes.
9. Sprint 5 not started from this work.
10. Brand tagline stays “Know before you task.” until a separate copy decision.

**NO-GO** would apply if the sprint were “rank for `ai training jobs` by publishing demo listings as live jobs.” That path is rejected.

---

# CURRENT STATE

`/taskmatch` is indexable, canonical, SSR for anonymous users, sitemap priority 0.9. H1 and title are matching-product copy, not job-intent landing copy. Production SSR lists six DEMO opportunities with pay and opportunity-quality percentages. Opportunity details are client-rendered and correctly absent from the sitemap. Logged-in users get a real matcher, filters (including TaskPulse-as-availability), and save/apply tracking. All listing and company intelligence on production is demo. No JobPosting schema.

# TARGET STATE

One strong `/taskmatch` canonical: anonymous search landing + logged-in personalization. Primary catalog = legitimate openings only. Differentiation visible without signup. Cards separate listing facts from community facts. Metadata serves `ai training jobs` cluster without stuffing. Supporting links to companies, compare, guides, market, issues. Conversion after understanding. TaskPulse remains a future aggregate, not a fake dashboard.

# DATA GAPS

No non-demo opportunities or eligible companies. Quality/TaskPulse/TaskScore on the hub are demo-contaminated. Pulse API does not exclude demo reports. Opportunity-level availability does not exist. Guide A unpublished. Organic difficulty UNKNOWN. Real ingestion process not in this sprint.

# PROPOSED CHANGES

Trust-gate the public catalog; rewrite anonymous IA/copy/metadata; card provenance + company links; honest empty state; logged-in pulse/quality labeling; tests. Do not add routes, schema, JobPosting, or Sprint 5.

# FILES THAT WOULD CHANGE DURING IMPLEMENTATION

Likely (not edited now):

- `web/src/app/taskmatch/page.tsx` — metadata
- `web/src/app/taskmatch/TaskMatchPage.tsx` — landing / dashboard
- `web/src/components/taskmatch/OpportunityCard.tsx`
- `web/src/components/taskmatch/DualScore.tsx` (if anonymous theater is removed)
- `web/src/lib/publicPages.ts` — public list query flags if needed
- `server/src/services/taskmatch.service.ts` — public vs demo filtering
- `server/src/services/opportunityQuality.service.ts` / `company.service.ts` `getTaskPulse` — exclude demo from public intel
- Tests under `web/src/lib/` and `server/src/` as appropriate
- Possibly `web/src/components/CompanyIntelligence.tsx` CTA wording

Unchanged unless a follow-on is approved: Prisma schema, `content/guides/`, sitemap static list (hub already listed), comparison/company eligibility, onboarding funnel structure.

# RISKS

Indexing demo jobs as `ai training jobs`; mixing pulse with hiring; keyword stuffing; JobPosting on illegitimate rows; empty-looking SERP until real data (acceptable if honest).

# GO/NO-GO

**GO WITH CONDITIONS** — wait for approval before implementation.
