import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import { firstQuery, loadCommunityList } from "@/lib/publicPages";
import CommunityPage from "./CommunityPage";

export const revalidate = 120;

export const metadata: Metadata = {
  title: "Community",
  description:
    "Professional discussion for AI work — pay, availability, onboarding, and platforms. Share experience, not confidential work.",
  ...canonicalMetadata("/community"),
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initial = await loadCommunityList({
    sort: firstQuery(params.sort),
    company: firstQuery(params.company),
    page: firstQuery(params.page) ? Number(firstQuery(params.page)) : 1,
  });
  return <CommunityPage initial={initial} />;
}
