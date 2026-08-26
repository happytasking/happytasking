import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { firstQuery, loadIssueList } from "@/lib/publicPages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import IssuesPage from "./IssuesPage";

export const revalidate = 120;

export const metadata: Metadata = publicPageMetadata({
  path: "/issues",
  title: "AI work issues and resolution",
  description:
    "Structured resolution reports from AI work contributors — payment, support, and platform problems, separate from ordinary reviews.",
});

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
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Issues", path: "/issues" },
          ]}
        />
      </div>
      <IssuesPage initial={initial} />
    </>
  );
}
