# Keyword map

Complete Happy Tasking keyword taxonomy (research v1). **Not implemented. No pages created. No articles published.**

**Canonical origin:** `https://happytasking.com`

**Keyword Planner period:** 1 August 2025 – 31 July 2026.

**Numeric demand:** This file **does** include verified Google Keyword Planner average monthly search values from the **supplied CSV exports**. Those integers are **VERIFIED KEYWORD PLANNER DATA** (observed Planner values, not invented). They are rounded directional demand, not traffic forecasts. Where a CSV row has no volume, write **UNKNOWN** — never convert UNKNOWN to zero.

**Unit of implementation:** PAGE + KEYWORD CLUSTER. Do not create one page per keyword.

---

## Evidence classes

| Label | Meaning |
| --- | --- |
| **VERIFIED KEYWORD PLANNER DATA** | Numeric avg monthly searches, YoY, and ads competition copied from the supplied Keyword Planner CSV exports (1 Aug 2025 – 31 Jul 2026). Not invented. Rounded. **Ads Competition is advertising competition, not organic SEO difficulty.** CPC/bid values are advertising signals only. Missing CSV volume = **UNKNOWN** (not zero). Generic Outlier rows are still Planner numbers but Keyword-data confidence is **MEDIUM-LOW** (Creative Outlier / Outlier Air contamination). |
| **OBSERVED SERP EVIDENCE** | External SERP-intent research. What Google currently rewards. |
| **INTERNAL STRATEGIC ASSESSMENT** | Happy Tasking product/SEO judgment (priority, product changes, which cluster shares a page). |
| **UNKNOWN / NEEDS MORE RESEARCH** | No Planner volume, contaminated brand queries, or unresolved SERP. |
| **PRIMARY OWNER** | The one Happy Tasking page allowed to target the query. |
| **SUPPORTING PAGE** | May link, explain, or convert — must **not** use the same H1, title, or canonical intent. |

**Observed SERP evidence** sets intent/owner. **Verified Planner data** sets demand magnitude. **Internal assessment** sets priority and product action. Planner does **not** override SERP intent. Contaminated Planner volume does **not** override SERP intent.

---

## Data hygiene

1. Keyword Planner numbers are rounded directional demand signals, not exact traffic forecasts.  
2. Ads Competition is **not** organic SEO difficulty.  
3. CPC/bid values (e.g. DataAnnotation pay top-of-page bid high **BRL 139.33**) are advertising market signals only.  
4. Missing Keyword Planner volume must remain **UNKNOWN**, not zero.  
5. Generic **Outlier** Keyword Planner data is brand-ambiguous and contaminated (Creative Outlier / Outlier Air earbuds). Keyword-data confidence: **MEDIUM-LOW**.  
6. Multiple keywords can belong to **one page**. Do not create one page per keyword.

---

## Taxonomy refinement (jobs)

| Intent | Example | PRIMARY OWNER | SUPPORTING |
| --- | --- | --- | --- |
| **GENERIC JOB INTENT** | `ai training jobs`, `ai trainer jobs`, `ai evaluator jobs`, `remote ai training jobs` | TaskMatch | Educational Guide (different H1) |
| **COMPANY-SPECIFIC JOB INTENT** | `dataannotation jobs`, `mercor jobs` | Company page | TaskMatch (conversion) |
| **COMPANY-SPECIFIC REPUTATION / PAY / SCREENING** | `mercor reviews`, `outlier assessment` | Company page | Issues / Compare / generic screening Guide |
| **EDUCATIONAL ROLE INTENT** | `what is an ai trainer` | Guide | TaskMatch |
| **PAIRWISE COMPANY DECISION** | `outlier vs mercor` | Compare | Company |
| **BROAD CURRENT MARKET CONDITIONS** | `ai trainer pay`, `ai training hourly rate` | Market / TaskPulse (product) | Guide for mechanics |
| **PERSONALIZED “WHAT FITS ME?”** | TaskMatch matching | TaskMatch | Company after a match |

This **overrides** the earlier map where `{company} jobs` was treated as mixed with TaskMatch primary. Company-branded jobs now sit on `/companies/{slug}` as part of that company’s cluster.

---

## Verified Keyword Planner findings

Ads competition = **advertiser** competition.

### Generic AI work

| Query | Avg monthly searches | YoY | Ads competition | PRIMARY OWNER | Priority (INTERNAL) |
| --- | --- | --- | --- | --- | --- |
| `ai training jobs` | 50,000 | +900% | Medium | TaskMatch | VERY HIGH |
| `remote ai training jobs` | 5,000 | UNKNOWN | Medium | TaskMatch | HIGH |
| `ai trainer jobs` | 5,000 | UNKNOWN | Low | TaskMatch | HIGH |
| `ai coding jobs` | 500 | UNKNOWN | Medium | TaskMatch; informational Coding Guide supports | HIGH (product fit) |
| `ai evaluator jobs` | 500 | UNKNOWN | Medium | TaskMatch; evaluator Guide supports | HIGH (product fit) |
| `llm evaluator jobs` | 50 | UNKNOWN | Low | TaskMatch | supporting long-tail |
| `what is an ai trainer` | 500 | UNKNOWN | Low | Guide | HIGH editorial candidate |
| `ai trainer pay` | 50 | UNKNOWN | Low | Market / relevant Guide | supporting |
| `ai training hourly rate` | 50 | UNKNOWN | Low | Market / relevant Guide | supporting |
| `ai coding assessment` | 50 | *see note* | Medium | generic Screening Guide | supporting / emerging |
| `ai work from home` | 500 | +900% | Medium | TaskMatch | emerging cluster to **monitor** |

`ai coding assessment` trend showed newly emerging / infinite percentage due to a prior zero baseline. **Do not interpret infinity as a stable growth rate.**

### DataAnnotation (clean brand cluster — one page)

| Query | Avg monthly searches | Ads competition | PRIMARY OWNER |
| --- | --- | --- | --- |
| `dataannotation jobs` | 50,000 | Low | `/companies/dataannotation` |
| `dataannotation reviews` | 5,000 | Low | `/companies/dataannotation` |
| `dataannotation pay` | 500 | Low | `/companies/dataannotation` |

**Do not** create separate SEO pages for those three queries. Recommended action: **COLLECT COMMUNITY DATA + IMPROVE EXISTING COMPANY PAGE**. Detail stays **noindex** until eligibility.

### Mercor (clean brand cluster — one page)

| Query | Avg monthly searches | Ads competition | PRIMARY OWNER |
| --- | --- | --- | --- |
| `mercor jobs` | 5,000 | Low | `/companies/mercor` |
| `mercor reviews` | 5,000 | Low | `/companies/mercor` |
| `mercor interview` | 500 | Low | `/companies/mercor`; generic screening Guide supports |
| `mercor pay` | 50 | Low | `/companies/mercor` |

**Do not** create `/guides/mercor-interview` or `/guides/mercor-reviews`. Recommended action: **COLLECT COMMUNITY DATA + IMPROVE EXISTING COMPANY PAGE**.

### Outlier — data-quality warning

Planner returned: `outlier reviews` 500; `outlier jobs` 5,000; `outlier pay` 50; `outlier assessment` 50; `outlier no tasks` 50; `outlier vs mercor` 50; `outlier vs dataannotation` 50.

The dataset is **heavily contaminated** by unrelated Creative Outlier / Outlier Air earbuds (`creative outlier`, `outlier air`, `outlier air review`, etc.).

- Keyword-data confidence: **MEDIUM-LOW**  
- **Preserve SERP intent**; do **not** treat these volumes like Mercor/DataAnnotation  
- Refine later with `outlier ai`, `outlier ai reviews`, `outlier ai jobs`, `outlier ai pay`, `outlier ai assessment`, `outlier ai tasks` (those volumes are **UNKNOWN** until measured)  
- Recommended action: **RESEARCH FURTHER + COLLECT COMMUNITY DATA**

### Comparisons

| Query | Avg monthly searches | Ads competition | PRIMARY OWNER |
| --- | --- | --- | --- |
| `outlier vs mercor` | 50 | Low | `/compare/mercor-vs-outlier` |
| `outlier vs dataannotation` | 50 | Low | `/compare/dataannotation-vs-outlier` |
| `mercor vs dataannotation` | **UNKNOWN** | UNKNOWN | `/compare/dataannotation-vs-mercor` when eligible |

Outlier pair volumes inherit MEDIUM-LOW brand-data confidence. Do not create pairwise Guides. Demo pairs stay noindex. Recommended action: **WAIT FOR REAL DATA**.

---

## Observed SERP-intent findings

(Unchanged as intent evidence. Planner volumes are in the tables above.)

| Query | Observed intent | PRIMARY OWNER | SUPPORTING PAGE | SERP confidence |
| --- | --- | --- | --- | --- |
| `outlier reviews` | reputation / worker experience | Company `/companies/outlier` | Issues / Compare | HIGH |
| `outlier pay` | company-specific compensation | Company `/companies/outlier` | Market | HIGH |
| `mercor reviews` | reputation / worker experience | Company `/companies/mercor` | Issues / Compare | HIGH |
| `dataannotation reviews` | reputation / worker experience | Company `/companies/dataannotation` | Issues / Compare | HIGH |
| `outlier vs mercor` | pairwise decision | Compare `/compare/mercor-vs-outlier` | Company | HIGH |
| `outlier vs dataannotation` | pairwise decision | Compare `/compare/dataannotation-vs-outlier` | Company | HIGH |
| `ai training jobs` | find available work | TaskMatch | Guide | HIGH |
| `ai trainer jobs` | find available work | TaskMatch | Guide | HIGH |
| `ai evaluator jobs` | find available work | TaskMatch | Guide | HIGH |
| `llm evaluator jobs` | find specialized AI evaluation work | TaskMatch | Guide | MEDIUM-HIGH |
| `ai coding jobs` | find technical AI work | TaskMatch | Guide | HIGH |
| `remote ai training jobs` | find remote AI work | TaskMatch | Guide | HIGH |
| `what does an ai evaluator do` | educational / role understanding | Guide | TaskMatch | HIGH |
| `what is an ai trainer` | educational / role understanding | Guide | TaskMatch | HIGH |
| `how does ai training work` | educational; **ambiguous** with ML model-training | Hold | none | MEDIUM |
| `outlier assessment` | company-specific screening | Company `/companies/outlier` | generic screening Guide | HIGH |
| `mercor interview` | company-specific screening | Company `/companies/mercor` | generic screening Guide | HIGH |
| `ai coding assessment` | generic preparation / educational | Guide | TaskMatch | MEDIUM |
| `outlier no tasks` | company-specific availability | Company `/companies/outlier` | Market / Issues | HIGH |
| `ai task availability` | broad market / availability intelligence | Market **or** Guide | TaskMatch | MEDIUM — unresolved |

