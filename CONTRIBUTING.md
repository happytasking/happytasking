# Contributing to Happy Tasking

Thank you for helping build **the community for AI work**.

Happy Tasking is independent, community-driven, and privacy-first. The working rule for every issue, commit, screenshot, and pull request:

> **Share your experience, not confidential work.**

If a change would paste a task prompt, an internal guideline, a client name, a reviewer identity, or anything you would not put on a public website, it does not belong in this repository.

Please also read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md), [GOVERNANCE.md](GOVERNANCE.md), [SECURITY.md](SECURITY.md), and [LICENSE](LICENSE).

---

## How to create issues

Use a GitHub issue template. Do not open a blank issue if a template fits.

| Template | Use it for |
|----------|------------|
| **Bug** | Reproducible software problems in `web/`, `server/`, or local setup |
| **Feature** | A product or methodology proposal |
| **Data correction** | Inaccurate *public* company or opportunity information (name, website, slug, listing metadata) |

Before you file:

1. Search existing issues.
2. Check [ROADMAP.md](ROADMAP.md) so the request is not already planned as a later pillar.
3. Strip confidential material from logs, screenshots, and copy-paste.

Every template repeats this warning. It is not decorative:

**DO NOT INCLUDE CONFIDENTIAL PROJECT INFORMATION, TASK CONTENT, INTERNAL GUIDELINES, PRIVATE CLIENT INFORMATION, OR PERSONAL DATA.**

Security vulnerabilities are **not** GitHub issues. Email `security@happytasking.com` and follow [SECURITY.md](SECURITY.md).

---

## How to propose features

1. Open a **Feature** issue first. Describe the contributor problem, not only the UI.
2. Say which pillar it belongs to (Community, TaskScore, TaskRate, TaskPulse, TaskMatch, Resolution Center, Market Intelligence, Research, or B2B tooling).
3. Call out methodology impact. Changes to how TaskScore, TaskPulse, or TaskRate are computed need public discussion before implementation. See [GOVERNANCE.md](GOVERNANCE.md).
4. Wait for a maintainer to label the issue (`accepted`, `needs-discussion`, or similar) before writing a large patch.
5. Small, obvious fixes (typos, broken links, accessibility) can go straight to a pull request.

Company payments, sponsorships, or “boost my score” ideas will be closed. Independent reputation is not for sale.

---

## Guides (editorial)

Guides live in `content/guides/*.mdx` and are reviewed in Git like any other change.

- Propose a topic in a **Feature** issue before writing a long article.
- Copy `content/guides/_template.mdx` to `{slug}.mdx` and keep `status: draft` until maintainers agree to publish.
- Factual claims about companies or processes should be sourced (official public docs, Happy Tasking methodology, or clearly labeled community-reported data).
- Do not include confidential task/project material, leaked assessments, or copied copyrighted articles.
- Do not invent statistics, pay ranges, or screening questions.
- Community experience must be labeled as community-reported, not as official company policy.
- Stay editorially neutral. Happy Tasking does not sell ranking.
- Update `dateModified` only when the guide receives a meaningful editorial change. Do not bump the date for formatting, metadata-only, or deployment changes.

Draft files are not public URLs. Do not publish thin keyword pages.

---

## How to work on issues

1. Comment on the issue that you intend to work on it so work is not duplicated.
2. Fork the repository (or use a branch on a collaborator clone).
3. Create a branch from `main` using the names below.
4. Keep the change scoped to the issue. Unrelated refactors belong in their own PR.
5. Run tests locally. Add coverage when you change scoring, matching, or aggregation.
6. Open a pull request using the template. Link the issue.

If you cannot finish, say so on the issue. An incomplete branch is better than a silent stall.

---

## Branch naming

```text
feat/<short-slug>      # new behaviour
fix/<short-slug>       # bug
docs/<short-slug>      # README, governance, comments
chore/<short-slug>     # tooling, deps, seed hygiene
a11y/<short-slug>      # accessibility
score/<short-slug>     # TaskScore / TaskPulse / TaskRate methodology
```

Examples: `feat/taskmatch-empty-state`, `fix/company-pulse-hydration`, `docs/privacy-copy`.

Do not name branches after client projects, internal program names, or people.

---

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
feat: add dual-score empty state on TaskMatch
fix: include TaskPulse on the company list endpoint
docs: clarify seed credentials are local-only
test: cover recency decay in TaskScore
chore: ignore completed migration diary
```

- Imperative mood, present tense.
- One logical change per commit when practical.
- Never commit `.env`, credentials, dumps, or user exports.
- Never commit confidential AI project material, even “as a fixture.”

---

## Pull request process

1. Fill in [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md).
2. Link the issue with `Fixes #123` or `Refs #123`.
3. UI changes need screenshots (desktop and, if layout changed, a narrow viewport).
4. Schema changes need a Prisma migration in the same PR, not a manual production tweak.
5. Keep PRs reviewable. Prefer stacked PRs over a 2,000-line mixed patch.
6. Address review comments or explain why you are not taking them.
7. Maintainers merge. Do not force-push to `main`.

