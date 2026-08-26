import type { Metadata } from "next";
import { publicPageMetadata } from "@/lib/seo";
import { loadCompanyDirectory } from "@/lib/publicCompanies";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompaniesDirectory } from "./CompaniesDirectory";

export const revalidate = 120;

export const metadata: Metadata = publicPageMetadata({
  path: "/companies",
  absoluteTitle:
    "AI Work Companies: Reviews, Pay & Task Availability | Happy Tasking",
  description:
    "Compare companies offering AI training, evaluation, coding, annotation and expert task work. Explore community-reported pay, task availability, stability and contributor experiences.",
});

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const directory = await loadCompanyDirectory({
    search: first(params.search),
    sort: first(params.sort),
    period: first(params.period),
    domain: first(params.domain),
    page: first(params.page) ? Number(first(params.page)) : 1,
  });

  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Companies", path: "/companies" },
          ]}
        />
      </div>
      <CompaniesDirectory initial={directory} />
    </>
  );
}
