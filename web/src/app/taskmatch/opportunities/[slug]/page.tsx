import { notFound } from "next/navigation";
import { isCanonicalSegment } from "@/lib/site";
import { loadOpportunity } from "@/lib/publicPages";
import { ServerApiError } from "@/lib/serverApi";
import OpportunityPage from "./OpportunityDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isCanonicalSegment(slug)) notFound();
  try {
    const item = await loadOpportunity(slug);
    return <OpportunityPage initial={item} />;
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      notFound();
    }
    return <OpportunityPage />;
  }
}
