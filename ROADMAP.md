# Roadmap

Happy Tasking is already live at [happytasking.com](https://happytasking.com). This roadmap is **direction**, not a contract. It does not promise release dates.

Work is grouped by product pillar. Several pillars already have an MVP on production; later phases mean depth, trust, and scale — not a greenfield rewrite.

> **Share your experience, not confidential work.** Every phase stays inside that boundary.

---

## 1. Community & Reputation

**Now**

- Public company directory and company pages
- Structured reviews feeding **TaskScore** (0–100, configurable weights, sample and recency confidence)
- Community discussions and votes
- Contributor onboarding (domains, skills, privacy-aware profile)
- Pseudonymous public identity by default
- Independent scores: companies may claim a profile and reply; they cannot buy a number

**Next**

- Clearer public methodology pages (what each dimension means, how confidence is labeled)
- Stronger anti-spam and duplicate-review handling without deanonymizing contributors
- Better tools for correcting public company metadata (see the data-correction issue template)
- Accessibility and internationalization of the core community surfaces

---

## 2. TaskMatch

**Now**

- `/taskmatch` dual scores: contributor → role (fit) and role → contributor (opportunity quality)
- TaskMatch profile built from onboarding and experience
- DEMO opportunities for local/dev and labeled fixtures
- Moderator tools for opportunity listings

**Next**

- Richer role inventory that is still public-safe (no private client names or project codenames)
- Better explanations of *why* a match scored as it did
- Contributor controls for how visible a TaskMatch profile is
- Quality filters so listings cannot launder confidential job text into the community

---

## 3. TaskPulse / TaskRate

**Now**

- **TaskPulse** — contributor availability reports on companies and the live board
- **TaskRate** — advertised vs effective pay signals on company and market views
- Charts for availability mix, pay by domain, and report volume (DEMO where seeded)

**Next**

- Clearer separation of DEMO fixtures vs community-reported production series
- More honest empty states when sample size is too small to publish a number
- Public notes when Pulse or Rate definitions change (see [GOVERNANCE.md](GOVERNANCE.md))
- Less noisy reporting UX so people can log a pulse without leaking task content

---

## 4. Resolution Center

**Now**

- Public issues (`/issues`) with company replies from verified claims
- Workflow for contributors to file a problem and for companies to answer in public
- `/for-companies` claim path: voice and badge, not score control

**Next**

- Clearer status machine (open, answered, unresolved) without hiding legitimate criticism
- Better moderation of confidential dumps accidentally pasted into an issue
- Notification hygiene that does not expose emails in the public app
- Fair timeline tools so a company’s reply is visible next to the original report

---

## 5. Market Intelligence

**Now**

- `/market` dashboard: reputation, sentiment, availability, and pay context
- Company comparison (`/compare`) on shared dimensions
- Homepage live board for AI-work conditions

**Next**

- Stronger labeling of what is DEMO vs observed
- Skill and domain slices that remain aggregated (country-level, not street-level)
- Export formats for researchers that still strip personal data
- Documentation of caveats so journalists and candidates do not treat a thin sample as a census

---

## 6. Happy Tasking Research

**Now**

- Schema-level research opt-in and privacy copy that forbids confidential work product
- Contributor-facing privacy page: [Privacy for contributors](https://happytasking.com/privacy-for-contributors)

**Next**

- Explicit research programs with documented questions, retention, and opt-out
- Aggregated publications (methodology notes, market briefs) that never include reviewer identities or task payloads
- Clear wall between research datasets and the public git repository

Research is not a back door for client deliverables. If a study needs confidential task content, it does not run on Happy Tasking’s public community.

---

## 7. B2B workforce / research tooling

**Now**

- Verified company profiles and public issue inbox
- No paid ranking, no score marketplace

**Next (possible, not promised)**

- Workforce and research tools sold as **products**, not as score influence: recruiting seats, verified-employer dashboards, licensed intelligence exports
- TaskMatch recruiting features that still respect contributor visibility settings
- Enterprise contracts that repeat, in writing, that payments do not move TaskScore, TaskRate, TaskPulse, Resolution Score, or independent community reviews

Anything in this phase that would let a customer edit public reputation will be rejected under [GOVERNANCE.md](GOVERNANCE.md).

---

## What this roadmap is not

- A launch calendar
- A commitment that every pillar will be built in order
- Permission to treat seed data as audited market statistics
- A promise that every commercial product on the open-core list will ship, or that it will live in this repository

For how decisions get made, see [GOVERNANCE.md](GOVERNANCE.md). To propose work, open a Feature issue ([CONTRIBUTING.md](CONTRIBUTING.md)).
