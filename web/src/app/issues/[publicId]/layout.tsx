import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicPageMetadata } from "@/lib/seo";
import { isCanonicalSegment } from "@/lib/site";
import { loadIssue } from "@/lib/publicPages";
import { ServerApiError } from "@/lib/serverApi";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  if (!isCanonicalSegment(publicId)) notFound();
  try {
    const issue = await loadIssue(publicId);
    const index = !issue.isDemo && issue.isPublic !== false;
    return publicPageMetadata({
      path: `/issues/${publicId}`,
      title: issue.title,
      description: issue.body.slice(0, 160),
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

export default function IssueLayout({
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
            { name: "Issues", path: "/issues" },
            { name: "Report", path: "/issues" },
          ]}
        />
      </div>
      {children}
    </>
  );
}
