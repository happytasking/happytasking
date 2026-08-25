<p align="center">
  <img src="web/public/brand/logo-full.png" alt="Happy Tasking — Know before you task." height="72" />
</p>

<h1 align="center">Happy Tasking</h1>

<p align="center"><strong>The community for AI work.</strong></p>
<p align="center"><em>Know before you task.</em></p>

<p align="center">
  <a href="MANIFESTO.md"><strong>Manifesto</strong></a>
  ·
  <a href="https://happytasking.com">happytasking.com</a>
  ·
  <a href="https://happytasking.com/privacy-for-contributors">Privacy for contributors</a>
  ·
  <a href="https://happytasking.com/community">Community</a>
</p>

Why we exist, and what we believe: **[The Happy Tasking Manifesto](MANIFESTO.md)**.

Happy Tasking is an independent community, reputation, matching, resolution, and market-intelligence platform for the AI work economy.

It is built for freelancers, contractors, developers, AI evaluators, domain experts, reviewers, annotators, and other professionals doing remote AI-training and task-based work.

> **Share your experience, not confidential work.**

Happy Tasking is independent from the companies being discussed. Paid relationships must never allow companies to manipulate TaskScore, TaskRate, TaskPulse, Resolution Score, or independent community reviews.

Happy Tasking is built as an open-core platform. The community platform is open source under Apache-2.0. Certain commercial services — including proprietary datasets, enterprise intelligence, recruiting, screening, and workforce products — may be developed separately.

Those commercial products, if they exist, live outside this repository. Contributors to this repo are building the public community product. They are not expected to work on closed modules, and closed modules must not rewrite public reputation.

---

## Product pillars

| Pillar | What it is |
|--------|------------|
| **Community** | Public discussion of platforms, skills, and working conditions — without confidential task content. |
| **TaskScore** | A 0–100 reputation score from structured contributor ratings (pay, reliability, availability, stability, fairness, clarity, support, transparency). Weights live in code, not in the UI. |
| **TaskRate** | Advertised vs effective pay signals, reported by contributors and shown at market and company level. |
| **TaskPulse** | Near-term task availability: whether work is flowing, thinning, or dry. |
| **TaskMatch** | Dual matching: how well a contributor fits a role, and how well a role fits that contributor. |
| **Resolution Center** | Public issues that companies can answer from a verified profile. Scores are not for sale. |
| **Market Intelligence** | Cross-platform view of reputation, pay, and availability. Seed and fixture data is labeled **DEMO**. |
| **Happy Tasking Research** | Opt-in research participation. Private evidence stays private. |

