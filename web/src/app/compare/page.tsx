import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { firstQuery, loadComparePage } from "@/lib/publicPages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import ComparePage from "./ComparePage";

export const revalidate = 120;

export const metadata: Metadata = publicPageMetadata({
  path: "/compare",
  title: "Compare AI work companies",
  description:
    "Put two AI work platforms side by side on reputation, pay reality, task availability, and the dimensions contributors actually report on.",
});

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = await loadComparePage(
    firstQuery(params.a),
    firstQuery(params.b),
  );
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
          ]}
        />
      </div>
      <ComparePage initial={initial} />
    </>
  );
}
