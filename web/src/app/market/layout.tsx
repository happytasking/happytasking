import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";

export const metadata: Metadata = canonicalMetadata("/market");

export default function MarketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
