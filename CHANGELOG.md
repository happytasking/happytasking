# Changelog

## 2026-08-16 — Brand logo + gradient UI

### Added
- Real Happy Tasking mark and lockup under `web/public/brand/`, wired into nav, footer, and
  favicons. CSS wordmark uses `Happy` in navy and `Tasking` in the logo's blue→cyan→green
  gradient so the brand reads even before new SVG exports arrive.
- Design tokens for the logo palette (`--brand-blue`, `--brand-cyan`, `--brand-green`,
  `--gradient-brand`, soft hero washes) and utilities (`.text-gradient`, `.btn-accent` gradient,
  `.hero-glow`).

### Changed
- Home hero cleaned up: brand-first composition, gradient atmosphere, one headline with
  gradient emphasis on *before*, search + CTAs, and a single sentiment panel instead of stacked
  privacy cards. Accent buttons and chart primaries follow the logo colors.

## 2026-08-16 — Real brand logos

### Added
- Real logos for 13 companies (Outlier, Mercor, DataAnnotation, Remotasks, Scale AI, Turing,
  Invisible, Alignerr, Prolific, Labelbox, Snorkel AI, SuperAnnotate, Surge AI). Appen, Toloka and
  TELUS International AI keep monogram placeholders.
- `CompanyLogo` grew a `fit` prop, because the assets range from square marks (Mercor, 1.1:1) to
  wordmarks six times wider than they are tall (Remotasks, 6.6:1) and one shape cannot serve both:
  `slot` reserves a fixed width so table rows stay aligned, `auto` follows the asset's ratio for
  headers and cards, and `mark` forces a square for logos inline with running text — falling back to
  the monogram for wordmarks, which a square would squeeze into an unreadable sliver.

### Changed
- Every asset was cropped to its ink bounds (Prolific's download was a third vertical padding),
  given an explicit `xmlns`, intrinsic width/height and literal fills in place of `currentColor`, and
  had white backgrounds flood-filled to transparency. Outlier's SVG wraps a bitmap that was
  downscaled from 1356px to 240px, taking the file from 342 KB to 40 KB; all 17 logos now total 164 KB.
- Company headers and mobile list cards stack the logo above the name instead of beside it, so wide
  wordmarks no longer squeeze the title on narrow screens.
- Logos load eagerly. They are small and content-bearing, and lazy loading left visible gaps while
  a row's asset was still in flight.
- `prisma/seed.ts` tracks which slugs ship as `.png` rather than assuming every logo is an SVG.

## 2026-08-16 — Company logos everywhere

### Added
- `CompanyLogo` component used in the directory (table + mobile cards), company header, reviews
  tab, home leaderboard and latest experiences, market stability table, comparison cards,
  community lists and discussion pages, issue lists and detail, and the review form's company
  step. Falls back to a deterministic coloured monogram when a logo is missing or fails to load.
- Placeholder monogram assets for the 16 seeded companies in `web/public/logos/`, with a README
  explaining how to swap in real files.
- `logoUrl` is now returned with every embedded company reference (reviews, discussions,
  complaints, market stability rows), not just the full company record.

### Fixed
- Company directory rows showed "No data" for availability because the list endpoint never
  returned TaskPulse; it now includes pulse per company.
- Hydration error on `/companies`: the results-count skeleton rendered a `<div>` inside a `<p>`.
  `Skeleton` accepts `as="span"` for inline placeholders.

## 2026-08-16 — Charts and company comparison

### Added
- Trend aggregation on the API: `GET /companies/:slug/trends` (TaskScore, sentiment,
  report volume, 14-day availability composition, 6-month advertised vs effective pay,
  dimension profile) and `GET /market/trends` (market reputation, sentiment, availability,
  pay by domain over time). Scores use rolling 30-day windows so a quiet week does not
  collapse the line. Unit tests in `trends.service.test.ts`.
- Company list responses now include a `scoreTrend` sparkline series, computed for the whole
  page in a single query.
- Dependency-free SVG chart kit in `web/src/components/charts/`: line/area, horizontal bar,
  grouped bar, stacked bar, radar, donut, sparkline, plus `ChartCard`/legend/empty states.
  Charts measure their container and render at 1 unit = 1px, so labels stay crisp and sized
  correctly on mobile.
- `/compare` page: pick two companies and see a radar overlay of all ten dimensions, TaskScore
  and effective-pay trend lines, an availability index comparison, and a pay-by-domain table.
  Linked from the nav and from each company's score panel.

### Changed
- Company page: radar profile beside the score bars, reputation trend, daily availability
  composition, advertised vs effective pay, report volume, and an issue-mix donut.
- Market page: reputation/sentiment trend, rate-by-domain and demand bar charts, effective pay
  over time by domain, market availability, and a TaskScore leaderboard.
- Home page: sentiment sparkline in the hero, reputation/sentiment and pay-by-domain charts,
  and a 12-week trend column in the leaderboard.

### Data
- Demo reviews now span ~115 days with per-company drift, availability reports cover 30 days
  with several reports per day, and pay reports span 6 months, so trends are meaningful.

## 2026-08-16 — Same-origin API + UI redesign

### Fixed
- "Failed to fetch" / CORS errors when the app was opened from any host other than `localhost`.
  The browser was told to call `http://localhost:5000` directly; Next now proxies
  `/api/v1/*` to the API (`next.config.ts`), so all requests are same-origin.
- API CORS accepts proxied requests (no `Origin` header) plus an `ALLOWED_ORIGINS` list,
  and trusts forwarding headers for correct client IPs.
- Rate limiter no longer throttles reads shared behind the proxy.

### Changed
- New design system in `globals.css`: cool neutral palette, cascade layers so Tailwind
  utilities override component classes, Geist + Instrument Serif, meters, skeletons.
- Redesigned every page around a decision-first layout (signal → diagnosis → action)
  with skeleton loading, honest data visualization, and mobile layouts.
- Added shared UI: `StatCard`, `SectionHeader`, `Trend`, `AvailabilityPill`, `ErrorNote`,
  `Skeleton`, `LogoMark`; TaskScore now renders as a ring gauge at large size.

### Data
- Seed expanded to 16 popular AI-training companies including Turing, Alignerr, Surge AI,
  Invisible, Labelbox, Toloka, SuperAnnotate, Snorkel AI, Prolific, and TELUS International AI,
  with varied DEMO score profiles.

## 2026-08-16 — Happy Tasking foundation

### Added
- PostgreSQL + Prisma schema for users, companies, domains/skills, structured reviews, discussions, votes, pay/availability reports, complaints, research opt-in
- Express API with auth (JWT), companies, reviews, community, market, issues
- Configurable TaskScore engine + unit tests
- Next.js web app (`web/`) with home, directory, company pages, review form, community, market, issues, auth
- DEMO seed data (companies, reviews, pulse, pay, discussions, issues)
- Migration plan documented in `MIGRATION_PLAN.md`

### Changed
- Product identity from Review&RATE → Happy Tasking
- Canonical frontend is Next.js (`web/`); Vite `client/` retained as legacy scaffold only
- Persistence migrated from MongoDB/Mongoose → PostgreSQL/Prisma

### Security / privacy
- Anonymous display default for reviews
- Public copy emphasizes: share experience, not confidential work
- Rate limiting on `/api/`
