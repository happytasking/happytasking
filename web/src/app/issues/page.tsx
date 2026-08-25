import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import IssuesPage from "./IssuesPage";

export const metadata: Metadata = canonicalMetadata("/issues");

export default function Page() {
  return <IssuesPage />;
}
