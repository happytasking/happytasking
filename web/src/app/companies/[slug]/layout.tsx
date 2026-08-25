import type { Metadata } from "next";
import { canonicalMetadata, isCanonicalSegment } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isCanonicalSegment(slug)) return {};
  return canonicalMetadata(`/companies/${slug}`);
}

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
