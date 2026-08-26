import Link from "next/link";
import { DemoBadge } from "@/components/DemoBadge";
import { JsonLd } from "@/components/JsonLd";
import { GuideMdx } from "@/components/guides/GuideMdx";
import { GuideReferences } from "@/components/guides/GuideReferences";
import { formatDate, humanize } from "@/lib/format";
import { guideArticleJsonLd } from "@/lib/guideSeo";
import type { Guide } from "@/lib/guides";

export function GuideArticle({
  guide,
  relatedGuides,
}: {
  guide: Guide;
  relatedGuides: Guide[];
}) {
  const indexable = guide.seo.indexable;
  const showUpdated = guide.dateModified !== guide.datePublished;
  const companies = guide.relatedCompanies.slice(0, 6);
  const skills = guide.relatedSkills.slice(0, 8);

  return (
    <article className="container-page max-w-3xl space-y-6">
      {indexable ? <JsonLd data={guideArticleJsonLd(guide)} /> : null}
      <header className="space-y-3">
        <p className="eyebrow">{guide.category}</p>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="page-title">{guide.title}</h1>
          <DemoBadge show={guide.demo} />
        </div>
        <p className="text-base leading-relaxed text-muted">{guide.description}</p>
        <p className="text-sm text-subtle">
          Written by{" "}
          {guide.authorUrl ? (
            <a
              href={guide.authorUrl}
              className="font-semibold text-accent hover:underline"
              rel="noreferrer"
              target="_blank"
            >
              {guide.author}
            </a>
          ) : (
            <span className="font-medium text-foreground">{guide.author}</span>
          )}
        </p>
        <p className="text-xs text-subtle">
          Published {formatDate(guide.datePublished)}
          {showUpdated ? ` · Updated ${formatDate(guide.dateModified)}` : ""}
          {guide.readingTime ? ` · ${guide.readingTime} min read` : ""}
        </p>
      </header>

      <GuideMdx source={guide.body} />

      <GuideReferences sources={guide.sources} />

      {companies.length > 0 && (
        <section className="panel panel-pad space-y-3">
          <h2 className="section-title">Related Companies</h2>
          <ul className="flex flex-wrap gap-2">
            {companies.map((slug) => (
              <li key={slug}>
                <Link
                  href={`/companies/${slug}`}
                  className="btn btn-secondary min-h-11"
                >
                  {humanize(slug)} reviews, pay and task availability
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {relatedGuides.length > 0 && (
        <section className="panel panel-pad space-y-3">
          <h2 className="section-title">Related Guides</h2>
          <ul className="space-y-2 text-sm">
            {relatedGuides.map((other) => (
              <li key={other.slug}>
                <Link
                  href={`/guides/${other.slug}`}
                  className="font-semibold text-accent hover:underline"
                >
                  {other.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {skills.length > 0 && (
        <section className="panel panel-pad space-y-3">
          <h2 className="section-title">Related Skills</h2>
          <ul className="flex flex-wrap gap-2">
            {skills.map((slug) => (
              <li key={slug}>
                <Link href={`/skills/${slug}`} className="chip">
                  {slug.replace(/-/g, " ")}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">Looking for AI work that fits your skills?</h2>
        <p className="text-sm text-muted">
          Build your AI Work Profile and see which opportunities match your
          experience, location and availability.
        </p>
        <Link href="/taskmatch" className="btn btn-secondary min-h-11">
          Find my matches
        </Link>
      </section>

      <section className="panel panel-pad space-y-3">
        <h2 className="section-title">Have experience with AI work?</h2>
        <p className="text-sm text-muted">
          Share what you have learned with the Happy Tasking community. Do not
          include confidential task or client material.
        </p>
        <Link href="/community" className="btn btn-secondary min-h-11">
          Join the community
        </Link>
      </section>
    </article>
  );
}