### SERP observations

1. Company-review searches are dominated by **Glassdoor, Indeed, and Trustpilot**.  
2. Pairwise searches already produce **dedicated comparison content** — validates `/compare/[comparisonSlug]`.  
3. Generic `… jobs` queries show **job/opportunity intent** → TaskMatch. **Company-branded** `… jobs` → Company page (Planner + INTERNAL STRATEGIC ASSESSMENT).  
4. Educational variants stay Guide-owned.  
5. Company-specific screening stays on the company page.  
6. Generic screening → `/guides/how-ai-work-screenings-work` *(not created)*.  
7. No company-specific screening guides.  
8. No leaked questions / answers / proprietary prompts.  
9. `how does ai training work` is ambiguous — do not prioritize.  
10. Task availability: company-specific → Company; broad/current → Market / TaskPulse; personalized → TaskMatch.

### Strategic note (product)

Search demand around **task availability** may indicate not only an SEO opportunity but a **product opportunity for TaskPulse / community-reported work availability.** Do not invent a `/taskpulse` SEO landing. Planner also shows small generic pay queries (`ai trainer pay`, `ai training hourly rate` = 50/mo) that belong to Market/Guide, not company clones.

---

## Remaining research gaps

| Gap | Class |
| --- | --- |
| `how does ai training work` | OBSERVED SERP ambiguous; no Planner row in this extract |
| Exact `ai task availability` Market vs Guide | OBSERVED MEDIUM, unresolved |
| `ai coding assessment` vs generic coding-interview SERPs | OBSERVED MEDIUM; Planner 50, emerging trend not a growth rate |
| `ai work from home` durability | Planner 500, +900%, **monitor** |
| `mercor vs dataannotation` volume | UNKNOWN |
| `outlier ai` / `outlier ai jobs` / `outlier ai reviews` / … | UNKNOWN; required to replace contaminated generic Outlier volumes |
| `what does an ai evaluator do` Planner volume | UNKNOWN (SERP intent HIGH; not in this Planner extract) |
| Organic SEO difficulty | UNKNOWN — we only have ads competition |
| FIRST-10 | **Finalized as page-level clusters** in FIRST-10-TARGETS.md |

---

## How to read a candidate

| Field | Meaning |
| --- | --- |
| Keyword | Query or cluster members that share **one** primary intent **or** one owner page |
| Intent | What the searcher is trying to do |
| Evidence class | VERIFIED KEYWORD PLANNER DATA / OBSERVED SERP EVIDENCE / INTERNAL STRATEGIC ASSESSMENT / UNKNOWN |
| PRIMARY OWNER | One page |
| SUPPORTING PAGE | Allowed support |
| Verified Planner demand | Avg monthly searches or UNKNOWN |
| Ads competition | Advertiser competition only |
| Target URL | Canonical path |
| Current content/data readiness | Honest production state |
| Notes | Constraints, contamination, policy |

`{Company}` examples are seed illustrations. Production detail URLs are currently **demo / `noindex, follow` / out of sitemap**. Do not request indexing.

Internal IDs (`C-01`, `X-01`, …) are research handles, not slugs to publish.

### Funnel × page type (quick)

| Stage | Typical owner |
| --- | --- |
| Awareness (“what is”, “how does this kind of work work”) | Guide |
| Consideration (named company reputation; A vs B; which platforms exist) | Company / Comparison / Directory |
| Decision (match me; apply; pick a pair in a tool) | TaskMatch / Compare hub / Opportunity |
| Post-decision (no tasks *here*; delayed payout *here*; dispute) | Company / Issues / Market (if the whole market) |

### Readiness labels used below

| Label | Meaning |
| --- | --- |
| Hub ready | Route exists, SSR, indexable (directory, compare hub, TaskMatch, market, issues, guides hub, home) |
| Demo / noindex | Route exists; production data is demo; keep `noindex, follow` |
| Client / thin | Route exists; first HTML is weak (skill, opportunity, some details) |
| Not built | Candidate URL only — **do not create in this research** |
| Do not create | Targeting this query with a HT page would be wrong (login, leaks, winner listicles, URL mills) |

---

## Mapping rules (non-negotiable)

| Primary intent | Owner | Target URL |
| --- | --- | --- |
| Generic job intent (`ai training jobs`, …) | TaskMatch | `/taskmatch` |
| Company-specific job intent (`dataannotation jobs`, `mercor jobs`) | Company | `/companies/[slug]` |
| Company-specific reputation, pay, screening, or task supply | Company | `/companies/[slug]` |
| Company A vs Company B | Comparison | `/compare/[comparisonSlug]` |
| General educational question | Guide | `/guides/[slug]` |
| Personalized “what fits me?” | TaskMatch | `/taskmatch` |
| Broad current market conditions | Market / TaskPulse (product) | `/market` |
| Specific public complaint / resolution | Issues and/or company resolution | `/issues` or `/companies/[slug]` |
| Which platforms exist | Directory | `/companies` |
| Interactive pair picker (no named pair) | Compare hub | `/compare` |
| One live listing | Opportunity | `/taskmatch/opportunities/[slug]` |

**Do not create multiple page types targeting the same primary intent.** Multiple keywords may share **one** owner page.

---

## 1. COMPANY

**Owner:** `/companies/[slug]`  
**Shipped title pattern:** `{Name} Reviews, Pay & Task Availability \| Happy Tasking`  
**Do not** create `/guides/{company}-pay`, `/pay/{company}`, or `{company}-reviews` articles.

### C-01 — {company} reviews

| Field | Value |
| --- | --- |
| Keyword | `{company} reviews`; **observed:** `outlier reviews`, `mercor reviews`, `dataannotation reviews`; also `scale ai reviews`, `turing reviews`, … |
| Intent | Reputation / worker experience for one named platform |
| User problem | Are contributor experiences good enough to spend screening time? |
| Search funnel stage | Consideration |
| Evidence class | **OBSERVED SERP EVIDENCE** for Outlier / Mercor / DataAnnotation reviews. Other brands remain HYPOTHESIS with the same mapping. |
| PRIMARY OWNER | Company |
| SUPPORTING PAGE | Issues / Compare |
| Confidence | HIGH (observed three brands) |
| Correct Happy Tasking page type | Company |
| Target URL | `/companies/{slug}` (`/companies/outlier`, `/companies/mercor`, `/companies/dataannotation`) |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Review bodies SSR on eligible future pages; `/companies/{slug}/reviews` is a supporting list only |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH — reviews sit with pay, availability, and resolution, not a Glassdoor clone. SERPs today are **review destinations**, so HT must earn that job with real (non-demo) experience data. |
| Competition (observed) | **Glassdoor, Indeed, Trustpilot** dominate company-review SERPs. Hypothesis for other SERP features: Reddit, company site, YouTube. |
| Cannibalization risk | HIGH if a guide or the reviews subpath uses the company title. Supporting Issues/Compare must not retitle as `{company} reviews`. |
| Priority hypothesis | P2 (index only when `companySEOEligibility()` passes) |
| Notes | VERIFIED PLANNER (1 Aug 2025–31 Jul 2026): `dataannotation reviews` **5,000**/mo ads Low; `mercor reviews` **5,000**/mo ads Low; `outlier reviews` **500** but **MEDIUM-LOW volume confidence** (earbuds contamination). SERP: reputation destinations (Glassdoor, Indeed, Trustpilot). Same **page** as jobs/pay for that company — not a separate reviews URL. Demo: do not request indexing. |

### C-02 — {company} pay / salary / hourly rate

| Field | Value |
| --- | --- |
| Keyword | `{company} pay`; **observed:** `outlier pay`; also `{company} salary`, `{company} hourly rate` |
| Intent | Company-specific compensation |
| User problem | What do people earn **here** — not “in AI work generally”? |
| Search funnel stage | Consideration |
| Evidence class | **OBSERVED SERP EVIDENCE** for `outlier pay`. Other `{company} pay` queries inherit the mapping as HYPOTHESIS. |
| PRIMARY OWNER | Company |
| SUPPORTING PAGE | Market |
| Confidence | HIGH (`outlier pay`) |
| Correct Happy Tasking page type | Company |
| Target URL | `/companies/{slug}` (pay section); observed example `/companies/outlier` |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Needs non-demo pay reports, sample sizes; never invent bands |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH if pay is structured by work domain |
| Competition (hypothesis) | HIGH — forums, Reddit, salary sites (not separately SERP-coded for this query) |
| Cannibalization risk | HIGH vs pay **guide** and `/market`. Market may **support** (cross-platform context) but must not H1 `{company} pay`. |
| Priority hypothesis | P2 |
| Notes | VERIFIED PLANNER: `dataannotation pay` **500**/mo ads Low (bid high BRL 139.33 = ads signal only); `mercor pay` **50**/mo ads Low; `outlier pay` **50** MEDIUM-LOW volume confidence. Generic `ai trainer pay` / `ai training hourly rate` (**50**/mo) → Market/Guide, not this page. |

### C-03 — {company} task availability / no tasks / empty queue

| Field | Value |
| --- | --- |
| Keyword | `{company} no tasks`; **observed:** `outlier no tasks`; also `{company} task availability`, `{company} empty queue` |
| Intent | Company-specific task availability / problem |
| User problem | Will I sit idle after passing **on this platform**? |
| Search funnel stage | Consideration or Post-decision |
| Evidence class | **OBSERVED SERP EVIDENCE** for `outlier no tasks`. Other brands inherit as HYPOTHESIS. |
| PRIMARY OWNER | Company |
| SUPPORTING PAGE | Market / Issues |
| Confidence | HIGH (`outlier no tasks`) |
| Correct Happy Tasking page type | Company |
| Target URL | `/companies/{slug}`; observed example `/companies/outlier` |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Availability reports required; missing ≠ zero |
| TaskMatch conversion potential | HIGH (personalized availability is TaskMatch — different intent) |
| Happy Tasking differentiation | HIGH — distinctive HT query; also a **TaskPulse / community-reported availability** product signal |
| Competition (hypothesis) | MEDIUM — Discord, Reddit, Telegram |
| Cannibalization risk | HIGH vs availability **guide**, Market, and Issues if those pages H1 `{company} no tasks` |
| Priority hypothesis | P2 |
| Notes | Observed SERP: named idle is **not** a Market query. Planner `outlier no tasks` **50** is MEDIUM-LOW volume confidence. Broad `ai task availability` → T-04. Personalized → TaskMatch. |

### C-04 — {company} legit / scam

