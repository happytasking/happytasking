import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { publicPageMetadata } from "@/lib/seo";
import { isCanonicalSegment } from "@/lib/site";
import { mayIndexListedResource } from "@/lib/indexability";
import { loadCompany } from "@/lib/publicCompanies";
import { ServerApiError } from "@/lib/serverApi";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompanyDetailPage } from "./CompanyDetailPage";

export const revalidate = 120;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ period?: string }>;
};

async function companyOrNotFound(slug: string, period: string) {
  if (!isCanonicalSegment(slug)) notFound();
  try {
    return await loadCompany(slug, period);
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      notFound();
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { period = "90d" } = await searchParams;
  const company = await companyOrNotFound(slug, period);
  const index = await mayIndexListedResource(
    "companies",
    slug,
    Boolean(company.isDemo),
  );
  const demoNote = company.isDemo
    ? " Illustrative demo data — not production metrics."
    : "";
  return publicPageMetadata({
    path: `/companies/${slug}`,
    title: company.isDemo
      ? `${company.name} (demo data)`
      : `${company.name} reviews, pay and task availability`,
    description:
      (company.description ||
        `Public community reports about ${company.name} on Happy Tasking.`) +
      demoNote,
    index,
    follow: true,
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { period = "90d" } = await searchParams;
  const company = await companyOrNotFound(slug, period);
  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Companies", path: "/companies" },
            { name: company.name, path: `/companies/${company.slug}` },
          ]}
        />
      </div>
      <CompanyDetailPage key={company.slug} initialCompany={company} />
    </>
  );
}
