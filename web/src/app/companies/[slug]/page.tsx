import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { canonicalMetadata, isCanonicalSegment } from "@/lib/site";
import { loadCompany } from "@/lib/publicCompanies";
import { ServerApiError } from "@/lib/serverApi";
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
  const demoNote = company.isDemo
    ? " Illustrative demo data — not production metrics."
    : "";
  return {
    title: company.isDemo
      ? `${company.name} (demo data)`
      : `${company.name} reviews, pay and task availability`,
    description:
      (company.description ||
        `Public community reports about ${company.name} on Happy Tasking.`) +
      demoNote,
    ...canonicalMetadata(`/companies/${slug}`),
    robots: company.isDemo ? { index: false, follow: true } : undefined,
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { slug } = await params;
  const { period = "90d" } = await searchParams;
  const company = await companyOrNotFound(slug, period);
  return <CompanyDetailPage key={company.slug} initialCompany={company} />;
}