| Field | Value |
| --- | --- |
| Keyword | `{company} legit`; `is {company} a scam`; `is outlier legit`; `is mercor legit`; `dataannotation scam`; `remotasks legit` |
| Intent | Trust / safety for one named platform |
| User problem | Avoid fake platforms or unpaid-onboarding traps |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | Company |
| Target URL | `/companies/{slug}` |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Needs identity, issues/resolution, reviews; no “we certify safe” without evidence |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH when resolution data is real |
| Competition hypothesis | HIGH — YouTube, Reddit, scam-blog mills |
| Cannibalization risk | MEDIUM vs Issues hub and a future vetting **guide** (many companies) |
| Priority hypothesis | P2 |
| Notes | How to vet platforms in general → Guide (R-05). Named company → this page. |

### C-05 — Company-specific jobs (`{company} jobs`)

| Field | Value |
| --- | --- |
| Keyword | **VERIFIED:** `dataannotation jobs` (50,000, ads Low); `mercor jobs` (5,000, ads Low); `outlier jobs` (5,000, **MEDIUM-LOW volume confidence**). Also `{company} ai jobs` as the same **company cluster**, not a new URL. |
| Intent | COMPANY-SPECIFIC JOB INTENT — work **at this brand** |
| User problem | Openings and how to work with this named platform |
| Search funnel stage | Decision / Consideration |
| Evidence class | VERIFIED KEYWORD PLANNER DATA + INTERNAL STRATEGIC ASSESSMENT (company cluster). SERP for generic jobs does **not** apply to branded jobs. |
| PRIMARY OWNER | Company `/companies/{slug}` |
| SUPPORTING PAGE | TaskMatch (conversion only) |
| Verified Planner demand | DataAnnotation jobs 50,000; Mercor jobs 5,000; Outlier jobs 5,000 (contaminated) |
| Ads competition | Low (DA, Mercor); Outlier row not reliable |
| Target URL | `/companies/dataannotation`, `/companies/mercor`, `/companies/outlier` |
| Current route exists? | Yes. Do **not** create `/taskmatch/{company}` or `/guides/{company}-jobs` |
| Current content/data readiness | Demo / noindex. Page should eventually include public opportunities, application info, reviews, pay, availability, stability, TaskMatch CTA — **one page**. |
| TaskMatch conversion potential | HIGH as SUPPORTING |
| Cannibalization risk | CRITICAL vs TaskMatch if TaskMatch ranks `dataannotation jobs`. CRITICAL vs separate jobs/reviews/pay URLs. |
| Priority hypothesis | FIRST-10 #2 and #3: COLLECT COMMUNITY DATA. Outlier: RESEARCH FURTHER. |
| Notes | **Taxonomy override:** branded jobs are not TaskMatch-primary. Generic `ai training jobs` remains TaskMatch. |

### C-06 — {company} reddit / forum chatter

| Field | Value |
| --- | --- |
| Keyword | `{company} reddit`; `outlier reddit`; `dataannotation reddit` |
| Intent | Unfiltered peer discussion about one company |
| User problem | Official pages feel like marketing |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | Company (HT’s structured answer). Community is supporting discussion, not the money page |
| Target URL | `/companies/{slug}` |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Community threads exist as a product surface (`/community`) with a different H1 |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | MEDIUM — Reddit will often win the literal query; HT should win “should I work here?” |
| Competition hypothesis | HIGH — Reddit |
| Cannibalization risk | MEDIUM if Community titles include `{company} reviews` |
| Priority hypothesis | P2 |
| Notes | Do not create `/reddit/{company}`. Do not scrape Reddit into a guide. |

### C-07 — {company} payout speed / withdrawal / 1099

| Field | Value |
| --- | --- |
| Keyword | `{company} payout`; `{company} withdrawal`; `{company} 1099`; `outlier payout time`; `mercor payment schedule` |
| Intent | How **this** company pays out (ops), not market-wide rates |
| User problem | Cash timing and contractor paperwork |
| Search funnel stage | Consideration or Post-decision |
| Correct Happy Tasking page type | Company |
| Target URL | `/companies/{slug}` |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Use pay reports + issues; do not invent tax advice |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH if payout complaints are structured |
| Competition hypothesis | MEDIUM–HIGH |
| Cannibalization risk | HIGH vs P-01 (mechanics) and I-02 (delayed pay as harm) |
| Priority hypothesis | P2 |
| Notes | Delayed/unpaid as a **dispute** → I-02. How task work is paid in general → P-01. |

### C-08 — {company} login / app / careers site (navigational)

| Field | Value |
| --- | --- |
| Keyword | `{company} login`; `outlier login`; `mercor login`; `scale ai careers`; `{company} app` |
| Intent | Reach the company’s own product |
| User problem | They already have an account or want the official apply flow |
| Search funnel stage | Decision (navigational) |
| Correct Happy Tasking page type | **Do not create.** Not a HT ranking target |
| Target URL | Official company site (not HT). HT company page may mention the public website when eligible |
| Current route exists? | n/a |
| Current content/data readiness | Do not create |
| TaskMatch conversion potential | LOW |
| Happy Tasking differentiation | None — we should not impersonate login |
| Competition hypothesis | HIGH — the company itself |
| Cannibalization risk | LOW if we never target these |
| Priority hypothesis | Hold / do not create |
| Notes | A company intelligence page is not a login clone. |

### C-09 — {company} similar / alternative / competitors (one named)

| Field | Value |
| --- | --- |
| Keyword | `{company} alternative`; `{company} competitors`; `outlier alternatives`; `mercor competitors` |
| Intent | Find other platforms **from one named starting point** (not a locked pair) |
| User problem | This company is a bad fit; what else exists? |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | Company (similar-companies section). Compare hub if they pick a second name |
| Target URL | `/companies/{slug}` |
| Current route exists? | Yes (similar companies shipped in Sprint 2) |
| Current content/data readiness | Demo / noindex. Similar list must not become a fake “best of” |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | HIGH — affiliate alternative posts |
| Cannibalization risk | HIGH vs X-01 if the H1 becomes `{A} vs {B}`; HIGH vs X-03 winner lists |
| Priority hypothesis | P2 |
| Notes | The moment two names are in the query → Comparison (X-01). |

### C-10 — Directory: AI work / AI training / AI evaluation companies

| Field | Value |
| --- | --- |
| Keyword | `ai work companies`; `ai training companies`; `ai evaluation platforms`; `llm evaluation companies`; `rlhf companies`; `expert network ai`; `data annotation companies` |
| Intent | Discover which platforms exist |
| User problem | I don’t know the names |
| Search funnel stage | Awareness → Consideration |
| Correct Happy Tasking page type | Directory |
| Target URL | `/companies` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. DEMO labels on rows are OK; do not fabricate extra companies |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH vs affiliate top-10 posts |
| Competition hypothesis | HIGH |
| Cannibalization risk | MEDIUM vs homepage leaderboard and any “best companies” guide |
| Priority hypothesis | P0 |
| Notes | Homepage is “right now” pulse, not the directory. Never duplicate this H1 in a guide. |

### C-11 — {company} guidelines / reviewer quality / throttle (working conditions)

| Field | Value |
| --- | --- |
| Keyword | `{company} guidelines`; `{company} reviewers`; `{company} throttle`; `{company} task limit`; `outlier reviewers`; `outlier throttle` |
| Intent | How work is governed **here** after hire |
| User problem | Unfair reviews, sudden limits, opaque rules |
| Search funnel stage | Post-decision |
| Correct Happy Tasking page type | Company (plus Issues if it is a public dispute) |
| Target URL | `/companies/{slug}` |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Do not publish confidential guideline text |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | MEDIUM — worker Discords |
| Cannibalization risk | MEDIUM vs Issues and screening guides |
| Priority hypothesis | P2 |
| Notes | Public process only. Leaked client guidelines are forbidden. |

---

## 2. COMPARISON

**Owner of a named pair:** `/compare/{canonicalSlug}` (alphabetical slugs, e.g. Outlier vs Mercor → `/compare/mercor-vs-outlier`).  
**Owner of the tool:** `/compare`.  
**Do not** generate N×N pairs. **Do not** index demo pairs. **Do not** write `{A} vs {B}` guides.

### X-01 — {A} vs {B}

| Field | Value |
| --- | --- |
| Keyword | `{A} vs {B}`; **observed:** `outlier vs mercor`, `outlier vs dataannotation`; also other named pairs |
| Intent | Pairwise decision / comparison |
| User problem | Screening time is scarce; switching cost is high |
| Search funnel stage | Consideration → Decision |
| Evidence class | **OBSERVED SERP EVIDENCE** for `outlier vs mercor` and `outlier vs dataannotation`. Other pairs inherit as HYPOTHESIS. |
| PRIMARY OWNER | Compare (permanent landing) |
| SUPPORTING PAGE | Company (each side) |
| Confidence | HIGH |
| Correct Happy Tasking page type | Comparison |
| Target URL | `/compare/{canonicalSlug}` — `/compare/mercor-vs-outlier`, `/compare/dataannotation-vs-outlier` |
| Current route exists? | Yes for resolvable pairs |
| Current content/data readiness | Demo / noindex for current production pairs. Needs both companies eligible + distinct comparison content |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH — pay/availability/stability side by side; **no declared winner** |
| Competition (observed) | Pairwise searches already produce **dedicated comparison content** (validates `/compare/[comparisonSlug]`, not a blog post) |
| Cannibalization risk | HIGH vs two company pages and any `{A} vs {B}` guide. Company pages **support**, they do not own the pair query. |
| Priority hypothesis | P2 |
| Notes | VERIFIED PLANNER: `outlier vs mercor` 50 ads Low; `outlier vs dataannotation` 50 ads Low (Outlier-side **MEDIUM-LOW** volume confidence); `mercor vs dataannotation` **UNKNOWN**. Action: WAIT FOR REAL DATA. Never write pair MDX. |

### X-02 — Compare AI training / AI work companies (tool)

| Field | Value |
| --- | --- |
| Keyword | `compare ai training companies`; `compare ai work platforms`; `compare ai evaluation platforms`; `ai company comparison tool` |
| Intent | Use a picker; pair not chosen yet |
| User problem | I want to select two names myself |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | Compare hub |
| Target URL | `/compare` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready (SSR options) |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH as a product, not an article |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH vs a how-to **guide** with the same H1 |
| Priority hypothesis | P0 |
| Notes | Hub = do the comparison. Guide X-04 = what to look at. Different H1s required. |

### X-03 — Best AI training company / which platform is best

