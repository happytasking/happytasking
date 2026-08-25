import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";

export const metadata: Metadata = canonicalMetadata("/community");

export default function CommunityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
