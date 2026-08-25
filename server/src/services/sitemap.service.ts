import type { ComplaintStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const PUBLIC_ISSUE_STATUSES: ComplaintStatus[] = [
  "PUBLISHED",
  "COMPANY_RESPONDED",
  "RESOLUTION_PENDING",
  "UNRESOLVED",
];

const MAX_PER_COLLECTION = 10_000;
const MIN_DESCRIPTION_CHARS = 40;

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
    .filter((row) => {
      const counts = row._count;
      return (
        row.description.trim().length >= MIN_DESCRIPTION_CHARS ||
        counts.reviews > 0 ||
        counts.payReports > 0 ||
        counts.availabilityReports > 0 ||
        counts.opportunities > 0 ||
        counts.complaints > 0
      );
    })
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
        row.description.trim().length >= MIN_DESCRIPTION_CHARS || row._count.skills > 0,
    )
    .map((row) => toEntry(row.slug, row.updatedAt));
}