| Field | Value |
| --- | --- |
| Keyword | `best ai training company`; `best ai evaluation platform`; `best llm training platform 2026`; `best ai data labeling company`; `which ai training platform is best` |
| Intent | Ranked winner (listicle) |
| User problem | Too many names; wants a shortcut |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | **Do not create a winner article.** Serve Directory + Compare hub; “best for me” → TaskMatch |
| Target URL | `/companies` (discover) + `/compare` (decide) + `/taskmatch` (personalized) |
| Current route exists? | Yes (hubs) |
| Current content/data readiness | Do not create a new URL |
| TaskMatch conversion potential | HIGH if we send “best for *you*” to TaskMatch |
| Happy Tasking differentiation | HIGH by **refusing** affiliate best-of |
| Competition hypothesis | HIGH — content farms |
| Cannibalization risk | CRITICAL if we publish “Best 10 AI companies” |
| Priority hypothesis | P0 defend; Hold on new URL |
| Notes | TaskMatch answers “best for me”. That is not a public ranking page. |

### X-04 — How to compare AI training platforms (method)

| Field | Value |
| --- | --- |
| Keyword | `how to compare ai training platforms`; `what to look for in an ai evaluation company`; `how to choose an ai training platform` |
| Intent | Learn the **criteria**, not run a named pair |
| User problem | I don’t know which signals matter (pay vs availability vs resolution) |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/how-to-compare-ai-training-platforms` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built. Needs original methodology; must not declare winners or clone `/compare` |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH — HT methodology is the product |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH vs X-02 if H1 is “Compare companies” |
| Priority hypothesis | P1 |
| Notes | Sprint 4 adjacent candidate. Link to `/compare` as the tool. No `{A} vs {B}` in the slug. |

### X-05 — {company} or {company} / {company} versus {company} (synonyms of X-01)

| Field | Value |
| --- | --- |
| Keyword | `{A} or {B}`; `outlier or mercor`; `mercor versus turing`; `outlier vs mercor vs turing` |
| Intent | Same as X-01 for two names. Three-plus names is **not** a landing we should mill |
| User problem | Binary (or messy multi) choice |
| Search funnel stage | Consideration → Decision |
| Correct Happy Tasking page type | Comparison for two names. For 3+, Compare hub — **do not** build `/compare/a-vs-b-vs-c` |
| Target URL | `/compare/{canonicalSlug}` or `/compare` |
| Current route exists? | Pair landings yes; three-way no (correct) |
| Current content/data readiness | Demo / noindex for pairs; do not create three-way URLs |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH for pairs; LOW if we spam combinations |
| Competition hypothesis | MEDIUM–HIGH |
| Cannibalization risk | HIGH if three-way pages compete with pairs and the hub |
| Priority hypothesis | P2 for pairs; Hold for 3+ URLs |
| Notes | Sitemap caps already exist so we do not explode N×N. Keep that. |

---

## 3. JOB / OPPORTUNITY

**Split that was wrong before:** “AI training jobs” as **find work** is TaskMatch. “What is this job?” is a Guide. Those are two intents — two URLs, two H1s.

### J-01 — AI training / trainer / evaluator jobs (find work)

| Field | Value |
| --- | --- |
| Keyword | **VERIFIED PLANNER:** `ai training jobs` 50,000/mo YoY +900% ads Medium; `remote ai training jobs` 5,000 ads Medium; `ai trainer jobs` 5,000 ads Low; `ai evaluator jobs` 500 ads Medium; `llm evaluator jobs` 50 ads Low |
| Intent | GENERIC JOB INTENT — find available work (not a named company) |
| User problem | Where do I apply? What is open? |
| Search funnel stage | Decision |
| Evidence class | VERIFIED KEYWORD PLANNER DATA + OBSERVED SERP EVIDENCE |
| PRIMARY OWNER | TaskMatch |
| SUPPORTING PAGE | Guide (role explainers only — different H1) |
| Confidence | SERP HIGH; Planner HIGH for training/remote/trainer |
| Correct Happy Tasking page type | TaskMatch |
| Target URL | `/taskmatch` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. Depth depends on real non-demo listings |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM vs Indeed; HIGH if matching uses HT intelligence |
| Competition | Ads competition Medium/Low = **advertiser** competition, not SEO difficulty. Organic difficulty UNKNOWN. |
| Cannibalization risk | HIGH if a Guide uses those H1s. **Do not** pull `dataannotation jobs` / `mercor jobs` onto this page as primary (those are C-05). |
| Priority hypothesis | FIRST-10 #1: IMPROVE PRODUCT. VERY HIGH. |
| Notes | Company-branded jobs are a **different** intent. |

### J-07 — AI coding jobs (find technical AI work)

| Field | Value |
| --- | --- |
| Keyword | **VERIFIED PLANNER:** `ai coding jobs` 500/mo, ads Medium |
| Intent | Find technical AI work |
| User problem | Engineer-shaped openings, not a definition |
| Search funnel stage | Decision |
| Evidence class | VERIFIED KEYWORD PLANNER DATA + OBSERVED SERP EVIDENCE |
| PRIMARY OWNER | TaskMatch |
| SUPPORTING PAGE | Informational Coding Guide (editorial B) — **not** owner of this query |
| Confidence | SERP HIGH; volume smaller than training jobs; INTERNAL priority HIGH for product fit |
| Correct Happy Tasking page type | TaskMatch |
| Target URL | `/taskmatch` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM vs job boards |
| Competition | Ads Medium ≠ SEO difficulty |
| Cannibalization risk | CRITICAL if coding Guide H1/slug is `ai coding jobs` |
| Priority hypothesis | FIRST-10 #6 cluster on TaskMatch |
| Notes | Guide answers what the work is. TaskMatch owns transactional intent. |

### J-08 — AI work from home (emerging, monitor)

| Field | Value |
| --- | --- |
| Keyword | **VERIFIED PLANNER:** `ai work from home` 500/mo, YoY +900%, ads Medium |
| Intent | Remote/generic job discovery (likely) |
| User problem | Work from home in this market |
| Search funnel stage | Decision |
| Evidence class | VERIFIED KEYWORD PLANNER DATA; SERP not separately coded — INTERNAL: treat as TaskMatch cluster to **monitor** |
| PRIMARY OWNER | TaskMatch |
| SUPPORTING PAGE | none yet |
| Confidence | MEDIUM (emerging; may mix non-AI-work WFH) |
| Target URL | `/taskmatch` — no dedicated `/remote` unless future research justifies it |
| Current route exists? | Yes |
| Recommended next action | Monitor; do not mint a new URL |
| Notes | Status: emerging cluster. |

### J-02 — Data annotation / labeling jobs (generic, not the DataAnnotation brand)

| Field | Value |
| --- | --- |
| Keyword | `data annotation jobs`; `data labeling jobs remote`; `ai tagging jobs`; `crowdsource ai jobs` |
| Intent | Find annotation-style work |
| User problem | Different from expert LLM evaluation; people use the words interchangeably |
| Search funnel stage | Decision |
| Correct Happy Tasking page type | TaskMatch |
| Target URL | `/taskmatch` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready; listings must not be invented |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM |
| Competition hypothesis | HIGH |
| Cannibalization risk | HIGH vs R-02 (education) if both H1s say “data annotation jobs” |
| Priority hypothesis | P0 product; Guide R-02 owns definitions |
| Notes | Generic “data annotation jobs” (category) ≠ branded `dataannotation jobs` (C-05, 50,000/mo, Company). Do not mix those owners. |

### J-03 — {skill or profession} AI jobs (find work)

| Field | Value |
| --- | --- |
| Keyword | `python llm evaluation jobs`; `javascript ai training jobs`; `legal ai training jobs`; `medical ai evaluation jobs`; `bilingual ai evaluation jobs`; `writing ai trainer jobs` |
| Intent | Openings filtered by skill or profession |
| User problem | I already have a craft; where does it map? |
| Search funnel stage | Decision |
| Correct Happy Tasking page type | TaskMatch. `/skills/{slug}` may support **listings**, not essays |
| Target URL | `/taskmatch` |
| Current route exists? | Yes. `/skills/{slug}` yes |
| Current content/data readiness | TaskMatch hub ready. Skill pages client / thin — not the SEO engine yet |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM until skill pages are SSR and unique |
| Competition hypothesis | HIGH |
| Cannibalization risk | HIGH vs Skills guides (K-*) |
| Priority hypothesis | P3 for skill URL SEO; P0 for TaskMatch as owner |
| Notes | Do not title `/skills/python` “What is Python in AI evaluation”. |

### J-04 — Side hustle / part-time AI work (find work)

| Field | Value |
| --- | --- |
| Keyword | `ai training side hustle`; `part time ai evaluator`; `flexible ai tasks remote` |
| Intent | Flexible paid work, not a career essay |
| User problem | Extra income; hours are bursty |
| Search funnel stage | Decision |
| Correct Happy Tasking page type | TaskMatch |
| Target URL | `/taskmatch` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. Do not promise hours that data does not support |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM — availability data is the honest differentiator |
| Competition hypothesis | HIGH — hustle YouTube |
| Cannibalization risk | MEDIUM vs T-01 / Market if we overclaim supply |
| Priority hypothesis | P0 as TaskMatch intent; Hold as a separate “side hustle” URL |
| Notes | No `/guides/ai-side-hustle-2026` mill post. Availability caveats belong on Market/Company. |

### J-05 — One listing (opportunity detail)

| Field | Value |
| --- | --- |
| Keyword | Rare, listing-title shaped queries |
| Intent | This opening |
| User problem | Evaluate or apply to a specific role |
| Search funnel stage | Decision |
| Correct Happy Tasking page type | Opportunity |
| Target URL | `/taskmatch/opportunities/{slug}` |
| Current route exists? | Yes |
| Current content/data readiness | Client / thin. Demo listings stay out of sitemap |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | LOW–MEDIUM |
| Competition hypothesis | UNKNOWN |
| Cannibalization risk | MEDIUM vs company `{company} jobs` |
| Priority hypothesis | P3 (crawlability leftover, not a content program) |
| Notes | Do not generate opportunity-shaped guides. |

### J-06 — Freelance / contractor AI evaluation (find work)

| Field | Value |
| --- | --- |
| Keyword | `freelance ai evaluation`; `contractor llm trainer`; `1099 ai training jobs` |
| Intent | Contractor-shaped discovery |
| User problem | Employment model matters as much as the task type |
| Search funnel stage | Decision |
| Correct Happy Tasking page type | TaskMatch (discovery). Pay **mechanics** stay on P-01 |
| Target URL | `/taskmatch` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. No tax advice |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM |
| Competition hypothesis | MEDIUM–HIGH |
| Cannibalization risk | MEDIUM vs P-01 if TaskMatch H1 becomes “how AI work is paid” |
| Priority hypothesis | P0 TaskMatch; P1 for pay mechanics guide |
| Notes | Split discovery vs education. |

---

## 4. ROLE / EDUCATIONAL

**Owner:** `/guides/[slug]` when original, sourced, eligible. **None published today.** Hub `/guides` is indexable with an honest empty state.

### R-01 — What does an AI evaluator do

| Field | Value |
| --- | --- |
| Keyword | **observed:** `what does an ai evaluator do`; related educational: `ai evaluator job description` *(if SERP is educational, not listings)* |
| Intent | Educational / role understanding |
| User problem | Is this work, a gig, or labeling? |
| Search funnel stage | Awareness |
| Evidence class | **OBSERVED SERP EVIDENCE** |
| PRIMARY OWNER | Guide |
| SUPPORTING PAGE | TaskMatch |
| Confidence | HIGH |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/what-does-an-ai-evaluator-do` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built. Original explainer; no invented pay |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH if practical and non-hype |
| Competition (hypothesis) | MEDIUM |
| Cannibalization risk | HIGH vs J-01 if titled `ai evaluator jobs`. Observed SERP: jobs query ≠ this query. |
| Priority hypothesis | P1 candidate only — see FIRST-10-TARGETS.md |
| Notes | Sprint 4 candidate. Do not auto-write. TaskMatch supports; it does not own this educational query. |

