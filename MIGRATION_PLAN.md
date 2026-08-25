# Happy Tasking — Migration Plan

Status: **implemented** (Phase 1–5 MVP foundation live locally)  
Date: 2026-08-16  
Sources: `instructions.md`, `cursor-master-prompt.md`, codebase audit

---

## 1. Current state (audit summary)

| Layer | Today | Gap |
|-------|--------|-----|
| Frontend | Vite + React 19 SPA, React Router, Tailwind v4 | Not SEO-ready; brand is Review&RATE |
| Backend | Express 5 + TypeScript, controller→service→model | No auth; Zod unused; no rate limits |
| Database | MongoDB + Mongoose (`Company`, `Review`) | Not relational; missing 15+ entities |
| Auth | None (AuthNoticeModal placeholder) | Required for MVP |
| Reputation | Single 1–5 average | Need TaskScore (0–100) as configurable service |
| Deploy | Client on Vercel; API host unspecified | Need Postgres + Next.js deploy story |

**Reusable:** controller/service boundaries, `ApiError`/`ApiResponse`/`asyncHandler`, Modal/Input/Button/skeletons, RHF form patterns, Tailwind token approach, Axios API module split.

**Replace:** Mongoose models, Vite SPA shell, Review&RATE branding, star-only reputation model.

---

## 2. Target architecture

```text
apps/web (Next.js App Router)
  ├── public SEO pages (SSG/SSR)
  ├── authenticated app surfaces
  └── calls → API

apps/api OR packages/api (Express retained initially)
  ├── REST /api/v1/*
  ├── services (TaskScore, aggregation, etc.)
  └── Prisma → PostgreSQL

infra (later, not MVP blockers)
  ├── Redis (cache / rate limit / queues)
  ├── object storage (verification evidence)
  └── background jobs (score refresh, pulse)
```

### Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Frontend | **Next.js 15 App Router** | SEO for `/companies/[slug]`, `/market`, `/community/*` |
| Styling | Tailwind + accessible primitives (shadcn-style) | Matches existing Tailwind familiarity; professional density |
| Backend | **Keep Express API** in `server/` for Phase 1–2 | Clear service boundaries already exist; avoid rewriting API into Next route handlers mid-migration |
| DB | **PostgreSQL + Prisma** | Relational domain (companies ↔ skills ↔ reports ↔ votes) |
| Auth | **Email/password + session cookies** (or JWT in httpOnly cookies) via a dedicated auth service | Spec requires auth; OAuth can come later |
| Monorepo shape | Keep `client/` → migrate into `web/` (or rename `client` to Next app); keep `server/` | Minimal disruption; deprecate Vite once Next is green |
| Demo data | Seed scripts, **clearly labeled DEMO** | Never fabricate as production metrics |

### What we will *not* do in Phase 1

- Full B2B / Research Panel product
- Redis / queues / NLP moderation (stub privacy checks only)
- Company claim payments / paid score manipulation
- Cloning Reddit/Glassdoor visuals
- Confidential project-name fields

---

## 3. Data migration strategy

### 3.1 Schema (Phase 1 core)

Prisma models to introduce first:

1. `User` — username, email, country, role, trustLevel, contributionScore, publicProfileEnabled  
2. `Company` — slug, name, description, website, claimStatus, companyStatus, …  
3. `Domain`, `Skill` — taxonomy with Domain↔Skill mapping  
4. `WorkerExperience` — user↔company, domains/skills, date range, verificationStatus  
5. `Review` — structured dimensions (pay, reliability, availability, stability, fairness, clarity, support, transparency, wouldWorkAgain) + title/body  
6. `CompanyScoreSnapshot` (or computed + cached fields) — TaskScore, sampleSize, verifiedPct, period  

Later phases (schema stubs allowed, tables created when feature lands):

- Discussion, Comment, Vote  
- PayReport, TaskAvailabilityReport  
- Complaint / Issue + CompanyResponse  
- ResearchPanelOptIn  
- VerificationEvidence (private; never public)

### 3.2 Mongo → Postgres

1. Export existing Mongo companies/reviews (if any production data exists).  
2. Map:
   - `Company.name` → `Company.name` + generated `slug`
   - `Company.rating` / `reviewCount` → discard as source of truth; recompute TaskScore from structured reviews
   - `Review.rating` → seed `overallExperience` only; other dimensions null/default until re-reviewed
   - `Review.fullName` → anonymous display name or migrate into User if matched