A PR that includes confidential task content, personal data, or production secrets will be closed and the history rewritten if it was already pushed.

---

## Code style

| Area | Expectation |
|------|-------------|
| Language | TypeScript, strict. Avoid `any` unless a boundary forces it. |
| Web | Next.js App Router in `web/src`. Server Components where they fit; `"use client"` only when needed. |
| API | Express controllers stay thin. Business rules live in `server/src/services/` or `server/src/lib/`. |
| Validation | Zod on external input. Do not trust query strings or JSON bodies. |
| UI | Existing tokens in `web/src/app/globals.css`. Do not introduce a second palette. |
| Naming | `TaskScore`, `TaskPulse`, `TaskRate`, `TaskMatch` as written. |
| Legacy | Do not extend `client/`. The canonical UI is `web/`. |

Match the file you are in. If you must reformat, keep it in a dedicated commit.

---

## Tests

From the repo root:

```bash
npm run test
```

That runs the API unit tests (TaskScore, trends, stars, TaskMatch). If you change those services, update the tests in the same PR.

There is no full end-to-end suite yet. For UI work, say in the PR how you verified the flow (local click-through of the affected routes).

Do not add tests that embed real task prompts, labeled answers, or production user rows.

---

## UI accessibility

- Use semantic HTML (`button`, `nav`, `main`, labels bound to inputs).
- Interactive controls need a visible focus state and a usable target (existing `min-h-11` buttons are the baseline).
- Do not convey meaning by color alone. TaskScore already pairs color with numeric labels — keep that pattern.
- Images and logos need `alt` text. Decorative icons should be `aria-hidden`.
- Keyboard users must reach login, review, issue filing, and TaskMatch without a pointer.
- Prefer `prefers-reduced-motion` friendly transitions; do not add surprise autoplay media.

If you change layout, check a desktop width and a mobile width.

---

## Privacy requirements

Public pages, seeds, screenshots, and logs may include:

- Public company names
- Work domains and skills
- Country at market level
- Structured ratings and TaskPulse-style availability
- Pseudonymous display names

They must **not** include:

- Project codenames
- Task prompts, rubrics, answers, or screenshots of the work itself
- Internal guidelines or style guides
- Client identities
- Reviewer identities or worker IDs
- Private Slack / Discord / War Room messages
- Street addresses, GPS, or other precise location
- Account emails of real people (the DEMO seed addresses are fixtures)

Default public identity is pseudonymous. Do not add features that force a legal name onto a public review.

Product copy lives with [Privacy for contributors](https://happytasking.com/privacy-for-contributors).

---

## Confidential AI project materials — prohibited

The following must never appear in issues, pull requests, tests, seeds, screenshots, or git history:

- Confidential task content
- Private prompts or answers
- Internal guidelines
- Client identities
- Reviewer identities
- Private chat or “war room” content
- Personally identifying information in public reports

If you discover that such material was committed, do not discuss the contents in a public issue. Email `security@happytasking.com`.

---

## Contributor expectations

- Be civil. Disagree with ideas, not people.
- Assume contributors are professionals under NDAs. Help them stay compliant.
- Do not scrape or publish private contributor data from a local or production database.
- Do not treat DEMO seed metrics as real market statistics in docs or marketing copy.
- Do not implement score manipulation, paid ranking, or shadow “preferred partner” boosts.
- Contributions to this repository are licensed under Apache-2.0 ([LICENSE](LICENSE)), unless a separate written agreement with Happy Tasking says otherwise.

---

## Contributor License Agreement (TODO)

**TODO:** Before substantial external contributions are accepted, Happy Tasking may introduce a Contributor License Agreement (CLA).

A CLA is not in this repository today. Do not treat this section as a signed contract. Apache-2.0 already describes inbound contributions (see section 5 of [LICENSE](LICENSE)). A later CLA, if adopted, would be a separate document — typically so the project can keep Apache-2.0 on the community product while commercial services stay in other repos.

Until a CLA is published:

- Small patches are still welcome through the normal pull-request process.
- Maintainers may pause or delay large outside contributions until the agreement exists.
- We will not ask you to paste a legal agreement into an issue comment as a substitute.

Watch this file and [GOVERNANCE.md](GOVERNANCE.md) for that change.

Questions that are not bugs belong in GitHub Discussions (when enabled) or a Feature issue, not in a security mailbox.
