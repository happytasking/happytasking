import type { Metadata } from "next";
import { canonicalMetadata, isCanonicalSegment } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  if (!isCanonicalSegment(publicId)) return {};
  return canonicalMetadata(`/issues/${publicId}`);
}

export default function IssueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
