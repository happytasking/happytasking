import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { DemoBadge } from "@/components/DemoBadge";
import { ScoreBar } from "@/components/ScoreBar";
import { AvailabilityPill } from "@/components/AvailabilityPill";
import {
  companyPageHeading,
  companySeoSections,
  isPublicCompanyWebsite,
  listedCompanyJsonLd,
} from "@/lib/companySeo";
import {
  DIMENSION_LABELS,
  formatMoney,
  formatPeriodLabel,
  formatScore,
  humanize,
} from "@/lib/format";
import { comparisonPath, isValidRelatedComparison } from "@/lib/comparisonSeo";
import type { Company, Review } from "@/lib/types";

function SourceLabel({
  kind,
  demo,
}: {
  kind: "public" | "community";
  demo?: boolean;
}) {
  return (
    <p className="mt-1 text-xs text-subtle">
      {kind === "public"
        ? "Public company information"
        : "Community-reported data"}
      {demo ? " · Illustrative demo data — not production metrics" : ""}
    </p>
  );
}

function DimensionSection({
  id,
  title,
  value,
  sampleSize,
  period,
  demo,
  extra,
}: {
  id: string;
  title: string;
  value: number | null | undefined;
  sampleSize?: number;
  period?: string;
  demo?: boolean;
  extra?: React.ReactNode;
}) {
  if (value == null && !extra) return null;
  return (
    <section id={id} className="panel panel-pad">
      <h2 className="section-title">{title}</h2>
      <SourceLabel kind="community" demo={demo} />
      {value != null && (
        <div className="mt-4 max-w-md">
          <ScoreBar label={title} value={value} max={100} />
        </div>
      )}
      {sampleSize != null && sampleSize > 0 && (
        <p className="mt-3 text-sm text-muted">
          Based on {sampleSize} contributor reports
          {period ? ` · ${formatPeriodLabel(period)}` : ""}
        </p>
      )}
      {extra}
    </section>
  );
}

