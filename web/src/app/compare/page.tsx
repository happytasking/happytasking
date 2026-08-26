import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { publicPageMetadata } from "@/lib/seo";
import { firstQuery, loadComparePage } from "@/lib/publicPages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { comparisonPath } from "@/lib/comparisonSeo";
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
  const a = firstQuery(params.a);
  const b = firstQuery(params.b);
  const initial = await loadComparePage(a, b);

  if (initial.a && initial.b) {
    const path = comparisonPath(
      initial.a.company.slug,
      initial.b.company.slug,
    );
    if (path) permanentRedirect(path);
  }

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
