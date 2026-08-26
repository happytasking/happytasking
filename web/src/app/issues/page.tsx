import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import { firstQuery, loadIssueList } from "@/lib/publicPages";
import IssuesPage from "./IssuesPage";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "AI work issues and resolution",
  description:
    "Structured resolution reports from AI work contributors — payment, support, and platform problems, separate from ordinary reviews.",
  ...canonicalMetadata("/issues"),
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = await loadIssueList({
    company: firstQuery(params.company),
    page: firstQuery(params.page) ? Number(firstQuery(params.page)) : 1,
  });
  return <IssuesPage initial={initial} />;
}
