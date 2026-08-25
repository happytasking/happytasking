import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";

export const metadata: Metadata = canonicalMetadata("/companies");

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
