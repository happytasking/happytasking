import type { Metadata } from "next";
import Link from "next/link";
import { publicPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = publicPageMetadata({
  path: "/privacy-for-contributors",
  title: "Privacy for contributors",
  description:
    "Share your experience, not confidential work. How Happy Tasking treats contributor privacy, public identity, and confidential AI-training material.",
});

const NEVER_ASK = [
  "Project codenames or internal program names",
  "Task prompts, rubrics, or model instructions",
  "Task answers or labeled examples",
  "Internal guidelines or style guides",
  "Client names or end-customer identities",
  "Reviewer names or worker IDs",
  "Private Slack, Discord, or War Room messages",
  "Task IDs, private URLs, or screenshots of confidential work",
  "Street address, GPS, or other precise location",
];

const WE_DO_COLLECT = [
  "Public company names you have worked with",
  "Work domains and skills (for example Coding, Python)",
  "Country, at market level — not your address",
  "Approximate tenure and whether you currently work with a platform",
  "Structured ratings of pay, availability, stability, and support",
  "Optional TaskPulse reports about current task availability",
];

export default function PrivacyForContributorsPage() {
  return (
    <div className="container-page max-w-2xl space-y-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy-for-contributors" },
        ]}
      />
      <header>
        <p className="eyebrow">Privacy</p>
        <h1 className="page-title mt-1">Privacy for contributors</h1>
        <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted">
          Happy Tasking is designed to collect contributor experience, not
          confidential project information.
        </p>
        <p className="mt-4 rounded-[var(--radius)] bg-accent-soft px-4 py-3 text-sm font-semibold text-accent">
          Share your experience, not confidential work.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="section-title">The rule</h2>
        <p className="text-sm leading-relaxed text-muted">
          Tell the community how a platform treats you: pay, task flow,
          reviewers, support, stability. Do not paste the work itself. If it
          would be a problem in a client contract or an NDA, it does not belong
          here.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">We never ask for</h2>
        <ul className="space-y-2 text-sm text-muted">
          {NEVER_ASK.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-subtle">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">What onboarding and reports use</h2>
        <ul className="space-y-2 text-sm text-muted">
          {WE_DO_COLLECT.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden="true" className="text-good">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">Public, private, and aggregate</h2>
        <p className="text-sm leading-relaxed text-muted">
          These are not the same thing, and we do not pretend they are.
        </p>
        <dl className="space-y-4 text-sm">
          <div>
            <dt className="font-semibold">Private account data</dt>
            <dd className="mt-1 text-muted">
              Your email is always private. Company experience defaults to
              aggregate-only. You control whether skills, domains, or country
              appear on a public profile.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Public pseudonymity</dt>
            <dd className="mt-1 text-muted">
              Reviews default to anonymous. You may publish under your username.
              That is a public label, not a legal-name identity, and it is not
              the same as anonymous statistics.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Aggregate community insights</dt>
            <dd className="mt-1 text-muted">
              Individual answers can be combined into TaskScore, TaskPulse, and
              TaskRate. Aggregates never display another contributor&apos;s
              private response. Sample size and methodology travel with every
              public figure.
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Site operations</dt>
            <dd className="mt-1 text-muted">
              Happy Tasking moderators can see first-party visit logs (page,
              approximate city/country, IP) to operate the community. That data
              is not public and is not a GPS location.
            </dd>
          </div>
        </dl>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">Verification stays private</h2>
        <p className="text-sm leading-relaxed text-muted">
          If you later verify a contribution, the evidence (pay stubs, platform
          screenshots, work email) is not shown on the public site. Other
          people may see that a report is verified — not the file you uploaded.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="section-title">If you are unsure</h2>
        <p className="text-sm leading-relaxed text-muted">
          Leave it out. Describe the experience in your own words: how often
          tasks appeared, whether pay arrived, whether reviewers felt fair.
          Company name + domain + skills is enough for market intelligence.
          Project names are not.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link href="/reviews/new" className="btn btn-accent min-h-11">
            Share an experience
          </Link>
          <Link href="/" className="btn btn-secondary min-h-11">
            Back to Happy Tasking
          </Link>
        </div>
      </section>
    </div>
  );
}
