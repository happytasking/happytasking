import type { ComplaintStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import {
  companySEOEligibility,
  MIN_SITEMAP_DESCRIPTION_CHARS,
} from "./sitemap.eligibility.js";
import { comparisonSEOEligibility, selectComparisonPairs } from "./comparisonSeo.eligibility.js";

const PUBLIC_ISSUE_STATUSES: ComplaintStatus[] = [
  "PUBLISHED",
  "COMPANY_RESPONDED",
  "RESOLUTION_PENDING",
  "UNRESOLVED",
];

const MAX_PER_COLLECTION = 10_000;

export type SitemapEntry = {
  slug: string;
  lastModified: string;
};

export type IndexableSitemap = {
  companies: SitemapEntry[];
  skills: SitemapEntry[];
  opportunities: SitemapEntry[];
  comparisons: SitemapEntry[];
};

function toEntry(slug: string, date: Date): SitemapEntry {
  return { slug, lastModified: date.toISOString() };
}

/**
 * Public URLs that have enough unique content to belong in Google's index.
 * Demo, inactive, and empty shells are omitted.
 */
export async function getIndexableSitemap(): Promise<IndexableSitemap> {
  const [companies, skills, opportunities, comparisons] = await Promise.all([
    indexableCompanies(),
    indexableSkills(),
    indexableOpportunities(),
    indexableComparisons(),
  ]);

  return { companies, skills, opportunities, comparisons };
}

async function indexableCompanies(): Promise<SitemapEntry[]> {
  const rows = await prisma.company.findMany({
    where: { companyStatus: "ACTIVE", isDemo: false },
    select: {
      name: true,
      slug: true,
      updatedAt: true,
      description: true,
      website: true,
      companyStatus: true,
      isDemo: true,
      _count: {
        select: {
          reviews: { where: { isDemo: false } },
          payReports: { where: { isDemo: false } },
          availabilityReports: { where: { isDemo: false } },
          opportunities: { where: { status: "ACTIVE", isDemo: false } },
          complaints: {
            where: { isDemo: false, status: { in: PUBLIC_ISSUE_STATUSES } },
          },
        },
      },
    },
    take: MAX_PER_COLLECTION,
  });

  return rows
    .filter(
      (row) =>
        companySEOEligibility({
          name: row.name,
          slug: row.slug,
          status: row.companyStatus,
          isDemo: row.isDemo,
          description: row.description,
          website: row.website,
          reviews: row._count.reviews,
          payReports: row._count.payReports,
          availabilityReports: row._count.availabilityReports,
          opportunities: row._count.opportunities,
          complaints: row._count.complaints,
        }).includeInSitemap,
    )
    .map((row) => toEntry(row.slug, row.updatedAt));
}

async function indexableSkills(): Promise<SitemapEntry[]> {
  const rows = await prisma.skill.findMany({
    where: {
      opportunitySkills: {
        some: { opportunity: { status: "ACTIVE", isDemo: false } },
      },
    },
    select: { slug: true, createdAt: true },
    take: MAX_PER_COLLECTION,
  });

  return rows.map((row) => toEntry(row.slug, row.createdAt));
}

async function indexableOpportunities(): Promise<SitemapEntry[]> {
  const rows = await prisma.opportunity.findMany({
    where: {
      status: "ACTIVE",
      isDemo: false,
      company: { isDemo: false, companyStatus: "ACTIVE" },
      OR: [{ description: { not: "" } }, { skills: { some: {} } }],
    },
    select: { slug: true, updatedAt: true, description: true, _count: { select: { skills: true } } },
    take: MAX_PER_COLLECTION,
  });

  return rows
    .filter(
      (row) =>
        row.description.trim().length >= MIN_SITEMAP_DESCRIPTION_CHARS || row._count.skills > 0,
    )
    .map((row) => toEntry(row.slug, row.updatedAt));
}

async function indexableComparisons(): Promise<SitemapEntry[]> {
  const rows = await prisma.company.findMany({
    where: { companyStatus: "ACTIVE", isDemo: false },
    select: {
      id: true,
      name: true,
      slug: true,
      updatedAt: true,
      description: true,
      website: true,
      companyStatus: true,
      isDemo: true,
      _count: {
        select: {
          reviews: { where: { isDemo: false } },
          payReports: { where: { isDemo: false } },
          availabilityReports: { where: { isDemo: false } },
          opportunities: { where: { status: "ACTIVE", isDemo: false } },
          complaints: {
            where: { isDemo: false, status: { in: PUBLIC_ISSUE_STATUSES } },
          },
        },
      },
    },
    take: 80,
  });

  const eligible = rows.filter((row) =>
    companySEOEligibility({
      name: row.name,
      slug: row.slug,
      status: row.companyStatus,
      isDemo: row.isDemo,
      description: row.description,
      website: row.website,
      reviews: row._count.reviews,
      payReports: row._count.payReports,
      availabilityReports: row._count.availabilityReports,
      opportunities: row._count.opportunities,
      complaints: row._count.complaints,
    }).includeInSitemap,
  );
  if (eligible.length < 2) return [];

  const ids = eligible.map((row) => row.id);
  const [domainRows, payRows] = await Promise.all([
    prisma.opportunityDomain.findMany({
      where: { opportunity: { companyId: { in: ids } } },
      select: {
        opportunity: { select: { companyId: true } },
        domain: { select: { name: true } },
      },
    }),
    prisma.payReport.findMany({
      where: { companyId: { in: ids }, domainId: { not: null } },
      select: { companyId: true, domainId: true, domain: { select: { name: true } } },
      distinct: ["companyId", "domainId"],
    }),
  ]);

  const domains = new Map<string, string[]>();
  const add = (companyId: string, name?: string | null) => {
    if (!name) return;
    const list = domains.get(companyId) || [];
    if (!list.includes(name)) list.push(name);
    domains.set(companyId, list);
  };
  for (const row of domainRows) add(row.opportunity.companyId, row.domain.name);
  for (const row of payRows) add(row.companyId, row.domain?.name);

  const bySlug = new Map(eligible.map((row) => [row.slug, row]));
  return selectComparisonPairs(
    eligible.map((row) => ({
      slug: row.slug,
      domains: domains.get(row.id) || [],
      updatedAt: row.updatedAt,
    })),
  )
    .filter((pair) => {
      const left = bySlug.get(pair.left);
      const right = bySlug.get(pair.right);
      if (!left || !right) return false;
      return comparisonSEOEligibility(
        {
          name: left.name,
          slug: left.slug,
          status: left.companyStatus,
          isDemo: left.isDemo,
          description: left.description,
          website: left.website,
          reviews: left._count.reviews,
          payReports: left._count.payReports,
          availabilityReports: left._count.availabilityReports,
          opportunities: left._count.opportunities,
          complaints: left._count.complaints,
        },
        {
          name: right.name,
          slug: right.slug,
          status: right.companyStatus,
          isDemo: right.isDemo,
          description: right.description,
          website: right.website,
          reviews: right._count.reviews,
          payReports: right._count.payReports,
          availabilityReports: right._count.availabilityReports,
          opportunities: right._count.opportunities,
          complaints: right._count.complaints,
        },
      ).includeInSitemap;
    })
    .map((pair) => toEntry(pair.slug, pair.lastModified));
}
