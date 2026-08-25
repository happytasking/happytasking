import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";

export const metadata: Metadata = canonicalMetadata("/compare");

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
