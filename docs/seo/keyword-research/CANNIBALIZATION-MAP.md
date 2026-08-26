# Cannibalization map

**Rule:** If two URLs would satisfy the same primary intent, only one is **PRIMARY OWNER**. SUPPORTING PAGE may link but must use a different H1, title, and canonical.

**Unit:** PAGE + KEYWORD CLUSTER. Multiple keywords on one page is correct. One page per keyword is not.

| Label | Meaning |
| --- | --- |
| VERIFIED KEYWORD PLANNER DATA | Numeric avg monthly searches from the supplied CSV exports (1 Aug 2025 – 31 Jul 2026). Not invented. Ads competition ≠ organic SEO difficulty. Missing = UNKNOWN (not zero). Generic Outlier volumes: MEDIUM-LOW confidence (earbuds contamination). |
| OBSERVED SERP EVIDENCE | Intent / what ranks |
| INTERNAL STRATEGIC ASSESSMENT | Cluster ownership, product action |
| UNKNOWN / NEEDS MORE RESEARCH | No volume or contaminated Outlier generics |

Planner demand does **not** justify a new URL that would steal an owner (e.g. 50,000 `dataannotation jobs` still lives on `/companies/dataannotation`, not a new jobs page).

---

## Taxonomy split that prevents the worst collision

| Intent | Example | PRIMARY OWNER | SUPPORTING | Evidence |
| --- | --- | --- | --- | --- |
| GENERIC JOB INTENT | `ai training jobs` (50,000) | TaskMatch | Guide | Planner + SERP |
| COMPANY-SPECIFIC JOB INTENT | `dataannotation jobs` (50,000), `mercor jobs` (5,000) | Company | TaskMatch | Planner + INTERNAL |
| COMPANY REPUTATION / PAY / SCREENING | `mercor reviews`, `mercor interview` | Company | Issues / Compare / generic screening Guide | Planner + SERP |
| EDUCATIONAL ROLE | `what is an ai trainer` (500) | Guide | TaskMatch | Planner + SERP |
| PAIRWISE DECISION | `outlier vs mercor` (50, volume confidence MEDIUM-LOW) | Compare | Company | Planner + SERP |
| BROAD MARKET NOW | `ai trainer pay` (50) | Market / TaskPulse | Guide | Planner |
| PERSONALIZED FIT | matching | TaskMatch | Company | INTERNAL |

**Fail mode (new, Planner-scale):** Treating `dataannotation jobs` like `ai training jobs` and ranking both on TaskMatch. Those are different owners despite identical 50,000 monthly figures.

**Fail mode:** `/guides/mercor-interview` or `/guides/dataannotation-reviews` competing with the company cluster.

**Fail mode:** Coding Guide owning `ai coding jobs` (500 transactional vs educational support).

**Fail mode:** Over-building Outlier SEO from contaminated `outlier jobs` 5,000.

---

## Intent → single owner


| User intent | PRIMARY OWNER | Route | SUPPORTING PAGE | Must not target this intent | Evidence |
| --- | --- | --- | --- | --- | --- |
| `{company}` reputation / worker experience | Company | `/companies/{slug}` | Issues / Compare | Guide `{company} reviews` | OBSERVED HIGH (`outlier` / `mercor` / `dataannotation reviews`) |
| `{company}` pay | Company | `/companies/{slug}` | Market | Pay guide or Market H1 `{company} pay` | OBSERVED HIGH (`outlier pay`) |
| `{A} vs {B}` | Compare | `/compare/{canonical}` | Company | `{A} vs {B}` guide | OBSERVED HIGH (`outlier vs mercor`, `outlier vs dataannotation`) |
| Which platforms exist? | Directory | `/companies` | Compare hub | Homepage; “best 10” guide | HYPOTHESIS |
| Picker, no named pair | Compare hub | `/compare` | Method guide (different H1) | Pair landings | HYPOTHESIS |
| Find available work — **generic** (`ai training jobs`, …) | TaskMatch | `/taskmatch` | Guide (education only) | Guide H1 “AI training jobs”; **also** do not use TaskMatch as primary for `dataannotation jobs` | Planner 50,000 + SERP HIGH |
| Find available work — **company-branded** (`dataannotation jobs`, `mercor jobs`) | Company | `/companies/{slug}` | TaskMatch | Separate jobs/reviews/pay URLs or TaskMatch as ranking URL | Planner 50,000 / 5,000 + INTERNAL |
| What **is** the role? | Guide | `/guides/{role}` | TaskMatch | TaskMatch using the question as H1 | OBSERVED HIGH (`what does an ai evaluator do`, `what is an ai trainer`) |
| How does AI training work? | **Hold** | none | none | On-ramp guide with that exact phrasing | OBSERVED MEDIUM — ambiguous vs ML training |
| `{company}` screening / interview | Company | `/companies/{slug}` | Generic screening Guide | Company-named screening guides | OBSERVED HIGH (`outlier assessment`, `mercor interview`) |
| Generic screening / `ai coding assessment` | Guide | `/guides/how-ai-work-screenings-work` | TaskMatch | Company clones; leaks | OBSERVED MEDIUM for coding assessment |
| `{company}` no tasks | Company | `/companies/{slug}` | Market / Issues | Guide/Market H1 `{company} no tasks` | OBSERVED HIGH |
| Broad `ai task availability` | Market **or** Guide — **unresolved** | `/market` *or* phenomenon guide | TaskMatch | Both using the exact H1 | OBSERVED MEDIUM — **new risk** |
| Personalized availability | TaskMatch | `/taskmatch` | Market / Company | `/taskmatch` H1 “AI task availability” vs Market | Observation 10 (architecture) |
| Pay mechanics | Guide | future pay guide | Market, companies | `{company} pay` | HYPOTHESIS (except `outlier pay` = Company) |
| Rates **now** | Market | `/market` | Guide, companies | Mechanics H1 | HYPOTHESIS |
| Harm category | Issues hub | `/issues` | Company | Community as money page | HYPOTHESIS |
| Harm at `{company}` | Company | `/companies/{slug}` | Issues filter | Unique SEO title on `?company=` | HYPOTHESIS |

