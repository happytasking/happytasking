# Security policy

Happy Tasking handles contributor accounts, reputation data, and (on the live site) operational signals such as verification status. Please report vulnerabilities **privately**. Do not file a public GitHub issue, and do not include live user records, verification documents, or production credentials in any report.

> **Share your experience, not confidential work.** The same rule applies to security reports: describe the flaw, not other people’s data.

---

## Contact

Email **`security@happytasking.com`**.

If GitHub private vulnerability reporting is enabled on [happytasking/happytasking](https://github.com/happytasking/happytasking), you may use that instead of (or in addition to) email.

We will acknowledge reports as soon as a maintainer can read them. There is no paid bug bounty at this time.

---

## How to report

Send a message that a maintainer can act on:

1. **Summary** — one paragraph: what is wrong and what it allows.
2. **Affected surface** — URL, API route (`/api/v1/...`), or source path.
3. **Version** — commit SHA or “production https://happytasking.com”.
4. **Reproduction** — minimal steps against a **local** instance when possible.
5. **Impact** — confidentiality, integrity, availability; whether other contributors are affected.
6. **Fix idea** (optional).

**Do not attach:**

- Production `.env` files, JWT secrets, or database dumps
- Real contributor emails, IPs, session cookies, or password hashes
- Verification evidence, government IDs, or company-claim documents
- Confidential AI task content, prompts, answers, client names, or reviewer identities
- Screenshots that contain other people’s personal data

Redact. Use a dummy local account. If you already retrieved live data by accident, stop, do not distribute it, and say so in the email without pasting the records.

---

## No public disclosure of sensitive data

Until maintainers agree that a fix is live (or that the report is invalid):

- Do not publish exploits, payloads, or proof-of-concept write-ups
- Do not tweet or blog user lists, emails, IPs, or verification status
- Do not open a public issue “so others can patch”

Coordinated disclosure protects contributors who trusted Happy Tasking with a pseudonymous profile. We would rather delay a write-up than leak an inbox.

---

## Scope

**In scope (examples)**

- Authentication and session handling (`server/src` auth, JWT cookies)
- Access control (moderator Insights, company-claim inbox, another user’s profile)
- Injection, path traversal, or unsafe file upload on the API
- Secrets accidentally shipped in this repository
- Cross-user data exposure through `/api/v1` list or detail endpoints
- Privilege escalation from `USER` → `MODERATOR` / `ADMIN`

**Out of scope (examples)**

- Social engineering of individual contributors
- Denial of service against happytasking.com
- Findings that require a stolen production `.env` you obtained by other means
- Issues only in the deprecated `client/` Vite scaffold
- Missing security headers that have no practical impact
- Self-XSS or reports that need the victim to paste JavaScript into their own console
- Physical access to a maintainer’s machine

If you are unsure, email anyway — without the sensitive payload.

---

## Production vs this repository

This GitHub repository is the **application source**. It must not contain:

- Production `DATABASE_URL` or `JWT_SECRET`
- Live visitor analytics, emails, or IP addresses
- Uploaded identity documents

Those belong in server-side environment files and the production database, which are out of git (see `.gitignore`). A leaked production secret is a security incident: email `security@happytasking.com` immediately.

Local DEMO credentials in `server/prisma/seed.ts` (for example `demo@happytasking.com`) are fixtures for development. They are not a vulnerability. Using them against production, or reseeding production, is.

The seed does not create `MODERATOR` or `ADMIN` users unless you opt in with a local `SEED_MODERATOR_PASSWORD` that is **not** stored in git. A published moderator password would be a vulnerability if it were ever used in production.

---

## Maintainer response

When a report is valid we will:

1. Confirm the issue and its severity
2. Prepare a fix on a private branch when needed
3. Deploy to production before any public write-up
4. Credit you in the advisory if you want to be named (pseudonym is fine)

Thank you for helping keep contributors safe.