### R-10 — What is an AI trainer

| Field | Value |
| --- | --- |
| Keyword | **VERIFIED PLANNER + OBSERVED SERP:** `what is an ai trainer` 500/mo, ads Low |
| Intent | Educational / role understanding |
| User problem | “Trainer” vs evaluator vs annotator |
| Search funnel stage | Awareness |
| Evidence class | VERIFIED KEYWORD PLANNER DATA + OBSERVED SERP EVIDENCE |
| PRIMARY OWNER | Guide |
| SUPPORTING PAGE | TaskMatch |
| Confidence | HIGH |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/what-is-an-ai-trainer` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built. FIRST-10 #8: CREATE GUIDE when a human writes it. |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH |
| Competition | Ads Low ≠ SEO difficulty |
| Cannibalization risk | HIGH vs `ai trainer jobs` (TaskMatch, 5,000/mo) |
| Priority hypothesis | HIGH editorial candidate |
| Notes | Do not target `ai trainer jobs`. Pulled out of R-06 glossary. |


### R-09 — How does AI training work (ambiguous — do not prioritize)

| Field | Value |
| --- | --- |
| Keyword | **observed:** `how does ai training work` |
| Intent | Educational, but Google may interpret as **technical ML model training**, not human AI-work |
| User problem | Unclear — learner vs ML engineer vs AI-work contributor |
| Search funnel stage | Awareness |
| Evidence class | **OBSERVED SERP EVIDENCE** (caution) |
| PRIMARY OWNER | Guide *only if* HT ever targets it; otherwise **none** |
| SUPPORTING PAGE | none |
| Confidence | MEDIUM |
| Correct Happy Tasking page type | Do not prioritize. If written much later, must disambiguate human AI-work in the H1 (`how human AI-training work usually works`) |
| Target URL | None now. Do **not** create `/guides/how-does-ai-training-work` |
| Current route exists? | No |
| Current content/data readiness | Do not create |
| TaskMatch conversion potential | UNKNOWN — wrong-intent traffic is waste |
| Happy Tasking differentiation | LOW if SERP is textbooks/PyTorch |
| Competition (observed ambiguity) | Likely technical ML content, courses, vendor blogs |
| Cannibalization risk | MEDIUM vs R-04 on-ramp if both chase “how AI training works” |
| Priority hypothesis | **Hold.** Do not put in FIRST-10. Do not use as a P1 title. |
| Notes | Observation 9. Stronger evidence required before this is a Happy Tasking target. |

### R-02 — AI training vs data annotation

| Field | Value |
| --- | --- |
| Keyword | `ai training vs data annotation`; `rlhf vs data labeling`; `llm evaluation vs annotation`; `ai trainer vs annotator` |
| Intent | Distinguish kinds of work |
| User problem | Platforms reuse the same words |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/ai-training-vs-data-annotation` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | LOW if companies are examples only, not the H1; CRITICAL if slug is `{A}-vs-{B}` |
| Priority hypothesis | P1 |
| Notes | Named companies belong in related links, not as the primary query. |

### R-03 — AI coding work for software developers (explainer)

| Field | Value |
| --- | --- |
| Keyword | `what is code evaluation for ai models`; `ai training work for software engineers`; `what is llm code evaluation` — **not** `ai coding jobs` |
| Intent | Role fit for engineers — education |
| User problem | How is this different from a software job? |
| Search funnel stage | Awareness |
| Evidence class | HYPOTHESIS for explanatory queries. Exact `ai coding jobs` is **OBSERVED** as TaskMatch (J-07). |
| PRIMARY OWNER | Guide (education only) |
| SUPPORTING PAGE | This guide **supports** `ai coding jobs`; TaskMatch is that query’s primary |
| Confidence | — (education); HIGH that `ai coding jobs` is **not** this page |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/ai-coding-work-for-software-developers` *(candidate — not created; must **not** own `ai coding jobs`)* |
| Current route exists? | No |
| Current content/data readiness | Not built. Link TaskMatch; no fake openings |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH |
| Competition (hypothesis) | HIGH for the head “AI coding jobs” (job boards) |
| Cannibalization risk | **CRITICAL** if H1/slug is `ai coding jobs` — SERP assigns that to TaskMatch |
| Priority hypothesis | P1 education only after H1 is non-jobs |
| Notes | **SERP override:** do not treat `ai coding jobs` as a guide primary. |

### R-04 — How to start AI training work (on-ramp)

| Field | Value |
| --- | --- |
| Keyword | `how to start ai training work`; `how to become an ai evaluator`; `ai training jobs guide`; `getting started with llm evaluation work` |
| Intent | On-ramp education |
| User problem | I don’t know how this market works |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/ai-training-jobs-practical-guide` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built. Point to companies / compare / TaskMatch; must not clone the job board |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM |
| Competition hypothesis | HIGH |
| Cannibalization risk | HIGH vs TaskMatch and `/companies` |
| Priority hypothesis | P1 |
| Notes | Sprint 4 candidate. Not a second `/taskmatch`. |

### R-05 — How to vet an AI work platform

| Field | Value |
| --- | --- |
| Keyword | `how to tell if an ai training platform is legit`; `how to vet ai evaluation companies`; `ai task platform red flags` |
| Intent | Cross-company trust education |
| User problem | Scam/legit queries without a single brand |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/how-to-vet-an-ai-work-platform` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built. Use methodology + issues concepts; no fake certifications |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | MEDIUM vs C-04 (named company) and Issues hub |
| Priority hypothesis | P1 |
| Notes | `is outlier legit` stays on `/companies/outlier`. |

### R-06 — What is RLHF / LLM evaluation / AI rater

| Field | Value |
| --- | --- |
| Keyword | `what is rlhf work`; `what is llm evaluation`; `what is preference labeling`; `what is model evaluation work` — **`what is an ai trainer` moved to R-10** |
| Intent | Define technical/work terms |
| User problem | Jargon gate |
| Search funnel stage | Awareness |
| Evidence class | HYPOTHESIS (except trainer — see R-10 OBSERVED) |
| PRIMARY OWNER | Guide |
| SUPPORTING PAGE | TaskMatch |
| Confidence | — |
| Correct Happy Tasking page type | Guide (one solid explainer — not a glossary mill) |
| Target URL | `/guides/what-is-rlhf-work` *(candidate — not created)*; do not spawn one thin URL per synonym |
| Current route exists? | No |
| Current content/data readiness | Not built |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | MEDIUM–HIGH |
| Competition (hypothesis) | HIGH for `what is rlhf` (Wikipedia, vendor blogs) |
| Cannibalization risk | HIGH if five synonym URLs target the same definition; HIGH vs R-10 if trainer is duplicated here |
| Priority hypothesis | P1 for one canonical explainer; Hold on synonym mill |
| Notes | SERP mapping change: `what is an ai trainer` is a **role** query (R-10), not this glossary. |

### R-07 — Domain expert AI work (STEM, legal, healthcare, writing)

| Field | Value |
| --- | --- |
| Keyword | `legal ai training work`; `medical ai evaluation work`; `phd ai training`; `expert network ai work explained`; `writing jobs training ai` |
| Intent | Role education for a profession — **not** `{skill} jobs` listings |
| User problem | “Does my credential map?” |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide |
| Target URL | One original guide per **real** expertise we can write — not `/guides/legal`, `/guides/medical`, `/guides/phd` as a template |
| Current route exists? | No |
| Current content/data readiness | Not built. Only write with genuine knowledge; no invented hiring stats |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH if specific |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH vs J-03 and K-02 if H1 is jobs |
| Priority hypothesis | P1 only with a real author; else Hold |
| Notes | Listings remain TaskMatch. |

### R-08 — Guides hub

| Field | Value |
| --- | --- |
| Keyword | `ai work guides`; `ai training guides`; `happy tasking guides` |
| Intent | Find explainers |
| User problem | Education, not a dashboard |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guides hub |
| Target URL | `/guides` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. **No published articles.** Empty state is correct |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH if we never fill it with mill content |
| Competition hypothesis | UNKNOWN |
| Cannibalization risk | HIGH if we publish thin posts “to look active” |
| Priority hypothesis | P0 |
| Notes | Do not publish a fake guide for Search Console. |

---

## 5. SCREENING / APPLICATION

**Policy:** public process and legitimate preparation only. Never leaked questions, answers, proprietary prompts, or client material.

### S-01 — How AI work screenings usually work

| Field | Value |
| --- | --- |
| Keyword | generic screening education; **observed support role** for `outlier assessment` / `mercor interview`; see S-05 for `ai coding assessment` |
| Intent | General process education |
| User problem | Surprise formats, unpaid tests, unclear “pass” |
| Search funnel stage | Awareness → Consideration |
| Evidence class | Architecture **HYPOTHESIS** as generic owner; SERP **OBSERVED** that company screening queries are **not** this page’s primary |
| PRIMARY OWNER | Guide (generic only) |
| SUPPORTING PAGE | Company pages for named assessments; TaskMatch for generic coding-assessment job-seekers |
| Confidence | HIGH that company-specific screening is **not** owned here |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/how-ai-work-screenings-work` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built. Public-process only |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH (trust) |
| Competition (hypothesis) | MEDIUM |
| Cannibalization risk | **CRITICAL** if this becomes `/guides/outlier-assessment` or `/guides/mercor-interview` |
| Priority hypothesis | P1 candidate — see FIRST-10-TARGETS.md |
| Notes | Observations 6–8. Do not create company-specific screening guides. No leaked questions. |

### S-02 — {company} assessment / interview / application