---

## High-risk collisions (SERP-updated)

### 1. `{company} pay` vs mechanics vs market — CONFIRMED for `outlier pay`

| Query | PRIMARY OWNER | SUPPORTING PAGE | Evidence |
| --- | --- | --- | --- |
| `outlier pay` | Company | Market | OBSERVED HIGH |
| `how ai training work is paid` | Guide | Market, companies | HYPOTHESIS |
| `ai training pay` as **now** | Market | Guide, companies | HYPOTHESIS |

**Fail mode:** Guide titled “Outlier Pay” or Market titled “Outlier pay”.

### 2. `{A} vs {B}` vs how-to vs company pages — CONFIRMED

SERPs for `outlier vs mercor` and `outlier vs dataannotation` already show **dedicated comparison content**. That validates `/compare/[comparisonSlug]` as PRIMARY OWNER. Company pages support; they must not target the pair.

**Fail mode:** `/guides/outlier-vs-mercor` or `/guides/outlier-vs-dataannotation`.

### 3. `… jobs` vs role explainer vs **branded company jobs**

| Query | Planner /mo | PRIMARY OWNER | SUPPORTING PAGE |
| --- | --- | --- | --- |
| `ai training jobs` | 50,000 (+900%) | TaskMatch | Guide |
| `ai trainer jobs` | 5,000 | TaskMatch | Guide (`what is an ai trainer`) |
| `remote ai training jobs` | 5,000 | TaskMatch | — |
| `ai coding jobs` | 500 | TaskMatch | Coding Guide (educational only) |
| `ai evaluator jobs` | 500 | TaskMatch | Evaluator Guide |
| `llm evaluator jobs` | 50 | TaskMatch | long-tail |
| `ai work from home` | 500 (+900%) | TaskMatch | monitor |
| `dataannotation jobs` | 50,000 | **Company** | TaskMatch |
| `mercor jobs` | 5,000 | **Company** | TaskMatch |
| `outlier jobs` | 5,000* | **Company** | TaskMatch (*MEDIUM-LOW volume confidence) |
| `what is an ai trainer` | 500 | Guide | TaskMatch |

**Fail mode:** TaskMatch ranking `dataannotation jobs`. **Fail mode:** Guide H1 `ai training jobs` or `ai coding jobs`. **Fail mode:** `/guides/mercor-jobs`.

### 4. Task availability — CONFIRMED split + NEW exact-query hole

| Query | PRIMARY OWNER | SUPPORTING PAGE | Evidence |
| --- | --- | --- | --- |
| `outlier no tasks` | Company | Market / Issues | OBSERVED HIGH |
| `ai task availability` | Market **or** Guide | TaskMatch | OBSERVED MEDIUM — **unresolved** |
| Personalized “work for me now” | TaskMatch | Market / Company | Observation 10 |

**Fail mode:** Guide H1 “Outlier No Tasks”. **New fail mode:** Market and a Guide both titled “AI task availability”. **New fail mode:** TaskMatch using that same H1.

