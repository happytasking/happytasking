import Link from "next/link";
import { DemoBadge } from "@/components/DemoBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import {
  comparisonMetricDisplay,
  comparisonPageHeading,
  comparisonSeoSections,
  relatedComparisonPairs,
} from "@/lib/comparisonSeo";
import {
  DIMENSION_LABELS,
  formatMoney,
  formatPeriodLabel,
  formatScore,
  humanize,
} from "@/lib/format";
import type { Company, TaskScoreResult } from "@/lib/types";

function SourceNote({ demo }: { demo: boolean }) {
  return (
    <p className="mt-1 text-xs text-subtle">
      Community-reported data
      {demo ? " · Illustrative demo data — not production metrics" : ""}
    </p>
  );
}

function MetricCell({ value }: { value: number | null | undefined }) {
  const display = comparisonMetricDisplay(value);
  if (display === "Not enough data") {
    return <span className="text-sm text-muted">Not enough data</span>;
  }
  return <span className="num font-semibold">{formatScore(display)}</span>;
}

function dim(
  company: Company,
  key: keyof NonNullable<TaskScoreResult["dimensions"]>,
) {
  return company.score?.dimensions?.[key];
}

function evidenceContrast(
  left: Company,
  right: Company,
  leftValue: number | null | undefined,
  rightValue: number | null | undefined,
  label: string,
): string | null {
  if (left.isDemo || right.isDemo) return null;
  if (leftValue == null || rightValue == null) return null;
  if (leftValue === rightValue) return null;
  const stronger = leftValue > rightValue ? left.name : right.name;
  const weaker = leftValue > rightValue ? right.name : left.name;
  return `${stronger} currently reports a higher ${label} than ${weaker}.`;
}

