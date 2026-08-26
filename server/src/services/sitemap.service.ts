import type { ComplaintStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { companyHasIndexableContent, MIN_SITEMAP_DESCRIPTION_CHARS } from "./sitemap.eligibility.js";

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
};

function toEntry(slug: string, date: Date): SitemapEntry {
  return { slug, lastModified: date.toISOString() };
}

/**
 * Public URLs that have enough unique content to belong in Google's index.
 * Demo, inactive, and empty shells are omitted.
 */
export async function getIndexableSitemap(): Promise<IndexableSitemap> {
  const [companies, skills, opportunities] = await Promise.all([
    indexableCompanies(),
    indexableSkills(),
    indexableOpportunities(),
  ]);

  return { companies, skills, opportunities };
}

async function indexableCompanies(): Promise<SitemapEntry[]> {
  const rows = await prisma.company.findMany({
    where: { companyStatus: "ACTIVE", isDemo: false },
    select: {
      slug: true,
      updatedAt: true,
      description: true,
      _count: {
        select: {
          reviews: { where: { isDemo: false } },
          payReports: true,
          availabilityReports: true,
          opportunities: { where: { status: "ACTIVE", isDemo: false } },
          complaints: { where: { status: { in: PUBLIC_ISSUE_STATUSES } } },
        },
      },
    },
    take: MAX_PER_COLLECTION,
  });

  return rows
    .filter((row) =>
      companyHasIndexableContent({
        description: row.description,
        reviews: row._count.reviews,
        payReports: row._count.payReports,
        availabilityReports: row._count.availabilityReports,
        opportunities: row._count.opportunities,
        complaints: row._count.complaints,
      }),
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