3. Prefer **greenfield seed** for Happy Tasking demo companies (Outlier, Mercor, DataAnnotation, etc.) marked as DEMO if no real migration dataset is provided.
4. Drop Mongo after cutover when Next + Express + Prisma are stable.

### 3.3 TaskScore engine

- Implement as `server/src/services/taskScore.service.ts` (weights in config, not UI).  
- Inputs: dimension averages, sample size, verified %, optional time decay hooks.  
- Always return: score, n, verifiedPct, period (`7d` | `30d` | `90d` | `all`).  
- Unit tests for aggregation math.

---

## 4. Auth approach

| Item | Plan |
|------|------|
| Registration / login | Email + password (bcrypt already in deps) |
| Session | httpOnly secure cookie (prefer iron-session / jose JWT) |
| Public default | Anonymous display for reviews/discussions |
| Roles | `user`, `moderator`, `admin` (minimal) |
| Protected | Create review, vote, report availability, file complaint |
| Public | Directory, company pages, market (demo), community read |

---

## 5. Route / IA map (Next.js)

| Route | Phase | Notes |
|-------|-------|-------|
| `/` | 1 | Home: search, AI Work Pulse (demo), top companies, trending stubs |
| `/companies` | 1 | Directory with TaskScore filters |
| `/companies/[slug]` | 1 | Tabs: Overview, Reviews (+ Community/Pay/Issues stubs) |
| `/reviews/new` | 1 | Multi-step structured review |
| `/login`, `/register`, `/profile` | 1 | Auth + basic profile |
| `/community`, `/community/[slug]`, `/topics/[topic]` | 2 | Discussions |
| `/market` | 5 (stub in 1) | Demo-labeled dashboard shell early for IA |
| `/issues`, `/issues/[id]` | 4 | Complaints workflow |
| `/compare/[a]-vs-[b]` | 5 | SEO comparison |

---

## 6. Implementation sequence (aligned with specs)

### Step A — Foundation (no UI rewrite yet)

1. Add Prisma + PostgreSQL config, `.env.example`, seed script.  
2. Auth models + auth API + middleware.  
3. Company + Domain + Skill models; seed taxonomy + DEMO companies.  
4. Keep Express running; dual-write not required — cut Mongo once Prisma endpoints work.

### Step B — Next.js shell + rebrand

1. Introduce Next.js app (replace Vite client incrementally).  
2. Brand: **Happy Tasking** / **Know before you task.**  
3. Visual: neutral light, dense professional UI (per master prompt — not purple consumer gradients).  
4. Port directory + company detail consuming new API.

### Step C — Structured reviews + TaskScore

1. Multi-step review form + Zod validation server-side.  
2. TaskScore service + display on directory/detail.  
3. Tests for scoring.

### Step D — Phase 2+ features

Community → Pay/Availability reports + TaskPulse → Issues → Market dashboard → B2B stubs.

---

## 7. Deployment impact

| Component | Impact |
|-----------|--------|
| Frontend | Vercel project root moves to Next app; remove SPA rewrite-only config |
| API | Same Node host; add `DATABASE_URL` |
| Database | Provision managed Postgres (Neon/Supabase/Railway) |
| Env | `DATABASE_URL`, `JWT_SECRET`/`SESSION_SECRET`, `CLIENT_URL`, drop `MONGO_URI` after cutover |
| CORS | Point to Next origin |
| Downtime | Acceptable for scaffold; no production user base assumed |

---

## 8. Quality gates (each phase)

- App remains runnable after each phase  
- Zod on all external input  
- Pagination on list endpoints  
- Loading / empty / error states  
- Demo data labeled  
- `CHANGELOG.md` / implementation notes updated  
- No secrets in git  

---

## 9. Immediate next action (pending approval)

**Start Step A:** Prisma schema (User, Company, Domain, Skill, WorkerExperience, Review), Postgres wiring, seed, auth skeleton — without deleting the Vite client until Next shell is ready.

Approve to proceed, or call out preferred changes (e.g. API routes inside Next instead of Express, Auth.js/Clerk instead of custom auth).