| Field | Value |
| --- | --- |
| Keyword | **observed:** `outlier assessment` → `/companies/outlier`; `mercor interview` → `/companies/mercor`; also `{company} application process` |
| Intent | Company-specific application / screening |
| User problem | Company-specific steps |
| Search funnel stage | Consideration → Decision |
| Evidence class | **OBSERVED SERP EVIDENCE** |
| PRIMARY OWNER | Company |
| SUPPORTING PAGE | Generic screening Guide (S-01) |
| Confidence | HIGH |
| Correct Happy Tasking page type | Company |
| Target URL | `/companies/{slug}` |
| Current route exists? | Company yes. Dedicated screening URL **must not** exist as a leak page |
| Current content/data readiness | Demo / noindex. Official public docs + contributor *process experience*, not items |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM |
| Competition (hypothesis) | HIGH — Discord dumps, YouTube |
| Cannibalization risk | **CRITICAL** if we publish company-specific screening guides or “how to pass {company}” |
| Priority hypothesis | P2 on the company page; Hold as a separate URL |
| Notes | Observation 5 and 7. Do not create `/guides/outlier-assessment` or `/guides/mercor-interview`. |

### S-03 — Failed assessment / how long screening takes (general)

| Field | Value |
| --- | --- |
| Keyword | `failed ai training assessment`; `how long does ai evaluator screening take`; `ai training onboard unpaid` |
| Intent | General expectations |
| User problem | Time cost and rejection without feedback |
| Search funnel stage | Awareness or Post-decision |
| Correct Happy Tasking page type | Guide (S-01 can cover this; do not fork extra stubs) |
| Target URL | Same as S-01 unless a genuinely different article exists |
| Current route exists? | No |
| Current content/data readiness | Not built. `{company} failed assessment` → Company, not a new guide |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH if honest about unpaid time |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH if forked into many near-duplicate guides |
| Priority hypothesis | P1 as part of S-01; Hold as extra URLs |
| Notes | Named company timing → C- / S-02. |

### S-04 — Leaked questions / “answers” / dumps

| Field | Value |
| --- | --- |
| Keyword | `{company} assessment answers`; `outlier assessment questions`; `mercor interview dump`; `ai training task prompts leaked` |
| Intent | Cheat / obtain confidential material |
| User problem | Pass by leaking |
| Search funnel stage | Decision (harmful) |
| Correct Happy Tasking page type | **Do not create.** 404 any such file |
| Target URL | None |
| Current route exists? | No (correct) |
| Current content/data readiness | Do not create |
| TaskMatch conversion potential | n/a |
| Happy Tasking differentiation | Trust is the differentiator — we refuse |
| Competition hypothesis | HIGH — leak Discords |
| Cannibalization risk | n/a |
| Priority hypothesis | Hold / do not create |
| Notes | Observation 8. Same rule as the rest of the repo: share experience, not confidential work. Do not rank for leaked questions, assessment answers, proprietary prompts, or confidential screening material. |

### S-05 — AI coding assessment (generic)

| Field | Value |
| --- | --- |
| Keyword | **VERIFIED PLANNER + OBSERVED SERP:** `ai coding assessment` 50/mo, ads Medium. Trend showed newly emerging / infinite % due to prior zero baseline — **not** a stable growth rate. |
| Intent | Generic preparation / educational (not a named company) |
| User problem | What kind of coding screen happens in AI-work hiring? |
| Search funnel stage | Awareness → Consideration |
| Evidence class | **OBSERVED SERP EVIDENCE** |
| PRIMARY OWNER | Guide |
| SUPPORTING PAGE | TaskMatch |
| Confidence | MEDIUM |
| Correct Happy Tasking page type | Guide |
| Target URL | Prefer S-01 (`/guides/how-ai-work-screenings-work`) covering coding screens as a section — **not** `/guides/outlier-coding-assessment` |
| Current route exists? | No |
| Current content/data readiness | Not built. Public process only. Ambiguous vs generic software-interview SERPs |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | MEDIUM if scoped to AI-work platforms |
| Competition (hypothesis) | MEDIUM — LeetCode-style content may pollute this SERP |
| Cannibalization risk | HIGH vs S-02 if the guide becomes company-specific; HIGH vs J-07 if H1 is `ai coding jobs` |
| Priority hypothesis | Hold extra URL; fold into S-01 unless SERP stays AI-work-specific |
| Notes | MEDIUM confidence. Do not prioritize a standalone page yet. |

---

## 6. PAY

### P-01 — How task-based AI work is paid (mechanics)

| Field | Value |
| --- | --- |
| Keyword | `how ai training work is paid`; `how does rlhf pay work`; `ai evaluator pay` *(mechanics / “how much do they make” as education)*; `hourly vs per task ai work`; `unpaid onboarding ai training` *(educational)* |
| Intent | Compensation **mechanics** across the industry |
| User problem | Hourly vs task vs bonus; unpaid tests; currency |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/how-task-based-ai-work-is-paid` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built. **No invented rates.** Teach how to read HT reports |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH vs C-02 and `/market` |
| Priority hypothesis | P1 |
| Notes | No company in the H1. Named rates → company page. Trends **now** → Market. Sprint 4 candidate. |

### P-05 — Generic trainer pay / hourly rate (small Planner demand)

| Field | Value |
| --- | --- |
| Keyword | **VERIFIED PLANNER:** `ai trainer pay` 50/mo ads Low; `ai training hourly rate` 50/mo ads Low |
| Intent | Broad current compensation conditions **or** mechanics — not `{company} pay` |
| User problem | What does this kind of work pay in general? |
| Search funnel stage | Consideration |
| Evidence class | VERIFIED KEYWORD PLANNER DATA |
| PRIMARY OWNER | Market / relevant Guide (same cluster, two H1s if both exist: now vs how) |
| SUPPORTING PAGE | Company pages for named rates |
| Confidence | Volume is small; do not build a new URL just for these strings |
| Target URL | `/market` and/or P-01 guide — **not** `/guides/ai-trainer-pay` as a third page |
| Cannibalization risk | HIGH vs C-02 `{company} pay` and vs each other if two pages share H1 |
| Priority hypothesis | Supporting; not FIRST-10 |
| Notes | INTERNAL: TaskPulse/Market product, not a pay mill. |

### P-02 — AI work pay and demand **now** (market dashboard)

| Field | Value |
| --- | --- |
| Keyword | `ai work market`; `ai training pay 2026` *(as current conditions)*; `ai work market rates`; `is ai training pay going down` |
| Intent | Cross-company conditions this period |
| User problem | Are rates up or down **now**? |
| Search funnel stage | Consideration or Post-decision |
| Correct Happy Tasking page type | Market |
| Target URL | `/market` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. Aggregates from contributor reports; DEMO labeled if demo |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | LOW–MEDIUM |
| Cannibalization risk | HIGH vs P-01 if Market H1 becomes “How AI work is paid” |
| Priority hypothesis | P0 |
| Notes | Market = dashboard of now. Guide = how pay works. Company = this platform. |

### P-03 — Which platform pays the most

| Field | Value |
| --- | --- |
| Keyword | `highest paying ai training platform`; `which ai evaluator company pays most`; `best paying llm evaluation jobs` |
| Intent | Ranked pay comparison (often listicle) |
| User problem | Maximize $/hour without context (availability, unpaid tests) |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | Market (cross-section) + Compare hub + TaskMatch. **Do not** create a “highest paying” article |
| Target URL | `/market` primary for the snapshot; `/compare` if they pick two names; `/taskmatch` for “highest for me” |
| Current route exists? | Yes (hubs) |
| Current content/data readiness | Do not create a winner URL. Market must not fake a ranking |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH if we show sample size and availability together |
| Competition hypothesis | HIGH — affiliate posts |
| Cannibalization risk | CRITICAL vs X-03 and company pay pages |
| Priority hypothesis | Hold on new URL; P0 defend hubs |
| Notes | A pair query with pay intent is still X-01, not a new pay URL. |

### P-04 — Pay by country (cross-market)

| Field | Value |
| --- | --- |
| Keyword | `ai training pay by country`; `ai evaluator pay india`; `ai training pay brazil` *(as market-wide, not `{company} in brazil`)* |
| Intent | Geographic pay **pattern**, not one company |
| User problem | PPP, payout rails, who is eligible |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | Market if it is a live aggregate. **At most one** original regional Guide if we have real knowledge (see N-01). Not a country mill |
| Target URL | `/market` and/or a single future guide — **not** `/pay/india` |
| Current route exists? | `/market` yes; country URLs no (correct) |
| Current content/data readiness | Market hub ready but not a geo CMS. Country guides not built |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH if true; LOW if templated |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | CRITICAL vs N-01 mill and C-02 |
| Priority hypothesis | P0 Market; Hold programmatic geo |
| Notes | `{company} pay in india` → Company, not Market. |

---

## 7. TASK AVAILABILITY

**Observed split:** company-specific availability → Company; broad/current cross-platform → Market; personalized opportunity availability → TaskMatch.

**Strategic note:** Search demand around task availability may indicate not only an SEO opportunity but a **product opportunity for TaskPulse / community-reported work availability.** Do not add a new SEO URL named TaskPulse in this research.

The exact query `ai task availability` is **OBSERVED** at MEDIUM confidence with owner “Market / Guide” — that is a remaining ambiguity (T-04).

### T-01 — Understanding task availability in AI work

| Field | Value |
| --- | --- |
| Keyword | explanatory: `why did my ai tasks disappear`; `ai training throttle`; `ai evaluator no work` *(general)* — **not** `{company} no tasks`; exact `ai task availability` see T-04 |
| Intent | Explain empty queues **as a phenomenon** |
| User problem | Idle after passing; is it me or the market? |
| Search funnel stage | Awareness or Post-decision |
| Evidence class | HYPOTHESIS as educational owner; SERP **OBSERVED** that `outlier no tasks` is **not** this page |
| PRIMARY OWNER | Guide (phenomenon) |
| SUPPORTING PAGE | Market (now), TaskMatch (personalized), Company (named) |
| Confidence | HIGH that named-company idle is Company; MEDIUM for exact `ai task availability` (T-04) |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/understanding-task-availability-in-ai-work` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built |
| TaskMatch conversion potential | HIGH (match elsewhere) |
| Happy Tasking differentiation | HIGH — product + SEO |
| Competition (hypothesis) | MEDIUM |
| Cannibalization risk | HIGH vs C-03, Market, and T-04 if H1 is `ai task availability` **and** Market uses the same H1 |
| Priority hypothesis | P1 candidate — see FIRST-10-TARGETS.md |
| Notes | H1 must not be `{Company} no tasks`. Prefer teaching language (“why queues go empty”) so Market can own “availability **now**”. |

### T-02 — AI work demand / task pulse **now**

