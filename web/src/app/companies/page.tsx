import type { Metadata } from "next";
import { canonicalMetadata } from "@/lib/site";
import { loadCompanyDirectory } from "@/lib/publicCompanies";
import { CompaniesDirectory } from "./CompaniesDirectory";

export const revalidate = 120;

export const metadata: Metadata = {
  title: {
    absolute:
      "AI Work Companies: Reviews, Pay & Task Availability | Happy Tasking",
  },
  description:
    "Compare companies offering AI training, evaluation, coding, annotation and expert task work. Explore community-reported pay, task availability, stability and contributor experiences.",
  ...canonicalMetadata("/companies"),
};

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

  return <CompaniesDirectory initial={directory} />;
}
