import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";

export const metadata: Metadata = canonicalMetadata("/for-companies");

export default function ForCompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