| Field | Value |
| --- | --- |
| Keyword | `ai training demand`; `are there ai evaluation tasks right now`; `ai work pulse`; `is ai training slow right now`; **observed overlap:** `ai task availability` when the intent is current/cross-platform (T-04) |
| Intent | Cross-company supply snapshot |
| User problem | Is the whole market dry this week? |
| Search funnel stage | Consideration or Post-decision |
| Evidence class | HYPOTHESIS for pulse queries; **OBSERVED** that broad availability intelligence is **not** company-specific |
| PRIMARY OWNER | Market |
| SUPPORTING PAGE | TaskMatch (personalized); Guide (what availability means) |
| Confidence | MEDIUM for exact `ai task availability` |
| Correct Happy Tasking page type | Market |
| Target URL | `/market` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. Real community reports would also power TaskPulse-like product value |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition (hypothesis) | LOW |
| Cannibalization risk | HIGH vs T-01/T-04 if both target `ai task availability` |
| Priority hypothesis | P0 hub |
| Notes | Homepage may mention pulse. Market owns the dashboard query. Personalized slots → TaskMatch, not a second market URL. |

### T-04 — Exact query: ai task availability (ambiguous)

| Field | Value |
| --- | --- |
| Keyword | **observed:** `ai task availability` |
| Intent | Broad market / work-availability intelligence (SERP). Could mean “what is it” (Guide) or “is there work now” (Market) |
| User problem | Unclear without click data |
| Search funnel stage | Consideration or Post-decision |
| Evidence class | **OBSERVED SERP EVIDENCE** — MEDIUM; owner listed as Market / Guide |
| PRIMARY OWNER | **Unresolved between Market and Guide.** Interim rule: Market if the page is a live dashboard; Guide if educational. **One** of them may use a close variant H1 — not both. |
| SUPPORTING PAGE | TaskMatch |
| Confidence | MEDIUM |
| Correct Happy Tasking page type | Do not create a third URL |
| Target URL | `/market` *or* T-01 guide — pick at FIRST-10 finalization, not now |
| Current route exists? | `/market` yes; guide no |
| Current content/data readiness | Do not publish a competing guide titled “AI task availability” while Market exists |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH as product (TaskPulse / community reports) |
| Competition (hypothesis) | UNKNOWN |
| Cannibalization risk | **NEW (SERP):** Market vs Guide for the same exact query. Also vs TaskMatch if TaskMatch H1 becomes “AI task availability”. |
| Priority hypothesis | Hold exact-title targeting until FIRST-10 is finalized |
| Notes | Observation 10. Company-specific remains C-03. |

### T-03 — Project ended / offboarded / no more tasks after pass (general)

| Field | Value |
| --- | --- |
| Keyword | `ai training project ended`; `passed assessment no tasks`; `ai evaluator offboarded` *(general)* |
| Intent | Post-hire supply shock as a **pattern** |
| User problem | They thought passing guaranteed work |
| Search funnel stage | Post-decision |
| Correct Happy Tasking page type | Guide (usually T-01, not a second article) |
| Target URL | T-01 candidate |
| Current route exists? | No |
| Current content/data readiness | Not built. Named company → C-03 |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH if forked from T-01 |
| Priority hypothesis | P1 as T-01 coverage; Hold extra URLs |
| Notes | `{company} project ended` → Company. |

---

## 8. SKILLS

Seed skills in product include coding languages (Python, JavaScript, TypeScript, …), LLM/prompt/agent evaluation, RAG, tool calling, RLHF, data annotation, research, fact checking, plus domains (legal, healthcare, writing, translation, …).

### K-01 — What skills are useful for AI evaluation

| Field | Value |
| --- | --- |
| Keyword | `skills for ai evaluation`; `skills for llm evaluation jobs`; `what skills do ai trainers need`; `do i need python for ai evaluation` |
| Intent | Educational skill map |
| User problem | What to learn; what already counts |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide |
| Target URL | `/guides/skills-useful-for-ai-evaluation` *(candidate — not created)* |
| Current route exists? | No |
| Current content/data readiness | Not built. No fake certificates |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | MEDIUM |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | MEDIUM vs `/skills/*` |
| Priority hypothesis | P1 |
| Notes | Sprint 4 candidate. Skill URLs stay opportunity lists. |

### K-02 — {skill} openings (product filter)

| Field | Value |
| --- | --- |
| Keyword | `python` / `javascript` / `llm evaluation` / `legal` **as job filters**, not definitions |
| Intent | See current openings mentioning this skill |
| User problem | Filter work |
| Search funnel stage | Decision |
| Correct Happy Tasking page type | Skill listing (product). TaskMatch remains the personalized owner |
| Target URL | `/skills/{slug}` |
| Current route exists? | Yes |
| Current content/data readiness | Client / thin. Real listings required; later SSR is a crawlability issue, not this research |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | LOW until pages are unique and SSR |
| Competition hypothesis | HIGH for generic skill names (`python jobs`) |
| Cannibalization risk | HIGH vs K-01 and J-03 |
| Priority hypothesis | P3 — **do not** programmatic-expand essays per skill |
| Notes | Sprint 5 must not turn every skill into a 2,000-word SEO page. |

### K-03 — Prompt / agent / RAG / tool-calling evaluation (education)

| Field | Value |
| --- | --- |
| Keyword | `what is prompt evaluation work`; `agent evaluation jobs explained`; `rag evaluation work`; `tool calling evaluation` |
| Intent | Explain specialized evaluation types |
| User problem | New jargon for the same market |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide — prefer covering inside K-01 or R-06 unless there is enough original substance for a **separate** article |
| Target URL | `/guides/...` *(not created)*; not `/skills/prompt-evaluation` as an essay |
| Current route exists? | Skill routes exist as listings only |
| Current content/data readiness | Not built as guides. Skill pages client / thin |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH if specific and honest |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH if each skill gets a cloned “what is {skill}” page |
| Priority hypothesis | Hold mill; P1 only for original pieces |
| Notes | Listings → K-02 / TaskMatch. |

---

## 9. COUNTRY / REGION

**There is no `/countries/{code}` route.** Do not invent one here. Programmatic country SEO is Sprint 5+ and out of scope.

### N-01 — AI training work in {country} (editorial, rare)

| Field | Value |
| --- | --- |
| Keyword | `ai training jobs brazil`; `ai evaluation work india`; `ai training jobs philippines`; `ai evaluator kenya`; `trabajos ai training mexico`; `ai training jobs europe` |
| Intent | Regional access, payout, language, eligibility |
| User problem | Am I allowed? How does pay land? |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | **At most one original Guide** if we have real regional knowledge — not a template |
| Target URL | `/guides/...` only — **not** `/brazil` or `/countries/br` |
| Current route exists? | No |
| Current content/data readiness | Not built. Sprint 4 listed Brazil as a **candidate topic only** |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH if true; LOW if templated |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | CRITICAL if country×company×skill pages launch |
| Priority hypothesis | Hold / P3 |
| Notes | `{company} available in {country}` → Company page. Personalized eligibility → N-02 (noindex profile). |

### N-02 — Country as a TaskMatch profile fact

| Field | Value |
| --- | --- |
| Keyword | Weak as a public query; “jobs for me in {country}” is personalized |
| Intent | Matching eligibility |
| User problem | Show work I can actually take |
| Search funnel stage | Decision |
| Correct Happy Tasking page type | TaskMatch. Profile is private |
| Target URL | `/taskmatch` public; `/taskmatch/profile` **noindex** |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. Profile must stay noindex |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH as product, not as SEO pages |
| Competition hypothesis | n/a for the private profile |
| Cannibalization risk | LOW if profile stays noindex |
| Priority hypothesis | P0 product; not an SEO page |
| Notes | Do not canonicalize geo queries to the private profile. |

### N-03 — {company} hiring in {country}

| Field | Value |
| --- | --- |
| Keyword | `outlier hiring in india`; `mercor available in brazil`; `dataannotation countries` |
| Intent | Whether **this company** accepts workers in a place |
| User problem | Eligibility, not a travel guide |
| Search funnel stage | Consideration |
| Correct Happy Tasking page type | Company |
| Target URL | `/companies/{slug}` |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Do not invent geo coverage |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH if we only state what reports support |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH vs N-01 country guides |
| Priority hypothesis | P2 |
| Notes | No `/companies/outlier/india`. |

---

## 10. ISSUES / PROBLEMS

Community (`/community`) is discussion. It is **not** the primary target for complaints.

### I-01 — AI work issues / payment problems (hub)

| Field | Value |
| --- | --- |
| Keyword | `ai work platform issues`; `ai training payment delayed` *(category)*; `ai evaluator unpaid`; `ai work dispute` |
| Intent | Find structured reports / how resolution works |
| User problem | Star ratings don’t capture disputes |
| Search funnel stage | Post-decision or Consideration |
| Correct Happy Tasking page type | Issues hub |
| Target URL | `/issues` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. Empty state allowed; do not fabricate issues |
| TaskMatch conversion potential | LOW–MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | LOW–MEDIUM |
| Cannibalization risk | HIGH vs company issue modules and Community |
| Priority hypothesis | P0 |
| Notes | Keep H1 distinct from Community and from the pay **guide**. |

### I-02 — {company} payment delayed / unpaid onboarding / banned

| Field | Value |
| --- | --- |
| Keyword | `{company} payment delayed`; `{company} unpaid onboarding`; `{company} account banned`; `outlier payment delayed`; `dataannotation unpaid`; `remotasks payout problem` |
| Intent | Harm **at this company** |
| User problem | Did they fix it? How often? |
| Search funnel stage | Post-decision |
| Correct Happy Tasking page type | Company (resolution section) primary; Issues hub may filter |
| Target URL | `/companies/{slug}` ; `/issues?company={slug}` is **supporting**, not a second canonical |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex. Demo resolution metrics omitted (Sprint 2) |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | HIGH if query-param issues pages get unique money titles |
| Priority hypothesis | P2 |
| Notes | Canonical stays company + hub. |

### I-03 — Reviewer dispute / rate change / support ignored (named company)

| Field | Value |
| --- | --- |
| Keyword | `{company} reviewer dispute`; `{company} rate cut`; `{company} support not responding`; `outlier unfair review` |
| Intent | Specific working-condition harm at one company |
| User problem | Process felt unfair; need patterns, not one rant |
| Search funnel stage | Post-decision |
| Correct Happy Tasking page type | Company and/or a public issue; not a Guide reprint |
| Target URL | `/companies/{slug}` and `/issues` as appropriate |
| Current route exists? | Yes |
| Current content/data readiness | Demo / noindex |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | MEDIUM |
| Cannibalization risk | MEDIUM vs C-11 |
| Priority hypothesis | P2 |
| Notes | General “what to do if a reviewer is unfair” without a company → could be a Guide later; do not duplicate I-01’s H1. |

