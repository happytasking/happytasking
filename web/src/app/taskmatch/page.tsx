import type { Metadata } from "next";
import { firstQuery, loadPublicTaskMatch } from "@/lib/publicPages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { taskmatchPageMetadata } from "@/lib/taskmatchLanding";
import TaskMatchPage from "./TaskMatchPage";

export const revalidate = 120;

export const metadata: Metadata = taskmatchPageMetadata();

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initial = await loadPublicTaskMatch({
    country: firstQuery(sp.country),
    domain: firstQuery(sp.domain),
    company: firstQuery(sp.company),
    remote: firstQuery(sp.remote),
    includeUnspecified: firstQuery(sp.includeUnspecified),
    sort: firstQuery(sp.sort) || "newest",
    q: firstQuery(sp.q),
    workType: firstQuery(sp.workType),
  });
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "TaskMatch", path: "/taskmatch" },
          ]}
        />
      </div>
      <TaskMatchPage initial={initial} />
    </>
  );
}
