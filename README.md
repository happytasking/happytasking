# Happy Tasking

**The community for AI work.**  
**Know before you task.**

Independent reputation, community, and market intelligence for the AI task-work economy.

> Share your experience, not confidential work.

---

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 15 (App Router), TypeScript, Tailwind |
| API | Express 5, TypeScript, Zod |
| DB | PostgreSQL + Prisma |
| Auth | JWT (httpOnly cookie + Bearer) |

Legacy Vite client in `client/` is deprecated — use `web/`.

---

## Quick start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

### Database

```bash
sudo service postgresql start
# user/db already used in .env.example:
# postgresql://happytasking:happytasking@localhost:5432/happy_tasking
```

### API

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
# http://localhost:5000
```

Demo login from seed:

- Email: `demo@happytasking.com`
- Password: `password123`

### Web

```bash
cd web
cp .env.example .env.local
npm install
npm run dev
# http://localhost:3000
```

### Root scripts

```bash
npm run dev          # API + web concurrently (if root deps installed)
npm run test         # TaskScore unit tests
npm run db:seed      # reseed DEMO data
```

---

## Product surfaces

| Route | Purpose |
|-------|---------|
| `/` | Home — pulse, companies, community, skills |
| `/companies` | Directory + TaskScore |
| `/companies/[slug]` | Company overview |
| `/reviews/new` | Structured multi-step review |
| `/community` | Discussions |
| `/market` | AI work market dashboard (DEMO labeled) |
| `/issues` | Complaints / resolution |
| `/login` · `/register` | Auth |

---

## API (`/api/v1`)

- `POST /auth/register|login` · `GET /auth/me`
- `GET|POST /companies` · `GET /companies/:slug`
- `GET /companies/meta/domains|skills`
- `GET|POST /reviews` · `GET /reviews/company/:slug`
- `GET|POST /community` · comments + votes
- `GET /market` · pay/availability report POSTs
- `GET|POST /issues`

---

## Notes

- Seed/fixture content is marked **DEMO** — not production metrics.
- TaskScore is a configurable service (`server/src/services/taskScore.service.ts`).
- See `CHANGELOG.md` and `MIGRATION_PLAN.md`.
