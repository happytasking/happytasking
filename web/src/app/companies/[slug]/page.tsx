import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isCanonicalSegment } from "@/lib/site";
import { mayIndexListedResource } from "@/lib/indexability";
import {
  companyPageMetadata,
  companySEOEligibility,
  companySeoInputFromCompany,
} from "@/lib/companySeo";
import { loadCompany, loadCompanyReviews } from "@/lib/publicCompanies";
import { ServerApiError } from "@/lib/serverApi";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CompanyIntelligence } from "@/components/CompanyIntelligence";
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

async function companyIndexable(
  slug: string,
  company: Awaited<ReturnType<typeof loadCompany>>,
) {
  const eligibility = company.seo
    ? company.seo
    : companySEOEligibility(companySeoInputFromCompany(company));
  if (!eligibility.indexable || company.isDemo) return false;
  return mayIndexListedResource("companies", slug, Boolean(company.isDemo));
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { period = "90d" } = await searchParams;
  const company = await companyOrNotFound(slug, period);
  const index = await companyIndexable(slug, company);
  return companyPageMetadata(company, index);
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { period = "90d" } = await searchParams;
  const company = await companyOrNotFound(slug, period);
  const [reviews, indexable] = await Promise.all([
    loadCompanyReviews(slug, 8),
    companyIndexable(slug, company),
  ]);

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
      <CompanyIntelligence
        company={company}
        reviews={reviews.items}
        indexable={indexable}
      />
      <CompanyDetailPage key={company.slug} initialCompany={company} showHeader={false} />
    </>
  );
}
