import type { Metadata } from "next";
import { canonicalMetadata, isCanonicalSegment } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!isCanonicalSegment(id)) return {};
  return canonicalMetadata(`/community/${id}`);
}

export default function DiscussionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