Live product: [happytasking.com](https://happytasking.com).

---

## Screenshots

<p align="center">
  <img src="screenshots/home.png" alt="Happy Tasking home — live AI work board and company pulse" width="820" />
</p>
<p align="center"><em>Home — community pulse, companies, and the live AI-work board.</em></p>

<p align="center">
  <img src="screenshots/company.png" alt="Company page with TaskScore and structured dimensions" width="820" />
</p>
<p align="center"><em>Company page — TaskScore, dimension profile, and contributor experiences.</em></p>

<p align="center">
  <img src="screenshots/market.png" alt="Market intelligence dashboard" width="820" />
</p>
<p align="center"><em>Market intelligence — pay, availability, and reputation across platforms.</em></p>

<p align="center">
  <img src="screenshots/compare.png" alt="Side-by-side company comparison" width="820" />
</p>
<p align="center"><em>Compare — two platforms on the same TaskScore dimensions.</em></p>

More captures live in [`screenshots/`](screenshots/), including mobile layouts.

---

## Architecture

```text
Browser  →  web/ (Next.js 15, App Router, Tailwind)
                │
                │  same-origin /api/v1  (Next rewrites to the API)
                ▼
            server/ (Express 5, Zod, JWT)
                │
                ▼
            PostgreSQL  ←  Prisma
```

| Layer | Location | Role |
|-------|----------|------|
| Web | `web/` | Public SEO pages, contributor app, moderator tools |
| API | `server/` | REST `/api/v1/*`, scoring, matching, moderation |
| Schema | `server/prisma/` | Models, migrations, DEMO seed |
| Brand | `web/public/brand/` | Logo lockup, mark, tagline, Open Graph cards |
| Legacy | `client/` | Original Vite scaffold. Do not add features here. |

The Next app proxies `/api/v1` to the Express process (`API_PROXY_ORIGIN`). Production sits behind nginx the same way: `/` → Next, `/api/v1/` → API.

---

## Local development

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm

### Database

Create a local role and database. The example env file expects:

```text
postgresql://happytasking:happytasking@localhost:5432/happy_tasking
```

```bash
sudo service postgresql start
# create user/database to match server/.env.example, or change DATABASE_URL
```

### Environment

Never copy production secrets into this repo. Local files only:

```bash
cp server/.env.example server/.env
cp web/.env.example web/.env.local
```

`server/.env` needs a **local** `DATABASE_URL` and a **local** `JWT_SECRET` (the example value is for development only). `web/.env.local` points the Next proxy at `http://localhost:5000`.

### Install, migrate, seed, run

```bash
# API
cd server
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
# http://localhost:5000

# Web (second terminal)
cd web
npm install
npm run dev
# http://localhost:3000
```

From the repo root, after installing both packages:

```bash
npm run dev          # API + web
npm run test         # TaskScore, TaskMatch, trends, and related unit tests
npm run db:migrate
npm run db:seed      # reseed DEMO data — local databases only
```

Seeded **local** contributor login (also shown on `/login`):

- Email: `demo@happytasking.com`
- Password: `password123`

That password is a DEMO fixture for local development, not for production. Do not run `db:seed` against a live database.

The seed does **not** create a moderator (or any other privileged role) with a password that lives in this repository. To exercise Insights or issue triage locally:

```bash
SEED_MODERATOR_PASSWORD='a-long-local-secret' npm run db:seed
```

Use at least 16 characters. Do not reuse `password123`. Do not set `SEED_MODERATOR_PASSWORD` in production.

---

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

- Issues: bugs, features, and public data corrections each have a template.
- Pull requests need a linked issue for non-trivial changes.
- **Share your experience, not confidential work.** Do not commit task prompts, answers, internal guidelines, client names, reviewer identities, or private Slack / War Room content.

Why we exist: [MANIFESTO.md](MANIFESTO.md).  
Community standards: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).  
Product direction: [ROADMAP.md](ROADMAP.md).  
How decisions are made: [GOVERNANCE.md](GOVERNANCE.md).  
License: [LICENSE](LICENSE) (Apache-2.0).

---

## Roadmap (summary)

The product is founder-led and already live for community, TaskScore, TaskPulse, TaskRate, TaskMatch, issues, and market views. Upcoming work deepens those pillars, then expands Happy Tasking Research and B2B workforce tooling — without selling independent scores.

Details: [ROADMAP.md](ROADMAP.md). No release dates are promised here.

---

## Security and privacy

Happy Tasking is designed to collect **contributor experience**, not confidential project information.

We never want in this repository or in public reports:

- Project codenames or internal program names
- Task prompts, rubrics, answers, or labeled examples
- Internal guidelines
- Client or end-customer identities
- Reviewer names or worker IDs
- Private Slack, Discord, or War Room messages
- Production `.env` files, JWT secrets, or database credentials
- Visitor IPs, emails, or other live user data

Report vulnerabilities privately: [SECURITY.md](SECURITY.md) · `security@happytasking.com`.

Contributor-facing product rules: [Privacy for contributors](https://happytasking.com/privacy-for-contributors).

---

## Links

| | |
|---|---|
| Manifesto | [MANIFESTO.md](MANIFESTO.md) |
| Website | [happytasking.com](https://happytasking.com) |
| Community | [happytasking.com/community](https://happytasking.com/community) |
| TaskMatch | [happytasking.com/taskmatch](https://happytasking.com/taskmatch) |
| For companies | [happytasking.com/for-companies](https://happytasking.com/for-companies) |
| Privacy | [happytasking.com/privacy-for-contributors](https://happytasking.com/privacy-for-contributors) |

---

## License

This repository is licensed under the [Apache License 2.0](LICENSE).

Happy Tasking is built as an open-core platform. The community platform is open source under Apache-2.0. Certain commercial services — including proprietary datasets, enterprise intelligence, recruiting, screening, and workforce products — may be developed separately.

Examples of work that may later live in **separate** repositories or services (not in this community tree):

- Happy Tasking Intelligence
- proprietary datasets and raw research datasets
- TaskMatch Recruiter, candidate sourcing, and candidate screening
- Workforce-as-a-Service
- enterprise analytics, exports, and APIs
- advanced anti-fraud systems
- proprietary matching and ranking systems
- custom B2B research

The community product in this repository stays independent. Paid relationships must never allow companies to manipulate TaskScore, TaskRate, TaskPulse, Resolution Score, or independent community reviews.

The Apache-2.0 license applies to the source code in this repository. Happy Tasking names, logos, branding, hosted data, and trademarks are not granted under the software license.
