import type { Metadata } from "next";
import { canonicalMetadata, isCanonicalSegment } from "@/lib/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!isCanonicalSegment(slug)) return {};
  return canonicalMetadata(`/skills/${slug}`);
}

export default function SkillLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
