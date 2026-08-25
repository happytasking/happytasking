# Governance

Happy Tasking is an independent community for the AI work economy. This document describes how product, methodology, and repository decisions are made **today**, not a promise of a future legal entity.

---

## Current model: founder-led

Happy Tasking is **founder-led**.

The founder (and any people they appoint as maintainers) decide:

- What merges to `main`
- What ships to [happytasking.com](https://happytasking.com)
- Who holds `MODERATOR` / `ADMIN` roles on the live site
- When a methodology change is ready to go public

This is not a consortium of the companies listed in the directory. Platforms can claim a profile and answer issues; they do not vote on TaskScore.

---

## How contributors participate

Anyone can:

- File issues using the GitHub templates (bug, feature, data correction)
- Start a GitHub Discussion when that feature is enabled
- Submit pull requests against an accepted issue
- Comment in good faith on methodology and privacy

Maintainers review pull requests. Merge is not automatic, even when CI is green.

Non-trivial product work should be proposed in an issue **before** a large PR. See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## Public discussion for major methodology changes

TaskScore, TaskPulse, and TaskRate are public trust surfaces. They must remain **transparent**.

A change is “major” when it would:

- Alter default TaskScore weights or the 0–100 mapping in a way that reorders companies
- Change sample-size, recency, or verification rules that affect confidence labels
- Redefine what TaskPulse availability buckets mean
- Change how advertised vs effective pay (TaskRate) is aggregated
- Hide or paywall historical scores that were public

Major changes require a **public GitHub issue or Discussion** that states:

1. What is changing and why
2. Who is affected (contributors, companies, researchers)
3. How independence is preserved
4. How existing public numbers should be read after the change (break vs continuity)

Maintainers will not silently retune reputation in a private commit. Implementation can follow discussion; it should not precede it.

Smaller bug fixes in scoring math (wrong join, off-by-one, missing pulse on a list endpoint) can ship with a changelog note and tests. When in doubt, open the discussion issue first.

---

## Independence from company payments

**Company payments must never influence independent reputation scores.**

Paid relationships must never allow companies to manipulate:

- TaskScore
- TaskRate
- TaskPulse
- Resolution Score
- independent community reviews

Allowed, if they exist later: paying for verified-profile tools, recruiting seats, research exports, or other B2B products that do not write to TaskScore / TaskPulse / TaskRate.

Not allowed:

- Paying to raise a TaskScore
- Paying to bury an issue or a review
- Preferential matching on TaskMatch because a company is a customer
- Private “score review” retainers that change public numbers

Claiming a company profile buys a **voice** (badge + public replies), not a number. That product rule is also stated on [For companies](https://happytasking.com/for-companies).

If a PR, partnership, or feature would make a score depend on revenue, maintainers will reject it.

---

## Contributor privacy takes priority

When product goals conflict, **contributor privacy wins**.

That means:

- Public default is pseudonymous
- We collect experience and structured ratings, not confidential work product
- Verification evidence is not a public artifact
- Insights that contain IPs, emails, or precise location stay behind moderator access on the live site and stay **out of git**
- A feature that would make public reports identify a person against their will is out of scope

The contributor rule remains:

> **Share your experience, not confidential work.**

No project codenames, private prompts, answers, internal guidelines, client identities, reviewer identities, or War Room content in public reports or in this repository.

---

## Maintainers and moderation

Live-site moderators and GitHub maintainers may be the same people or different people. GitHub `CODEOWNERS` is not required yet.

Moderation of content (spam, confidential leaks, abuse) follows [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md). Moderation of **scores** follows this file: transparent methodology, no paid influence.

---

## License and commercial products

The community source in this repository is licensed under [Apache-2.0](LICENSE).

Happy Tasking follows an **open-core** model. This git tree is the community product. Commercial and proprietary products may later live in separate repositories or services — for example Happy Tasking Intelligence, proprietary or raw research datasets, TaskMatch Recruiter, candidate sourcing and screening, Workforce-as-a-Service, enterprise analytics and exports, advanced anti-fraud, proprietary matching/ranking, and custom B2B research.

Those products must still obey independence and privacy:

**Paid relationships must never allow companies to manipulate TaskScore, TaskRate, TaskPulse, Resolution Score, or independent community reviews.**

Open-source contributors are not obligated to work on closed modules. Closed modules must not silently rewrite public scores.

A Contributor License Agreement may be introduced before substantial external contributions are accepted. See the TODO in [CONTRIBUTING.md](CONTRIBUTING.md). No CLA text is published yet.

---

## Changes to this document

Edits to GOVERNANCE.md should be proposed in a public issue or pull request. Material changes to independence, privacy priority, or methodology transparency need the same public discussion bar as a major scoring change.
