import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import { firstQuery, loadComparePage } from "@/lib/publicPages";
import ComparePage from "./ComparePage";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Compare AI work companies",
  description:
    "Put two AI work platforms side by side on reputation, pay reality, task availability, and the dimensions contributors actually report on.",
  ...canonicalMetadata("/compare"),
};

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
  return <ComparePage initial={initial} />;
}