### I-04 — One public case

| Field | Value |
| --- | --- |
| Keyword | Long-tail / case-shaped; often none |
| Intent | Read this case |
| User problem | Specific dispute |
| Search funnel stage | Post-decision |
| Correct Happy Tasking page type | Issue detail |
| Target URL | `/issues/{publicId}` |
| Current route exists? | Yes |
| Current content/data readiness | Client / thin on detail. Needs a real public body |
| TaskMatch conversion potential | LOW |
| Happy Tasking differentiation | MEDIUM |
| Competition hypothesis | UNKNOWN |
| Cannibalization risk | LOW if titles stay case-specific |
| Priority hypothesis | P3 |
| Notes | Do not write guides that reprint issue threads. |

### I-05 — How to report an AI work platform problem (education)

| Field | Value |
| --- | --- |
| Keyword | `how to report unpaid ai training work`; `how to dispute ai evaluator review`; `what to do if ai platform doesn’t pay` |
| Intent | Educational playbook, not a named company and not a live case |
| User problem | Don’t know the path (HT issues vs company support vs labor rules) |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Guide **or** Issues hub — **pick one H1**. Recommendation: Issues hub owns the product path; a Guide only if it teaches without cloning `/issues` |
| Target URL | Prefer `/issues` now. Future guide only with a different H1 (playbook, not “AI work issues”) |
| Current route exists? | `/issues` yes |
| Current content/data readiness | Hub ready. Extra guide not built — Hold until it is clearly not a duplicate |
| TaskMatch conversion potential | LOW |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | LOW–MEDIUM |
| Cannibalization risk | HIGH vs I-01 |
| Priority hypothesis | P0 `/issues`; Hold extra guide |
| Notes | Do not publish both with the same primary query. |

---

## Cross-cutting (not a cluster)

### H-01 — Brand / homepage

| Field | Value |
| --- | --- |
| Keyword | `happy tasking`; `happytasking`; `know before you task` |
| Intent | Brand / home |
| User problem | Find the product |
| Search funnel stage | Awareness |
| Correct Happy Tasking page type | Homepage |
| Target URL | `/` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready |
| TaskMatch conversion potential | MEDIUM |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | LOW–MEDIUM (brand) |
| Cannibalization risk | LOW if hubs keep unique H1s |
| Priority hypothesis | P0 |
| Notes | Not a cluster target. Homepage is not the company directory or the market dashboard. |

### H-02 — TaskMatch brand / “where should I work”

| Field | Value |
| --- | --- |
| Keyword | `taskmatch`; `where should I work` in AI training; `ai training jobs for me`; `match me to ai evaluation work` |
| Intent | Personalized discovery |
| User problem | Generic rankings ignore skills and country |
| Search funnel stage | Decision |
| Correct Happy Tasking page type | TaskMatch |
| Target URL | `/taskmatch` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready |
| TaskMatch conversion potential | HIGH |
| Happy Tasking differentiation | HIGH |
| Competition hypothesis | HIGH for generic job language |
| Cannibalization risk | HIGH if a Guide ranks people or copies “jobs for me” |
| Priority hypothesis | P0 |
| Notes | Must **not** get a guide that ranks workers or companies as “best for you” in public HTML. |

### H-03 — Community

| Field | Value |
| --- | --- |
| Keyword | `ai work community`; `ai training discord alternative`; `ai evaluator forum` |
| Intent | Talk with other contributors |
| User problem | Need peers, not a scorecard |
| Search funnel stage | Awareness or Post-decision |
| Correct Happy Tasking page type | Community |
| Target URL | `/community` |
| Current route exists? | Yes |
| Current content/data readiness | Hub ready. Must not target pay/jobs/compare head terms |
| TaskMatch conversion potential | LOW–MEDIUM |
| Happy Tasking differentiation | MEDIUM |
| Competition hypothesis | HIGH — Reddit, Discord |
| Cannibalization risk | HIGH if Community H1 competes with Issues or Company reviews |
| Priority hypothesis | P0 as a product hub; supporting in this taxonomy |
| Notes | “Share experience, not confidential work.” |

---

## Keyword Cannibalization Risks

This section is the taxonomy’s collision list for **Company**, **Compare**, **Guides**, **Market**, and **TaskMatch**.

**Rule:** one primary intent → one PRIMARY OWNER. SUPPORTING PAGE may link. They must not reuse title, H1, or canonical intent.

Observed SERP evidence **raises** several risks from hypothesis to confirmed.

### Risk matrix (updated with SERP)

| Query | Evidence | PRIMARY OWNER | SUPPORTING PAGE | Do not let this compete |
| --- | --- | --- | --- | --- |
| `outlier reviews` / `mercor reviews` / `dataannotation reviews` | OBSERVED HIGH | Company | Issues / Compare | Guide `{company} reviews`; Market; TaskMatch as ranking URL |
| `outlier pay` | OBSERVED HIGH | Company | Market | Pay guide H1; Market H1 `{company} pay` |
| `outlier vs mercor` / `outlier vs dataannotation` | OBSERVED HIGH | Compare landing | Company | Pair guide; company pages targeting the pair |
| `ai training jobs` / `ai trainer jobs` / `ai evaluator jobs` / `remote ai training jobs` | OBSERVED HIGH | TaskMatch | Guide | Guide or directory H1 “AI training jobs” |
| `llm evaluator jobs` | OBSERVED MEDIUM-HIGH | TaskMatch | Guide | Specialized evaluation **guide** using that H1 |
| `ai coding jobs` | OBSERVED HIGH | TaskMatch | Guide | R-03 if slug/H1 is `ai coding jobs` — **SERP-confirmed new risk** |
| `what does an ai evaluator do` / `what is an ai trainer` | OBSERVED HIGH | Guide | TaskMatch | TaskMatch H1 copying those questions; `ai trainer jobs` (different query) |
| `how does ai training work` | OBSERVED MEDIUM, ambiguous | none / Hold | none | R-04 on-ramp with the same phrasing |
| `outlier assessment` / `mercor interview` | OBSERVED HIGH | Company | generic screening Guide | `/guides/outlier-assessment`, `/guides/mercor-interview` |
| `ai coding assessment` | OBSERVED MEDIUM | Guide | TaskMatch | Company screening pages; `ai coding jobs` |
| `outlier no tasks` | OBSERVED HIGH | Company | Market / Issues | Guide or Market H1 `{company} no tasks` |
| `ai task availability` | OBSERVED MEDIUM | Market **or** Guide — unresolved | TaskMatch | **NEW:** Market and Guide both targeting the exact query; TaskMatch using that H1 |

### Highest-severity fail modes (SERP-weighted)

1. **Review SERPs are reputation destinations** (Glassdoor / Indeed / Trustpilot). A thin HT company page, or a guide titled `{company} reviews`, will not be “a blog about reviews” — it will compete in a review-site SERP. Issues/Compare support only.

2. **Pair SERPs already have dedicated comparison content.** A how-to guide or two company pages fighting `outlier vs dataannotation` would cannibalize the compare engine HT already built. Company is support only.

3. **Jobs SERPs are opportunity SERPs.** Observed HIGH for `ai training jobs`, `ai trainer jobs`, `ai evaluator jobs`, `ai coding jobs`, `remote ai training jobs`. The old risk (“don’t share H1”) is now **confirmed**. Guides support education queries only.

4. **New: `ai coding jobs` vs coding explainer.** Previously R-03 listed job-like keywords. SERP assigns `ai coding jobs` to TaskMatch. Guide slug must change (done in map).

5. **New: `what is an ai trainer` vs `ai trainer jobs` vs R-06 glossary.** Trainer education is Guide; trainer jobs are TaskMatch; do not leave trainer in the RLHF mill.

6. **Screening: company vs generic guide.** Observed HIGH that `outlier assessment` and `mercor interview` are Company. Generic `/guides/how-ai-work-screenings-work` must not use those titles. No leak pages.

7. **Availability three-way, now with an exact-query hole:** `outlier no tasks` = Company (HIGH). Broad `ai task availability` = Market vs Guide (MEDIUM, **unresolved**). Personalized = TaskMatch. Do not give all three the same H1.

8. **Waiting-period trap (unchanged, now stronger):** Do not publish guides on `outlier reviews` / `outlier vs mercor` while those product URLs are demo/`noindex`. SERP demand is real; the wrong HT URL would occupy it.

9. **`how does ai training work`:** Do not “fill the gap” with an on-ramp guide that collides with ML-training SERPs.

### Title / H1 lock (do not reuse)

| Locked phrasing | Only owner |
| --- | --- |
| `{Name} Reviews, Pay & Task Availability` | Company |
| `{A} vs {B}` / `{A} vs {B}: AI Work Comparison` | Comparison landing |
| `AI Work Companies` | Directory `/companies` |
| `Compare companies` | Hub `/compare` |
| TaskMatch / match-me framing | `/taskmatch` |
| `AI Work Market` | `/market` |
| `AI Work Guides` | `/guides` |
| AI work issues and resolution | `/issues` |
| Exact observed **generic** job strings (`ai training jobs`, `ai evaluator jobs`, `ai trainer jobs`, `ai coding jobs`, `remote ai training jobs`, …) | TaskMatch — Guides must not use them as H1 |
| Exact observed **branded** jobs strings (`dataannotation jobs`, `mercor jobs`, `outlier jobs`, …) | Company — TaskMatch must not rank them as primary |
| Exact observed review/pay/assessment/no-tasks brand strings | Company |

### Supporting vs competing (allowed)

| PRIMARY OWNER | Allowed SUPPORTING PAGE |
| --- | --- |
| Company | Issues, Compare, generic Guide, Market context, TaskMatch CTA |
| Comparison | Company pages, TaskMatch CTA |
| Guide | TaskMatch CTA; must not rank for observed job/pair/brand review queries |
| Market | TaskMatch CTA; Company context; not `{company} no tasks` |
| TaskMatch | Company intelligence for a matched employer; educational Guide with a different H1 |

Internal linking is Sprint 5. This map only forbids two URLs from sharing a primary query.

---

## Out of scope (do not expand this map into)

- Inventing search-volume integers **beyond** the supplied Keyword Planner CSV exports  
- Treating Ads Competition as organic SEO difficulty  
- Converting UNKNOWN Planner volume to zero  
- Publishing MDX or new App Router pages  
- Indexing demo companies or demo comparisons  
- N×N comparison generation  
- Skill or country URL mills  
- Sprint 5 implementation  
- Confidential screening or task material  
- Creating a `/taskpulse` SEO URL (product note only)
