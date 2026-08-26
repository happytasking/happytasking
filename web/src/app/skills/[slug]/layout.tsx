import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { isCanonicalSegment } from "@/lib/site";
import { isListedInSitemap } from "@/lib/indexability";
import { humanize } from "@/lib/format";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isCanonicalSegment(slug)) return {};
  const name = humanize(slug.replace(/-/g, " "));
  const index = await isListedInSitemap("skills", slug);
  return publicPageMetadata({
    path: `/skills/${slug}`,
    title: `${name} AI work opportunities`,
    description: `Active AI work opportunities on Happy Tasking that mention ${name}.`,
    index,
    follow: true,
  });
}

export default async function SkillLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = humanize(slug.replace(/-/g, " "));
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "TaskMatch", path: "/taskmatch" },
            { name, path: `/skills/${slug}` },
          ]}
        />
      </div>
      {children}
    </>
  );
}
