import type { Metadata } from "next";
import { privatePageMetadata } from "@/lib/site";

export const metadata: Metadata = privatePageMetadata();

export default function TaskMatchProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