export function ComparisonIntelligence({
  left,
  right,
}: {
  left: Company;
  right: Company;
}) {
  const demo = Boolean(left.isDemo || right.isDemo);
  const sections = comparisonSeoSections(left, right);
  const related = relatedComparisonPairs(left, right, 4);
  const sample = (company: Company) => company.score?.sampleSize;
  const period = left.score?.period || right.score?.period || "90d";

  const tableRows: Array<{
    id: string;
    label: string;
    a: number | null | undefined;
    b: number | null | undefined;
  }> = [
    { id: "taskScore", label: "TaskScore", a: left.score?.taskScore, b: right.score?.taskScore },
    { id: "pay", label: DIMENSION_LABELS.pay, a: dim(left, "pay"), b: dim(right, "pay") },
    {
      id: "taskAvailability",
      label: DIMENSION_LABELS.taskAvailability,
      a: dim(left, "taskAvailability"),
      b: dim(right, "taskAvailability"),
    },
    {
      id: "projectStability",
      label: DIMENSION_LABELS.projectStability,
      a: dim(left, "projectStability"),
      b: dim(right, "projectStability"),
    },
    {
      id: "paymentReliability",
      label: DIMENSION_LABELS.paymentReliability,
      a: dim(left, "paymentReliability"),
      b: dim(right, "paymentReliability"),
    },
    {
      id: "reviewerFairness",
      label: DIMENSION_LABELS.reviewerFairness,
      a: dim(left, "reviewerFairness"),
      b: dim(right, "reviewerFairness"),
    },
    {
      id: "guidelineClarity",
      label: DIMENSION_LABELS.guidelineClarity,
      a: dim(left, "guidelineClarity"),
      b: dim(right, "guidelineClarity"),
    },
    {
      id: "support",
      label: DIMENSION_LABELS.supportQuality,
      a: dim(left, "supportQuality"),
      b: dim(right, "supportQuality"),
    },
    {
      id: "transparency",
      label: DIMENSION_LABELS.transparency,
      a: dim(left, "transparency"),
      b: dim(right, "transparency"),
    },
  ].filter((row) => row.a != null || row.b != null);

  return (
    <article className="container-page space-y-6">
      <header className="space-y-3">
        <p className="eyebrow">
          <Link href="/compare" className="hover:text-accent hover:underline">
            Compare
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="page-title">
            {comparisonPageHeading(left.name, right.name)}
          </h1>
          <DemoBadge show={demo} />
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Side-by-side public information and community-reported intelligence for{" "}
          {left.name} and {right.name}. Happy Tasking does not declare a universal
          winner.
        </p>
      </header>

      {sections.includes("quick") && tableRows.length > 0 && (
        <section id="quick" className="panel panel-pad space-y-3">
          <h2 className="section-title">Quick Comparison</h2>
          <SourceNote demo={demo} />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Dimension</th>
                  <th>{left.name}</th>
                  <th>{right.name}</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row) => (
                  <tr key={row.id}>
                    <td className="font-medium">{row.label}</td>
                    <td>
                      <MetricCell value={row.a} />
                    </td>
                    <td>
                      <MetricCell value={row.b} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted">
            Window: {formatPeriodLabel(period)}. Missing values are not treated as
            zero.
          </p>
        </section>
      )}

      {sections.includes("taskScore") && (
        <section id="taskscore" className="panel panel-pad space-y-4">
          <h2 className="section-title">TaskScore</h2>
          <SourceNote demo={demo} />
          <div className="grid gap-4 sm:grid-cols-2">
            {[left, right].map((company) => (
              <div key={company.slug}>
                <p className="font-medium">{company.name}</p>
                <p className="mt-1 text-sm">
                  {company.score?.taskScore == null ? (
                    "Not enough data"
                  ) : (
                    <>
                      TaskScore{" "}
                      <span className="num font-semibold">
                        {formatScore(company.score.taskScore)} / 100
                      </span>
                    </>
                  )}
                </p>
                {(sample(company) ?? 0) > 0 && (
                  <p className="mt-1 text-sm text-muted">
                    Based on {sample(company)} contributor reports
                    {company.score?.confidence?.verifiedCount
                      ? ` · ${company.score.confidence.verifiedCount} verified contributors`
                      : ""}
                    {company.score?.confidence
                      ? ` · Confidence: ${humanize(company.score.confidence.tier)}`
                      : ""}
                    {company.score?.period
                      ? ` · ${formatPeriodLabel(company.score.period)}`
                      : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.includes("pay") && (
        <section id="pay" className="panel panel-pad space-y-3">
          <h2 className="section-title">Pay</h2>
          <SourceNote demo={demo} />
          {evidenceContrast(left, right, dim(left, "pay"), dim(right, "pay"), "pay") && (
            <p className="text-sm text-muted">
              {evidenceContrast(left, right, dim(left, "pay"), dim(right, "pay"), "pay")}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {[left, right].map((company) => (
              <div key={company.slug} className="space-y-3">
                <p className="text-sm font-medium">{company.name}</p>
                {dim(company, "pay") == null ? (
                  <p className="text-sm text-muted">Not enough data</p>
                ) : (
                  <ScoreBar label="Pay" value={dim(company, "pay")} max={100} />
                )}
                {company.payByDomain && company.payByDomain.length > 0 ? (
                  <div className="table-wrap">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>Domain</th>
                          <th>Advertised</th>
                          <th>Effective</th>
                          <th>Reports</th>
                        </tr>
                      </thead>
                      <tbody>
                        {company.payByDomain.map((row) => (
                          <tr key={row.domain}>
                            <td className="font-medium">{row.domain}</td>
                            <td className="num">{formatMoney(row.advertisedRate)}</td>
                            <td className="num font-semibold">
                              {formatMoney(row.effectiveRate)}
                            </td>
                            <td className="num text-muted">{row.sampleSize}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {(
        [
          ["taskAvailability", "Task Availability", "taskAvailability"],
          ["projectStability", "Project Stability", "projectStability"],
          ["paymentReliability", "Payment Reliability", "paymentReliability"],
          ["reviewerFairness", "Reviewer Fairness", "reviewerFairness"],
          ["guidelineClarity", "Guideline Clarity", "guidelineClarity"],
          ["support", "Support", "supportQuality"],
          ["transparency", "Transparency", "transparency"],
        ] as const
      ).map(([section, title, key]) =>
        sections.includes(section) ? (
          <section key={section} id={section} className="panel panel-pad space-y-3">
            <h2 className="section-title">{title}</h2>
            <SourceNote demo={demo} />
            {evidenceContrast(left, right, dim(left, key), dim(right, key), title.toLowerCase()) && (
              <p className="text-sm text-muted">
                {evidenceContrast(
                  left,
                  right,
                  dim(left, key),
                  dim(right, key),
                  title.toLowerCase(),
                )}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {[left, right].map((company) => (
                <div key={company.slug} className="max-w-md">
                  <p className="mb-2 text-sm font-medium">{company.name}</p>
                  {dim(company, key) == null ? (
                    <p className="text-sm text-muted">Not enough data</p>
                  ) : (
                    <ScoreBar label={title} value={dim(company, key)} max={100} />
                  )}
                </div>
              ))}
            </div>
            {section === "taskAvailability" && (
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {[left, right].map((company) => (
                  <div key={company.slug} className="flex items-center justify-between gap-3">
                    <dt className="text-muted">{company.name} TaskPulse</dt>
                    <dd>
                      {(company.pulse?.sampleSize ?? 0) > 0 ? (
                        <AvailabilityPill status={company.pulse?.availability} />
                      ) : (
                        <span className="text-muted">Not enough data</span>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        ) : null,
      )}

      {sections.includes("experience") && (
        <section id="experience" className="panel panel-pad space-y-3">
          <h2 className="section-title">Contributor Experience</h2>
          <SourceNote demo={demo} />
          <div className="grid gap-4 sm:grid-cols-2">
            {[left, right].map((company) => (
              <div key={company.slug}>
                <p className="font-medium">{company.name}</p>
                <p className="mt-1 text-sm text-muted">
                  Would work again:{" "}
                  {dim(company, "wouldWorkAgainRate") == null ? (
                    "Not enough data"
                  ) : (
                    <span className="num font-semibold">
                      {formatScore(dim(company, "wouldWorkAgainRate"))}%
                    </span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.includes("issues") && (
        <section id="issues" className="panel panel-pad space-y-3">
          <h2 className="section-title">Issues & Resolution</h2>
          <SourceNote demo={demo} />
          <div className="grid gap-4 sm:grid-cols-2">
            {[left, right].map((company) => (
              <div key={company.slug}>
                <p className="font-medium">{company.name}</p>
                {company.resolution ? (
                  <p className="mt-1 text-sm text-muted">
                    {company.resolution.sampleSize} public issues
                    {company.resolution.resolutionScore != null
                      ? ` · Resolution Score ${company.resolution.resolutionScore}`
                      : ""}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-muted">Not enough data</p>
                )}
                <Link
                  href={`/issues?company=${company.slug}`}
                  className="text-sm font-semibold text-accent hover:underline"
                >
                  Public issues for {company.name}
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {sections.includes("fits") && (
        <section id="fits" className="panel panel-pad space-y-3">
          <h2 className="section-title">Which Company Fits You Better?</h2>
          <p className="text-sm text-muted">
            Fit depends on professional skills, domain expertise, location,
            availability, and preferred work type. This page does not rank{" "}
            {left.name} above {right.name} or the reverse.
          </p>
        </section>
      )}

      {sections.includes("exploreA") && (
        <section id="explore-a" className="panel panel-pad space-y-2">
          <h2 className="section-title">Explore {left.name}</h2>
          <Link
            href={`/companies/${left.slug}`}
            className="font-semibold text-accent hover:underline"
          >
            {left.name} reviews, pay and task availability
          </Link>
        </section>
      )}

      {sections.includes("exploreB") && (
        <section id="explore-b" className="panel panel-pad space-y-2">
          <h2 className="section-title">Explore {right.name}</h2>
          <Link
            href={`/companies/${right.slug}`}
            className="font-semibold text-accent hover:underline"
          >
            {right.name} reviews, pay and task availability
          </Link>
        </section>
      )}

      {related.length > 0 && (
        <section id="related" className="panel panel-pad space-y-3">
          <h2 className="section-title">Related Comparisons</h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((pair) => (
              <li key={pair.slug}>
                <Link
                  href={`/compare/${pair.slug}`}
                  className="chip hover:border-border-strong"
                >
                  Compare {pair.leftName} and {pair.rightName}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sections.includes("taskmatch") && (
        <section id="taskmatch" className="panel panel-pad space-y-3">
          <h2 className="section-title">
            Find AI Work That Matches Your Skills
          </h2>
          <p className="text-sm text-muted">
            Use TaskMatch to see companies against your skills and constraints.
            This is independent intelligence, not a job advertisement.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/taskmatch" className="btn btn-secondary min-h-11">
              Find companies that match your skills
            </Link>
            <Link href="/methodology" className="btn btn-secondary min-h-11">
              How scores are measured
            </Link>
            <Link href="/companies" className="btn btn-secondary min-h-11">
              Company directory
            </Link>
            <Link href="/compare" className="btn btn-secondary min-h-11">
              Open the comparison tool
            </Link>
          </div>
        </section>
      )}
    </article>
  );
}
