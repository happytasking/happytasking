import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicPageMetadata } from "@/lib/seo";
import { isCanonicalSegment } from "@/lib/site";
import { mayIndexListedResource } from "@/lib/indexability";
import { loadOpportunity } from "@/lib/publicPages";
import { ServerApiError } from "@/lib/serverApi";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isCanonicalSegment(slug)) notFound();
  try {
    const item = await loadOpportunity(slug);
    const index = await mayIndexListedResource(
      "opportunities",
      slug,
      Boolean(item.isDemo || item.company.isDemo),
    );
    const demoNote = item.isDemo
      ? " Illustrative demo listing — not a live hiring pipeline."
      : "";
    return publicPageMetadata({
      path: `/taskmatch/opportunities/${slug}`,
      title: item.title,
      description:
        (item.description ||
          `${item.title} at ${item.company.name} on Happy Tasking TaskMatch.`) +
        demoNote,
      index,
      follow: true,
    });
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}

export default function OpportunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "TaskMatch", path: "/taskmatch" },
            { name: "Opportunity", path: "/taskmatch" },
          ]}
        />
      </div>
      {children}
    </>
  );
}
