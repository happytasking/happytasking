import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";
import { isCanonicalSegment } from "@/lib/site";
import { mayIndexListedResource } from "@/lib/indexability";
import { loadCompany } from "@/lib/publicCompanies";
import { ServerApiError } from "@/lib/serverApi";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { ComparisonIntelligence } from "@/components/ComparisonIntelligence";
import {
  comparisonPageMetadata,
  comparisonSeoFromCompanies,
  normalizeComparisonPair,
  parseComparisonSlugCandidates,
} from "@/lib/comparisonSeo";
import type { Company } from "@/lib/types";

export const revalidate = 120;

type Props = {
  params: Promise<{ comparisonSlug: string }>;
};

async function tryLoadPair(
  a: string,
  b: string,
): Promise<{ first: Company; second: Company } | null> {
  try {
    const [first, second] = await Promise.all([loadCompany(a), loadCompany(b)]);
    return { first, second };
  } catch (error) {
    if (error instanceof ServerApiError && error.statusCode === 404) {
      return null;
    }
    throw error;
  }
}

const resolveComparison = cache(async (comparisonSlug: string) => {
  if (!isCanonicalSegment(comparisonSlug)) notFound();
  const candidates = parseComparisonSlugCandidates(comparisonSlug);
  if (candidates.length === 0) notFound();

  let loaded: { first: Company; second: Company } | null = null;
  for (const candidate of candidates) {
    loaded = await tryLoadPair(candidate.a, candidate.b);
    if (loaded) break;
  }
  if (!loaded) notFound();

  const pair = normalizeComparisonPair(loaded.first.slug, loaded.second.slug);
  if (!pair) notFound();
  const left = loaded.first.slug === pair.left ? loaded.first : loaded.second;
  const right = left === loaded.first ? loaded.second : loaded.first;
  return {
    left,
    right,
    slug: pair.slug,
    redirectTo:
      comparisonSlug === pair.slug ? null : `/compare/${pair.slug}`,
  };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { comparisonSlug } = await params;
  const { left, right, slug } = await resolveComparison(comparisonSlug);
  const eligibility = comparisonSeoFromCompanies(left, right);
  const listed = await mayIndexListedResource(
    "comparisons",
    slug,
    Boolean(left.isDemo || right.isDemo),
  );
  return comparisonPageMetadata(
    left,
    right,
    slug,
    eligibility.indexable && listed,
  );
}

export default async function Page({ params }: Props) {
  const { comparisonSlug } = await params;
  const { left, right, slug, redirectTo } =
    await resolveComparison(comparisonSlug);
  if (redirectTo) permanentRedirect(redirectTo);

  return (
    <>
      <div className="container-page">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Compare", path: "/compare" },
            {
              name: `${left.name} vs ${right.name}`,
              path: `/compare/${slug}`,
            },
          ]}
        />
      </div>
      <ComparisonIntelligence left={left} right={right} />
    </>
  );
}