**Product note:** demand here also argues for TaskPulse / community-reported availability — not a fourth SEO URL.

### 5. Screening — CONFIRMED company vs generic

| Query | PRIMARY OWNER | SUPPORTING PAGE | Forbidden |
| --- | --- | --- | --- |
| `outlier assessment` | Company `/companies/outlier` | S-01 Guide | `/guides/outlier-assessment` |
| `mercor interview` | Company `/companies/mercor` | S-01 Guide | `/guides/mercor-interview` |
| `ai coding assessment` | Guide | TaskMatch | Company-named clone |
| `{company} assessment answers` | **Do not create** | — | Any dump |

**Fail mode:** Competing with leak Discords. Policy failure, not an SEO win.

### 6. Review SERPs are reputation destinations — CONFIRMED

Glassdoor, Indeed, Trustpilot dominate `{company} reviews`. Issues and Compare **support**; they must not become a second review URL. A Guide titled `{company} reviews` is forbidden.

### 7. Skills vs jobs vs guides (unchanged hypothesis)

| Query shape | PRIMARY OWNER | SUPPORTING PAGE |
| --- | --- | --- |
| `skills for ai evaluation` | Guide | TaskMatch |
| `{skill}` as a filter | `/skills/{slug}` listings | TaskMatch |
| `{skill} … jobs` | TaskMatch | Skill URL |

**Fail mode:** skill essay mill (Sprint 5 trap).

### 8. Country vs company vs TaskMatch (unchanged hypothesis)

Editorial geo guide only if original. `{company} in {country}` → Company. Profile stays noindex.

---

## Duplicate URL patterns already handled in product (keep)

| Pattern | Product rule | Keyword implication |
| --- | --- | --- |
| `/compare/b-vs-a` vs `/compare/a-vs-b` | 308 to alphabetical slug | One keyword target per pair (`mercor-vs-outlier`, `dataannotation-vs-outlier`) |
| `/compare?a=&b=` | 308 to landing | Do not optimize query URLs |
| `/compare?a=` only | Stays on hub | Not a pair landing |
| Demo company / demo pair | `noindex, follow`, out of sitemap | **Waiting-period trap:** do not occupy observed queries with guides |
| Draft guide | HTTP 404 | Cannot cannibalize (good) |
| `/companies/{slug}/reviews` | Extra list | Must not use the company metadata title |

---

## Title / H1 uniqueness checklist (use before any publish)

A new URL is **blocked** if it would share primary phrasing with an existing PRIMARY OWNER:

1. `{Name} Reviews, Pay & Task Availability` — company only  
2. `{A} vs {B}` — comparison only  
3. `AI Work Companies` — directory only  
4. `Compare companies` — hub only  
5. TaskMatch / match-me framing — TaskMatch only  
6. `AI Work Market` — market only  
7. `AI work issues and resolution` — issues hub only  
8. `AI Work Guides` — guides hub only  
9. Observed **generic** job strings (`ai training jobs`, `ai trainer jobs`, `ai evaluator jobs`, `ai coding jobs`, `remote ai training jobs`, `llm evaluator jobs`) — TaskMatch intent; Guides must not use as H1  
10. Observed **branded** job strings (`dataannotation jobs`, `mercor jobs`, `outlier jobs`, …) — Company only; TaskMatch is SUPPORTING  
11. Observed brand reputation/pay/screening strings (`outlier reviews`, `outlier pay`, `outlier assessment`, `outlier no tasks`, `mercor interview`, …) — Company only  

Guides must ask a **question or teach a mechanism**, not reuse 1–11.

---

## When data is still demo

Demo company and comparison pages **exist** and would cannibalize if indexed. They are correctly `noindex`.

SERP demand for `outlier reviews`, `outlier vs mercor`, `outlier vs dataannotation`, `outlier assessment`, `outlier no tasks` is **observed HIGH**. Keyword research must **not** create guides that occupy those queries while we wait for real data. That would steal the eventual company/comparison URL.

---

## Remaining unresolved (do not “fix” with a new page)

| Query | Conflict | Action |
| --- | --- | --- |
| `how does ai training work` | Human AI-work vs ML model-training SERP | Hold. No HT URL. |
| `ai task availability` | Market vs Guide (MEDIUM) | Remains unresolved after FIRST-10. Hold exact H1. Do not mint a page. |
| `ai coding assessment` | AI-work prep vs generic coding-interview SERP | Fold into S-01 unless evidence strengthens. |
| R-01 vs R-10 | Two role guides vs one combined explainer | Decide before any publish; do not ship both targeting the same intent. |
