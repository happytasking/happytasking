import type { Metadata } from "next";
import Link from "next/link";
import { publicPageMetadata } from "@/lib/seo";
import { IndependenceStatement } from "@/components/IndependenceStatement";
import { GitHubIcon } from "@/components/GitHubIcon";
import { GITHUB } from "@/lib/github";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = publicPageMetadata({
  path: "/methodology",
  title: "Methodology — How Happy Tasking measures AI work",
  description:
    "What TaskScore, TaskRate, TaskPulse, Resolution Score, and TaskMatch measure, where the data comes from, and where methodology documentation is still being developed.",
});

const METRICS = [
  {
    name: "TaskScore",
    measures:
      "A 0–100 reputation figure from structured contributor ratings: overall experience, pay, payment reliability, availability, stability, reviewer fairness, guideline clarity, support, transparency, and whether someone would work with the platform again.",
    sources:
      "Public and verified community reviews. DEMO seed data is labeled DEMO and is not community observation.",
    sample:
      "Public scores require at least 5 reviews in the selected window. Below that, Happy Tasking shows insufficient data rather than a thin number.",
    freshness:
      "Scores can be viewed over 7-day, 30-day, 90-day, or all-time windows. Confidence also looks at how many reports arrived in the last 90 days.",
    confidence:
      "A 0–100 confidence label (Low / Medium / High) reflects sample size, the share of verified reports, country diversity, and recency. It is not the TaskScore itself.",
    limitations:
      "Reviews are self-reported. Weights live in the open-source scoring service and can change after public discussion. Full narrative methodology — including every weight and edge case — is still being written for this page.",
    status: "partial" as const,
  },
  {
    name: "TaskRate",
    measures:
      "What contributors report about advertised pay versus effective pay (what they actually earn after unpaid time).",
    sources: "Optional pay reports attached to contributor experience.",
    sample: "Shown with sample size when enough reports exist; otherwise empty.",
    freshness: "Market and company views use recent report windows.",
    confidence: "Treat small samples as directional, not a census.",
    limitations:
      "Pay varies by domain, country, and seniority. Methodology documentation for exact aggregation rules is being developed.",
    status: "developing" as const,
  },
  {
    name: "TaskPulse",
    measures:
      "Whether work appears to be flowing, thinning, or dry — near-term task availability.",
    sources: "Contributor availability reports, including quick pulse check-ins.",
    sample: "Company and market pulse cite the reports in the current window.",
    freshness: "Typically last 7 days on the live board.",
    confidence: "A quiet week is not the same as a quiet quarter.",
    limitations:
      "Pulse is a snapshot, not a forecast. Detailed methodology documentation is being developed.",
    status: "developing" as const,
  },
  {
    name: "Resolution Score",
    measures:
      "How published issues appear to resolve: whether they reach a resolved state and how satisfied reporters are when they rate the outcome.",
    sources: "Public Resolution Center issues for a company.",
    sample:
      "Omitted when there are fewer than three published issues — missing data is not treated as zero.",
    freshness: "Follows the current issue set, not a fixed calendar window.",
    confidence: "Thin issue history should not be read as a complete record.",
    limitations:
      "Not every problem is filed. A company with no issues is not automatically a perfect resolver. Fuller methodology documentation is being developed.",
    status: "developing" as const,
  },
  {
    name: "TaskMatch",
    measures:
      "Two questions: how well a contributor fits a role (YOU → ROLE), and how well that role fits the contributor given independent community intelligence (ROLE → YOU).",
    sources:
      "Contributor profile (skills, experience, location, language, availability, interests) plus company TaskScore, pulse, pay, stability, and resolution signals where available.",
    sample: "Match quality depends on how complete a profile is.",
    freshness: "Uses current profile and current company intelligence.",
    confidence: "Explains matches as fit plus opportunity quality — not a hiring decision.",
    limitations:
      "Listings must stay public-safe (no private client or project names). Ranking details and weight documentation are being developed; the matching code is in the public repository.",
    status: "developing" as const,
  },
];

export default function MethodologyPage() {
  return (
    <div className="container-page max-w-3xl space-y-10">
      <Breadcrumbs
        items={[
          { name: "Home", path: "/" },
          { name: "Methodology", path: "/methodology" },
        ]}
      />
      <header>
        <p className="eyebrow">Methodology</p>
        <h1 className="page-title mt-1">Context around the numbers</h1>
        <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">
          Happy Tasking aims to explain public metrics instead of presenting
          mysterious scores. A number without sample size, freshness, or
          confidence can mislead. Where a formula is not yet documented here, we
          say so — we do not invent one for this page.
        </p>
      </header>

      <IndependenceStatement />

      <div className="space-y-4">
        {METRICS.map((metric) => (
          <article key={metric.name} className="panel panel-pad space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="section-title">{metric.name}</h2>
              <span className="badge bg-demo-bg text-demo">
                {metric.status === "partial"
                  ? "Documented in code · narrative in progress"
                  : "Methodology documentation is being developed"}
              </span>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold">What it measures</dt>
                <dd className="mt-1 leading-relaxed text-muted">{metric.measures}</dd>
              </div>
              <div>
                <dt className="font-semibold">Data sources</dt>
                <dd className="mt-1 leading-relaxed text-muted">{metric.sources}</dd>
              </div>
              <div>
                <dt className="font-semibold">Sample size</dt>
                <dd className="mt-1 leading-relaxed text-muted">{metric.sample}</dd>
              </div>
              <div>
                <dt className="font-semibold">Freshness</dt>
                <dd className="mt-1 leading-relaxed text-muted">{metric.freshness}</dd>
              </div>
              <div>
                <dt className="font-semibold">Confidence</dt>
                <dd className="mt-1 leading-relaxed text-muted">{metric.confidence}</dd>
              </div>
              <div>
                <dt className="font-semibold">Limitations</dt>
                <dd className="mt-1 leading-relaxed text-muted">{metric.limitations}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>

      <p className="text-sm leading-relaxed text-muted">
        Major changes to how these metrics are computed should be discussed in
        public before they ship. See{" "}
        <Link href="/governance" className="font-semibold text-accent hover:underline">
          governance
        </Link>
        . Scoring and matching source lives in the repository.
      </p>
      <p className="text-sm">
        <a
          href={GITHUB.repo}
          className="inline-flex items-center gap-1.5 font-semibold text-accent hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          <GitHubIcon className="h-3.5 w-3.5" />
          Inspect the code
        </a>
      </p>
    </div>
  );
}
