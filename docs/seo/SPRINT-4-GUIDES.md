# Sprint 4 — Guides architecture

**Goal:** A professional, people-first editorial Guides system — not a content farm.

**Canonical origin:** `https://happytasking.com`  
**Site name:** Happy Tasking  
**Tagline:** Know before you task.

Sprints 0–3 remain in force. Public directories stay server-rendered. Demo company and comparison intelligence stays `noindex, follow` and out of the sitemap. Do not start Sprint 5 (internal-linking engine, skill/country programmatic SEO, mass content).

Do not:

- mass-generate articles
- publish thin placeholders to make Search Console green
- invent statistics, pay ranges, screening questions, or company processes
- copy substantial external content
- include leaked assessments or confidential task material

---

## 1. Audit (before this sprint)

| Surface | Finding |
| --- | --- |
| Blog / guides routes | None. No `/blog`, `/guides`, or article App Router tree |
| MDX | No MDX files, no `@next/mdx`, no Contentlayer |
| Markdown rendering | Trust pages (`/manifesto`, `/methodology`, `/governance`, `/open-source`) are **hand-written TSX**, not markdown |
| CMS | None. Prisma has no Guide/Article model. `authorId` exists only on reviews/issues/replies |
| “guides” in seed | TaskMatch **application walkthroughs** per company (`server/prisma/taskmatch-seed.ts`) — product onboarding, not SEO editorial |
| Metadata helpers | `publicPageMetadata()`, `SITE_ORIGIN`, OG/Twitter already per-page |
| Structured data | Site Organization + WebSite; BreadcrumbList; listed-company Organization; **no Article/BlogPosting** |
| Sitemap | Static public routes + API lists (companies, skills, opportunities, comparisons) |
| Open-source workflow | GitHub PRs, `CONTRIBUTING.md`, “share experience, not confidential work” |

**Choice: Git-versioned MDX in the repository** (`content/guides/*.mdx`).

Why not database-backed v1: would need Prisma, migrations, an editor, and would hide drafts less naturally from GitHub review. Why not keep writing TSX pages: harder for community PRs and frontmatter/eligibility. MDX is the simplest fit for Next.js SSR, Git, authorship, sources, and a later CMS import (frontmatter maps cleanly).

---

## 2. Implementation plan (executed)

1. Content model + `guideSEOEligibility()` (published is necessary, not sufficient).
2. Load MDX from `content/guides/` on the server (`gray-matter` + `next-mdx-remote/rsc`).
3. `/guides` index (indexable even while empty of published articles).
4. `/guides/[slug]` SSR article; drafts/review/archived → HTTP 404.
5. Sitemap: only eligibility `includeInSitemap`.
6. Article JSON-LD only when indexable; BreadcrumbList reused; no ratings.
7. Related companies/guides/skills from **explicit** frontmatter only.
8. TaskMatch + Community CTAs once at the end.
9. Contributor notes in `content/guides/README.md` and a short `CONTRIBUTING.md` section.
10. Tests + isolated production build. No published seed article.

---

## 3. Content model

Frontmatter on each `content/guides/{slug}.mdx`:

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Unique, people-first |
| `slug` | yes | Must match filename (minus `.mdx`) and `isIndexableSlug` |
| `description` | yes | Explicit meta description |
| `excerpt` | no | Card copy; falls back to description |
| `author` | yes | Default real byline: **Happy Tasking Editorial** |
| `authorUrl` | no | Only a real URL |
| `datePublished` | yes | ISO date; never invented at request time |
| `dateModified` | no | Change only when the article meaningfully changes — **not** on every deploy |
| `category` | yes | One of the configured categories |
| `tags` | no | |
| `heroImage` / `ogImage` | no | Site-relative path only; omit rather than invent |
| `status` | yes | `draft` \| `review` \| `published` \| `archived` |
| `featured` | no | |
| `indexable` | no | Default true; `false` keeps a published page `noindex` |
| `demo` | no | `true` → `DEMO_ONLY` |
| `readingTime` | no | Minutes; else estimated |
| `relatedCompanies` / `relatedSkills` / `relatedGuides` | no | Explicit slugs only |
| `sources` | no | `{ title, url?, kind? }` |
| body | yes | MDX after frontmatter |

Files starting with `_` are templates, never loaded.

---

## 4. Eligibility

`guideSEOEligibility(guide)` → `{ indexable, includeInSitemap, reasons }`. Flags are equal.

| Reason | When |
| --- | --- |
| `DRAFT` | `status` is `draft` or `review` |
| `ARCHIVED` | `status` is `archived` |
| `DEMO_ONLY` | `demo: true` |
| `MISSING_METADATA` | missing title, slug, description, author, or `datePublished` |
| `INVALID_SLUG` | slug fails the shared slug rule or does not match the filename |
| `INSUFFICIENT_CONTENT` | thin/placeholder/duplicate-of-title body — not a word-count floor alone |
| `DUPLICATE` | another file already claimed this slug |
| `PRIVATE` | `indexable: false` |
| `ERROR_STATE` | parse failure (file omitted from the index) |

Public routes:

| Status | HTTP | robots | sitemap |
| --- | --- | --- | --- |
| Missing / draft / review / archived | **404** | `noindex` (404 page) | no |
| Published + blockers (demo, thin, `indexable: false`) | 200 | `noindex, follow` | no |
| Published + eligible | 200 | `index, follow` | yes |

---

## 5. People-first + screening policy

Guides must explain, help decide, cite, and link. No generic “AI is transforming the world” filler. No invented numbers.

Screenings (future articles): public process and legitimate preparation only. Never leaked questions, answers, proprietary prompts, or client material. Same rule as the rest of the repo: **share your experience, not confidential work.**

---

## 6. Candidate topics (not published)

Documented only — do not auto-write:

- AI Training Jobs: A Practical Guide
- What Does an AI Evaluator Do?
- AI Coding Jobs for Software Developers
- How AI Work Screenings Usually Work
- How to Compare AI Training Platforms
- Understanding Task Availability in AI Work
- AI Training Work for Brazilian Professionals
- AI Training vs Data Annotation
- How Task-Based AI Work Is Paid
- What Skills Are Useful for AI Evaluation?

---

## 7. Search Console

| URL | Expected now |
| --- | --- |
| `/guides` | Crawl yes, fetch yes, **index yes** (hub; may have no published cards) |
| `/guides/{slug}` | None publicly published in this sprint |
| Future eligible guide | Index yes, self canonical, in sitemap |
| Draft file | Not a public URL (404), not in sitemap |

Do not publish a fake guide only to turn Search Console green.

---

## 8. Validation checklist

- [x] Published eligible → `index, follow` + sitemap (unit)
- [x] Draft / archived → not a public 200
- [x] Demo / insufficient / `indexable: false` → `noindex`, out of sitemap
- [x] Pair-specific title / description / canonical / OG / Twitter (unit)
- [x] Article JSON-LD only when indexable; no aggregateRating
- [x] BreadcrumbList Home → Guides → title
- [x] Invalid slug → 404
- [x] No draft leakage on `/guides`
- [x] Related links only from frontmatter
- [x] Lint, typecheck, tests, isolated production build
