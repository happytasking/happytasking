import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicPageMetadata } from "@/lib/seo";
import { isCanonicalSegment } from "@/lib/site";
import { loadDiscussion } from "@/lib/publicPages";
import { ServerApiError } from "@/lib/serverApi";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isCanonicalSegment(id)) notFound();
  try {
    const discussion = await loadDiscussion(id);
    return publicPageMetadata({
      path: `/community/${id}`,
      title: discussion.title,
      description: discussion.body.slice(0, 160),
      index: !discussion.isDemo,
      follow: true,
    });
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}

export default function DiscussionLayout({
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
            { name: "Community", path: "/community" },
            { name: "Discussion", path: "/community" },
          ]}
        />
      </div>
      {children}
    </>
  );
}
