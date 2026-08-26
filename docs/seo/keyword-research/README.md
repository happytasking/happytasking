# Happy Tasking Keyword Research v1

**Status:** Approved as **READY WITH WARNINGS** (26 August 2026). Documentation only. No application code, published guides, Sprint 5, or deploy in this folder.  
**When:** After Sprint 4 (Guides architecture is live). **Before Sprint 5** (internal linking, skill/country programmatic SEO, mass content).  
**Canonical origin:** `https://happytasking.com`  
**Site:** Happy Tasking — Know before you task.

This folder maps **search intent → one page type**. It does not publish pages, generate articles, or change eligibility.

---

## Why this exists

Happy Tasking already has distinct public surfaces:

| Surface | Route | Job in search |
| --- | --- | --- |
| Company intelligence | `/companies/[slug]` | Company-specific jobs, reputation, pay, screening, task availability |
| Company directory | `/companies` | “Which AI work platforms exist?” |
| Comparison landing | `/compare/[comparisonSlug]` | Company A vs Company B |
| Comparison tool | `/compare` | Interactive pair picker |
| Guide | `/guides/[slug]` | General educational questions |
| Guides hub | `/guides` | Editorial index (indexable; no published articles yet) |
| TaskMatch | `/taskmatch` | Personalized “where should I work?” |
| Opportunity | `/taskmatch/opportunities/[slug]` | One live listing |
| Market | `/market` | Broad, cross-company conditions |
| Issues hub | `/issues` | Structured complaints / resolution, not reviews |
| Issue detail | `/issues/[publicId]` | One public resolution case |
| Community | `/community` | Discussion; not a primary money-page |
| Skill | `/skills/[slug]` | Current opportunities mentioning a skill (product, not a career essay) |

**One primary intent → one page type.** Supporting pages may link later (Sprint 5). They must not target the same title, H1, or primary query.

---

## Routing principle (non-negotiable)

| Search looks like | Page type | Not this |
| --- | --- | --- |
| `{Company} jobs / reviews / pay / screening / tasks / legit` | **Company** | Guide “Outlier pay”, TaskMatch ranking `{company} jobs`, a second “reviews” URL |
| `{A} vs {B}` | **Comparison** | Guide “Outlier vs Mercor”, two company pages fighting for the pair |
| “What is / how does / should I understand…” (no company, or many companies) | **Guide** | Thin company clone, “best 10” affiliate post |
| Generic “AI training jobs” / find matching work (no named company) | **TaskMatch** | A guide that pretends to be a job board; company-branded jobs URLs |
| Pay/demand/stability **across** the market | **Market** | Per-company pay URL, country mill |
| “My payout is late / how do I dispute this” (case or category of harm) | **Issues / Resolution** | Review-shaped blog post, Community as the SEO target |
| One live listing at a company | **Opportunity** | Guide titled `{Company} jobs` (that query is **Company**, not Opportunity) |

Community is a **discussion surface**. It can rank for “AI training community” later. It must not be the primary target for pay, comparisons, or jobs.

---

## Current production constraints (26 August 2026)

These are facts, not hypotheses:

- All production companies remain `isDemo: true`. Company and comparison **detail** URLs are reachable, **`noindex, follow`**, and **out of the sitemap**.
- No published guide exists. `/guides` is indexable with an empty/in-progress hub. `_template.mdx` is not a public URL.
- `/skills/[slug]` and `/taskmatch/opportunities/[slug]` exist; opportunity and skill **detail** HTML is still largely client-fetched (Sprint 0 leftover). Do not treat them as the main SEO engine yet.
- Eligibility engines already decide indexability: `companySEOEligibility()`, `comparisonSEOEligibility()`, `guideSEOEligibility()`, plus `mayIndexListedResource()`.
- Screening/task material stays public-process only. No leaked questions, prompts, or client work — in research docs or in future copy.

**Do not request indexing of demo company or demo comparison URLs.**  
**Do not publish a fake guide to create a ranking URL.**

---

## Volume and competition (read this before any number)

This folder **does** include verified Google Keyword Planner values from supplied CSV exports for **1 August 2025 – 31 July 2026**. Those integers are **VERIFIED KEYWORD PLANNER DATA**. They were not invented.

Distinguish:

| Label | Meaning |
| --- | --- |
| **VERIFIED KEYWORD PLANNER DATA** | Numeric avg monthly searches / YoY / ads competition from the CSV exports. Rounded directional demand, not a traffic forecast. **Ads Competition is advertising competition, not organic SEO difficulty.** Do not invent organic keyword difficulty. |
| **OBSERVED SERP EVIDENCE** | Search intent and SERP composition from the SERP research pass |
| **INTERNAL STRATEGIC ASSESSMENT** | Prioritization, page-type ownership, product strategy |
| **UNKNOWN** | Neither Planner nor SERP provides sufficient data. **Do not convert UNKNOWN to zero.** |

Generic **Outlier** Planner volumes are still recorded as CSV numbers (`outlier reviews` 500, `outlier jobs` 5,000, etc.) but Keyword-data confidence is **MEDIUM-LOW** because the export was contaminated by Creative Outlier / Outlier Air queries.

Do not invent volumes beyond the supplied CSVs. `mercor vs dataannotation` volume is **UNKNOWN**.

---

## Files

| File | Purpose |
| --- | --- |
| [KEYWORD-MAP.md](./KEYWORD-MAP.md) | Taxonomy + verified Planner table + SERP + owners |
| [CANNIBALIZATION-MAP.md](./CANNIBALIZATION-MAP.md) | Same-intent collisions and the winning URL |
| [CONTENT-OPPORTUNITIES.md](./CONTENT-OPPORTUNITIES.md) | Product/editorial opportunities — **not a publish queue** |
| [FIRST-10-TARGETS.md](./FIRST-10-TARGETS.md) | Finalized page-level FIRST-10 (clusters, not one URL per keyword) |

---

## Clusters

1. COMPANY  
2. COMPARISON  
3. JOB / OPPORTUNITY  
4. ROLE / EDUCATIONAL  
5. SCREENING / APPLICATION  
6. PAY  
7. TASK AVAILABILITY  
8. SKILLS  
9. COUNTRY / REGION  
10. ISSUES / PROBLEMS  

Modifiers (`reviews`, `pay`, `{country}`, `vs`) do not create a new page type. They **route** to the type above.

---

## What this research must not become

- Sprint 5 (internal-linking engine, skill/country programmatic SEO, mass content)
- N×N comparison URLs for every company pair
- One guide per company cloning `{Name} Reviews, Pay & Task Availability`
- Country or skill URL mills
- “Best AI training companies 2026” winner lists
- Screening cheat sheets

---

## Approved routing (research v1)

1. Generic AI job intent (`ai training jobs`, `ai trainer jobs`, `ai evaluator jobs`, `ai coding jobs`, `remote ai training jobs`) → **TaskMatch**.
2. Company-specific jobs / reviews / pay / screening → **Company** `/companies/{slug}` (one page per company, not one URL per modifier).
3. Educational role intent (`what is an ai trainer`) → **Guide**.
4. Pairwise decision (`{A} vs {B}`) → **Compare**.
5. Skill/country programmatic SEO remains **out of scope** until Sprint 5 is separately approved.

Do not create a new indexable URL from this folder. Warnings: demo/`noindex` company and comparison pages; contaminated generic Outlier Planner volumes; some volumes UNKNOWN; organic SEO difficulty UNKNOWN.
