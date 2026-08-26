import type { Metadata } from "next";
import Link from "next/link";
import { publicPageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GuideCard } from "@/components/guides/GuideCard";
import { guidesByCategory, loadPublishedGuides } from "@/lib/guides";

export const revalidate = 3600;

export const metadata: Metadata = publicPageMetadata({
  path: "/guides",
  title: "AI Work Guides",
  description:
    "Practical guides for understanding AI training, evaluation, remote expert work, screenings, pay, platforms and AI-work careers.",
});

export default async function GuidesIndexPage() {
  const published = await loadPublishedGuides();
  const featured = published.filter((guide) => guide.featured);
  const rest = published.filter((guide) => !guide.featured);
  const groups = guidesByCategory(rest);

  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
          ]}
        />
      </div>
      <div className="container-page max-w-3xl space-y-8 pb-10">
        <header className="space-y-3">
          <p className="eyebrow">Editorial</p>
          <h1 className="page-title">AI Work Guides</h1>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Practical guides for understanding AI training, evaluation, remote
            expert work, screenings, pay, platforms and AI-work careers. Happy
            Tasking publishes original explainers when they are ready — not
            keyword pages.
          </p>
        </header>

        {featured.length > 0 && (
          <section className="space-y-3">
            <h2 className="section-title">Featured Guides</h2>
            <div className="grid gap-4">
              {featured.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        )}

        {groups.map((group) => (
          <section key={group.category} className="space-y-3">
            <h2 className="section-title">{group.category}</h2>
            <div className="grid gap-4">
              {group.guides.map((guide) => (
                <GuideCard key={guide.slug} guide={guide} />
              ))}
            </div>
          </section>
        ))}

        {published.length === 0 && (
          <section className="panel panel-pad space-y-3">
            <h2 className="section-title">Guides in progress</h2>
            <p className="text-sm text-muted">
              No published guides yet. Meanwhile you can explore companies,
              compare platforms, or use TaskMatch.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/companies" className="btn btn-secondary min-h-11">
                Company directory
              </Link>
              <Link href="/compare" className="btn btn-secondary min-h-11">
                Compare companies
              </Link>
              <Link href="/taskmatch" className="btn btn-secondary min-h-11">
                TaskMatch
              </Link>
              <Link href="/methodology" className="btn btn-secondary min-h-11">
                Methodology
              </Link>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
