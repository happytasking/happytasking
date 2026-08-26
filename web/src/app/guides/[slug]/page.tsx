import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCanonicalSegment } from "@/lib/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { GuideArticle } from "@/components/guides/GuideArticle";
import { guidePageMetadata } from "@/lib/guideSeo";
import {
  loadPublicGuide,
  loadPublishedGuides,
  relatedPublishedGuides,
} from "@/lib/guides";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const published = await loadPublishedGuides();
  return published.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await loadPublicGuide(slug);
  if (!guide) notFound();
  return guidePageMetadata(guide, guide.seo.indexable);
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  if (!isCanonicalSegment(slug)) notFound();
  const guide = await loadPublicGuide(slug);
  if (!guide) notFound();
  const catalog = await loadPublishedGuides();
  const related = relatedPublishedGuides(guide, catalog, 4);

  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Guides", path: "/guides" },
            { name: guide.title, path: `/guides/${guide.slug}` },
          ]}
        />
      </div>
      <GuideArticle guide={guide} relatedGuides={related} />
    </>
  );
}