export function CompanyIntelligence({
  company,
  reviews,
  indexable,
}: {
  company: Company;
  reviews: Review[];
  indexable: boolean;
}) {
  const demo = Boolean(company.isDemo);
  const dims = company.score?.dimensions;
  const visibleReviews = demo
    ? reviews
    : reviews.filter((review) => !review.isDemo);
  const sections = companySeoSections({
    isDemo: demo,
    description: company.description,
    country: company.country,
    headquarters: company.headquarters,
    website: company.website,
    workDomains: company.workDomains,
    score: company.score,
    pulse: company.pulse,
    payByDomain: company.payByDomain,
    reviews: visibleReviews,
    resolution: company.resolution,
    similarCompanies: company.similarCompanies,
    topIssues: company.topIssues,
  });
  const orgJsonLd = listedCompanyJsonLd(company, indexable);
  const sample = company.score?.sampleSize;
  const period = company.score?.period;
  const similar = company.similarCompanies || [];
  const comparable = similar.filter((other) =>
    isValidRelatedComparison(company, other),
  );
  const intro = company.description?.trim()
    ? company.description.trim()
    : `${company.name} is listed in the Happy Tasking company directory.`;

  return (
    <article className="container-page space-y-6">
      {orgJsonLd && <JsonLd data={orgJsonLd} />}
      <header className="space-y-3">
        <p className="eyebrow">
          <Link href="/companies" className="hover:text-accent hover:underline">
            Companies
          </Link>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="page-title">{companyPageHeading(company.name)}</h1>
          <DemoBadge show={demo} />
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">{intro}</p>
      </header>

      {sections.includes("overview") && (
        <section id="overview" className="panel panel-pad space-y-3">
          <h2 className="section-title">Company Overview</h2>
          <SourceLabel kind="public" />
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-subtle">Company</dt>
              <dd className="mt-0.5 font-medium">{company.name}</dd>
            </div>
            {company.companyStatus && (
              <div>
                <dt className="text-xs text-subtle">Listing status</dt>
                <dd className="mt-0.5 font-medium">
                  {humanize(company.companyStatus)}
                </dd>
              </div>
            )}
            {company.country && (
              <div>
                <dt className="text-xs text-subtle">Country</dt>
                <dd className="mt-0.5 font-medium">{company.country}</dd>
              </div>
            )}
            {company.headquarters && (
              <div>
                <dt className="text-xs text-subtle">Headquarters</dt>
                <dd className="mt-0.5 font-medium">{company.headquarters}</dd>
              </div>
            )}
            {isPublicCompanyWebsite(company.website) && (
              <div>
                <dt className="text-xs text-subtle">Website</dt>
                <dd className="mt-0.5">
                  <a
                    href={company.website!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-accent hover:underline"
                  >
                    {company.website}
                  </a>
                </dd>
              </div>
            )}
            {company.workDomains && company.workDomains.length > 0 && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-subtle">Work domains</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {company.workDomains.map((domain) => (
                    <span key={domain} className="chip">
                      {domain}
                    </span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <p className="text-sm">
            <Link
              href="/methodology"
              className="font-semibold text-accent hover:underline"
            >
              How Happy Tasking measures companies
            </Link>
          </p>
        </section>
      )}

      {sections.includes("reputation") && company.score?.taskScore != null && (
        <section id="reputation" className="panel panel-pad space-y-3">
          <h2 className="section-title">Contributor Reputation</h2>
          <SourceLabel kind="community" demo={demo} />
          <p className="text-sm">
            TaskScore{" "}
            <span className="num font-semibold">
              {formatScore(company.score.taskScore)} / 100
            </span>
          </p>
          <p className="text-sm text-muted">
            Based on {sample ?? 0} contributor reports
            {company.score.confidence?.verifiedCount
              ? ` · ${company.score.confidence.verifiedCount} verified contributors`
              : ""}
            {period ? ` · ${formatPeriodLabel(period)}` : ""}
          </p>
          {company.score.confidence && (
            <p className="text-sm text-muted">
              Contributor confidence: {humanize(company.score.confidence.tier)}
            </p>
          )}
        </section>
      )}

      {sections.includes("pay") && (
        <section id="pay" className="panel panel-pad space-y-3">
          <h2 className="section-title">Pay</h2>
          <SourceLabel kind="community" demo={demo} />
          {dims?.pay != null && (
            <div className="max-w-md">
              <ScoreBar
                label={DIMENSION_LABELS.pay}
                value={dims.pay}
                max={100}
              />
            </div>
          )}
          {company.payByDomain && company.payByDomain.length > 0 && (
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
          )}
          {sample != null && sample > 0 && (
            <p className="text-sm text-muted">
              {period ? formatPeriodLabel(period) : "Recent window"}
            </p>
          )}
        </section>
      )}

      <DimensionSection
        id="task-availability"
        title="Task Availability"
        value={
          sections.includes("taskAvailability")
            ? dims?.taskAvailability
            : null
        }
        sampleSize={sample}
        period={period}
        demo={demo}
        extra={
          sections.includes("taskAvailability") &&
          company.pulse?.availability &&
          (company.pulse.sampleSize ?? 0) > 0 ? (
            <dl className="mt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-muted">TaskPulse (last 7 days)</dt>
                <dd>
                  <AvailabilityPill status={company.pulse.availability} />
                </dd>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3">
                <dt className="text-muted">Pulse reports</dt>
                <dd className="num font-semibold">{company.pulse.sampleSize}</dd>
              </div>
            </dl>
          ) : null
        }
      />
      <DimensionSection
        id="project-stability"
        title="Project Stability"
        value={
          sections.includes("projectStability") ? dims?.projectStability : null
        }
        sampleSize={sample}
        period={period}
        demo={demo}
      />
      <DimensionSection
        id="payment-reliability"
        title="Payment Reliability"
        value={
          sections.includes("paymentReliability")
            ? dims?.paymentReliability
            : null
        }
        sampleSize={sample}
        period={period}
        demo={demo}
      />
      <DimensionSection
        id="reviewer-fairness"
        title="Reviewer Fairness"
        value={
          sections.includes("reviewerFairness") ? dims?.reviewerFairness : null
        }
        sampleSize={sample}
        period={period}
        demo={demo}
      />
      <DimensionSection
        id="guideline-clarity"
        title="Guideline Clarity"
        value={
          sections.includes("guidelineClarity") ? dims?.guidelineClarity : null
        }
        sampleSize={sample}
        period={period}
        demo={demo}
      />
      <DimensionSection
        id="support"
        title="Support"
        value={sections.includes("support") ? dims?.supportQuality : null}
        sampleSize={sample}
        period={period}
        demo={demo}
      />
      <DimensionSection
        id="transparency"
        title="Transparency"
        value={
          sections.includes("transparency") ? dims?.transparency : null
        }
        sampleSize={sample}
        period={period}
        demo={demo}
      />

      {sections.includes("reviews") && (
        <section id="reviews" className="space-y-3">
          <h2 className="section-title">Contributor Reviews</h2>
          <SourceLabel kind="community" demo={demo} />
          <div className="space-y-3">
            {visibleReviews.slice(0, 8).map((review) => (
              <article key={review.id} className="panel panel-pad">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-[1.0625rem] font-semibold leading-snug">
                    {review.title}
                  </h3>
                  <DemoBadge show={!!review.isDemo} />
                </div>
                <p className="mt-1 text-xs text-subtle">
                  {review.authorLabel}
                  {review.domain ? ` · ${review.domain.name}` : ""}
                </p>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                  {review.body}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}

      {sections.includes("issues") && (
        <section id="issues" className="panel panel-pad space-y-3">
          <h2 className="section-title">Issues & Resolution</h2>
          <SourceLabel kind="community" demo={demo} />
          {company.resolution && (
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs text-subtle">Public issues</dt>
                <dd className="num mt-0.5 font-semibold">
                  {company.resolution.sampleSize}
                </dd>
              </div>
              {company.resolution.responseRate != null && (
                <div>
                  <dt className="text-xs text-subtle">Response rate</dt>
                  <dd className="num mt-0.5 font-semibold">
                    {company.resolution.responseRate}%
                  </dd>
                </div>
              )}
              {company.resolution.resolutionRate != null && (
                <div>
                  <dt className="text-xs text-subtle">Resolution rate</dt>
                  <dd className="num mt-0.5 font-semibold">
                    {company.resolution.resolutionRate}%
                  </dd>
                </div>
              )}
              {company.resolution.resolutionScore != null && (
                <div>
                  <dt className="text-xs text-subtle">Resolution Score</dt>
                  <dd className="num mt-0.5 font-semibold">
                    {company.resolution.resolutionScore} / 100
                  </dd>
                </div>
              )}
              {company.resolution.medianResponseHours != null && (
                <div>
                  <dt className="text-xs text-subtle">Median response time</dt>
                  <dd className="num mt-0.5 font-semibold">
                    {company.resolution.medianResponseHours} hours
                  </dd>
                </div>
              )}
            </dl>
          )}
          {company.topIssues && company.topIssues.length > 0 && (
            <ul className="space-y-1 text-sm">
              {company.topIssues.map((issue) => (
                <li key={issue.category}>
                  {humanize(issue.category)}{" "}
                  <span className="num text-muted">({issue.count})</span>
                </li>
              ))}
            </ul>
          )}
          <p className="text-sm">
            <Link
              href={`/issues?company=${company.slug}`}
              className="font-semibold text-accent hover:underline"
            >
              Public issues for {company.name}
            </Link>
          </p>
        </section>
      )}

      {sections.includes("compare") && (
        <section id="compare" className="panel panel-pad space-y-3">
          <h2 className="section-title">Compare {company.name}</h2>
          <p className="text-sm text-muted">
            Permanent comparison pages for companies that share public work
            domains. Demo pairs stay noindex.
          </p>
          {comparable.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {comparable.map((other) => {
              const href =
                comparisonPath(company.slug, other.slug) ||
                `/compare?a=${company.slug}`;
              return (
                <li key={other.slug}>
                  <Link href={href} className="btn btn-secondary min-h-11">
                    Compare {company.name} and {other.name}
                  </Link>
                </li>
              );
            })}
          </ul>
          )}
          <p className="text-sm">
            <Link
              href={`/compare?a=${company.slug}`}
              className="font-semibold text-accent hover:underline"
            >
              Open the comparison tool
            </Link>
          </p>
        </section>
      )}

      {sections.includes("similar") && (
        <section id="similar" className="panel panel-pad space-y-3">
          <h2 className="section-title">Similar AI Work Companies</h2>
          <p className="text-sm text-muted">
            Companies that share work domains already present in public Happy
            Tasking data.
          </p>
          <ul className="flex flex-wrap gap-2">
            {similar.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/companies/${other.slug}`}
                  className="chip hover:border-border-strong"
                >
                  {other.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {sections.includes("taskmatch") && (
        <section id="taskmatch" className="panel panel-pad space-y-3">
          <h2 className="section-title">
            Find Opportunities That Match You
          </h2>
          <p className="text-sm text-muted">
            See whether {company.name} fits the skills and constraints on your
            profile. This is independent company intelligence, not a job
            advertisement.
          </p>
          <Link href="/taskmatch" className="btn btn-secondary min-h-11">
            See if {company.name} matches your skills
          </Link>
        </section>
      )}
    </article>
  );
}
