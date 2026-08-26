import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { firstQuery, loadCommunityList } from "@/lib/publicPages";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import CommunityPage from "./CommunityPage";

export const revalidate = 120;

export const metadata: Metadata = publicPageMetadata({
  path: "/community",
  title: "Community",
  description:
    "Professional discussion for AI work — pay, availability, onboarding, and platforms. Share experience, not confidential work.",
});

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
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Community", path: "/community" },
          ]}
        />
      </div>
      <CommunityPage initial={initial} />
    </>
  );
}
